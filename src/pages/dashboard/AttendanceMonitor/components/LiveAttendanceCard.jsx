import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Camera,
  CheckCircle2,
  Clock3,
  Fingerprint,
  ScanFace,
  ShieldCheck,
  UserCheck,
  Wifi,
} from "lucide-react";

import {
  FaceDetector,
  FilesetResolver,
} from "@mediapipe/tasks-vision";

import { toast } from "react-hot-toast";
import StatusDot from "./StatusDot";

const SEARCH_URL = "/py-api/api/students/attendance";

const DETAIL_TIME = 3000;
const RECOGNITION_INTERVAL = 700;

/*
 * Minimum MediaPipe face detection confidence.
 */
const FACE_CONFIDENCE = 0.65;

/*
 * Backend attendance confidence requirement.
 */
const ATTENDANCE_CONFIDENCE_THRESHOLD = 90;

/*
 * MediaPipe model.
 */
const FACE_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite";

/*
 * MediaPipe WASM.
 */
const WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";

export default function LiveAttendanceCard({
  baseUri = "",
  accessToken,
  databaseOnline,
  onAttendanceDetected,
}) {
  // =========================================================
  // REFS
  // =========================================================

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const streamRef = useRef(null);
  const faceDetectorRef = useRef(null);

  const faceLoopRef = useRef(null);
  const recognitionTimerRef = useRef(null);
  const studentTimerRef = useRef(null);

  const processingFaceRef = useRef(false);

  const faceBoxesRef = useRef([]);
  const faceDetectedRef = useRef(false);
  const faceConfidenceRef = useRef(0);

  const recognizedStudentsRef = useRef(new Map());
  const capturedTimeoutsRef = useRef(new Map());

  // =========================================================
  // STATE
  // =========================================================

  const [cameraOnline, setCameraOnline] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const [faceDetected, setFaceDetected] = useState(false);
  const [faceConfidence, setFaceConfidence] = useState(0);

  const [detectedFaces, setDetectedFaces] = useState([]);

  const [faceEngineReady, setFaceEngineReady] =
    useState(false);

  const [faceEngineError, setFaceEngineError] =
    useState("");

  const [scanning, setScanning] = useState(false);

  const [student, setStudent] = useState(null);
  const [showStudent, setShowStudent] = useState(false);

  const [capturedFaces, setCapturedFaces] = useState([]);

  // =========================================================
  // CAMERA
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error(
            "Camera is not supported by this browser."
          );
        }

        const stream =
          await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: {
                ideal: "user",
              },

              /*
               * Request high-resolution camera feed.
               *
               * Browser/camera may choose the closest
               * supported resolution.
               */
              width: {
                ideal: 1280,
                min: 640,
              },

              height: {
                ideal: 720,
                min: 480,
              },

              frameRate: {
                ideal: 30,
                max: 30,
              },
            },

            audio: false,
          });

        if (cancelled) {
          stream
            .getTracks()
            .forEach((track) => track.stop());

          return;
        }

        streamRef.current = stream;

        const video = videoRef.current;

        if (!video) {
          throw new Error(
            "Video element not available."
          );
        }

        video.srcObject = stream;

        await new Promise((resolve) => {
          if (video.readyState >= 1) {
            resolve();
            return;
          }

          const handleLoadedMetadata = () => {
            video.removeEventListener(
              "loadedmetadata",
              handleLoadedMetadata
            );

            resolve();
          };

          video.addEventListener(
            "loadedmetadata",
            handleLoadedMetadata
          );
        });

        if (!cancelled) {
          await video.play();

          /*
           * Debug:
           * Shows the ACTUAL camera resolution.
           */
          console.log(
            "Actual camera resolution:",
            `${video.videoWidth} x ${video.videoHeight}`,
            `ratio=${(
              video.videoWidth /
              video.videoHeight
            ).toFixed(3)}`
          );

          /*
           * Also show MediaStream track settings.
           */
          const track =
            stream.getVideoTracks()[0];

          if (track) {
            console.log(
              "Camera track settings:",
              track.getSettings()
            );
          }

          setCameraOnline(true);
          setCameraError("");
        }
      } catch (error) {
        console.error(
          "Camera error:",
          error
        );

        if (cancelled) {
          return;
        }

        setCameraOnline(false);

        setCameraError(
          error?.message ||
            "Camera permission is required."
        );
      }
    }

    startCamera();

    return () => {
      cancelled = true;

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());

        streamRef.current = null;
      }

      const video = videoRef.current;

      if (video) {
        video.srcObject = null;
      }
    };
  }, []);

  // =========================================================
  // MEDIAPIPE INITIALIZATION
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    async function initializeFaceDetector() {
      try {
        setFaceEngineReady(false);
        setFaceEngineError("");

        console.log(
          "Loading MediaPipe..."
        );

        const vision =
          await FilesetResolver.forVisionTasks(
            WASM_URL
          );

        let detector = null;

        // -----------------------------------------------------
        // GPU
        // -----------------------------------------------------

        try {
          console.log(
            "Trying GPU face detector..."
          );

          detector =
            await FaceDetector.createFromOptions(
              vision,
              {
                baseOptions: {
                  modelAssetPath:
                    FACE_MODEL_URL,

                  delegate: "GPU",
                },

                runningMode: "VIDEO",

                minDetectionConfidence:
                  FACE_CONFIDENCE,

                minSuppressionThreshold: 0.3,
              }
            );

          console.log(
            "GPU face detector ready."
          );
        } catch (gpuError) {
          console.warn(
            "GPU initialization failed. Using CPU.",
            gpuError
          );

          // ---------------------------------------------------
          // CPU
          // ---------------------------------------------------

          detector =
            await FaceDetector.createFromOptions(
              vision,
              {
                baseOptions: {
                  modelAssetPath:
                    FACE_MODEL_URL,

                  delegate: "CPU",
                },

                runningMode: "VIDEO",

                minDetectionConfidence:
                  FACE_CONFIDENCE,

                minSuppressionThreshold: 0.3,
              }
            );

          console.log(
            "CPU face detector ready."
          );
        }

        if (cancelled) {
          try {
            detector?.close();
          } catch {}

          return;
        }

        faceDetectorRef.current =
          detector;

        setFaceEngineReady(true);
        setFaceEngineError("");

        console.log(
          "Face detector READY."
        );
      } catch (error) {
        console.error(
          "Face detector initialization failed:",
          error
        );

        if (!cancelled) {
          setFaceEngineReady(false);

          setFaceEngineError(
            error?.message ||
              "Face detection engine failed to load."
          );
        }
      }
    }

    initializeFaceDetector();

    return () => {
      cancelled = true;

      if (faceDetectorRef.current) {
        try {
          faceDetectorRef.current.close();
        } catch {}

        faceDetectorRef.current =
          null;
      }
    };
  }, []);

  // =========================================================
  // FACE DETECTION LOOP
  // =========================================================

  useEffect(() => {
    if (
      !cameraOnline ||
      !faceEngineReady
    ) {
      return;
    }

    let cancelled = false;
    let lastVideoTime = -1;

    function detectFace() {
      if (cancelled) {
        return;
      }

      const video = videoRef.current;
      const detector =
        faceDetectorRef.current;

      if (
        !video ||
        !detector ||
        video.readyState <
          HTMLMediaElement.HAVE_CURRENT_DATA ||
        video.videoWidth <= 0 ||
        video.videoHeight <= 0
      ) {
        faceLoopRef.current =
          requestAnimationFrame(
            detectFace
          );

        return;
      }

      try {
        /*
         * Only process a new video frame.
         */
        if (
          video.currentTime !==
          lastVideoTime
        ) {
          const result =
            detector.detectForVideo(
              video,
              performance.now()
            );

          lastVideoTime =
            video.currentTime;

          const detections =
            result?.detections || [];

          const validFaces =
            detections
              .map(
                (
                  detection,
                  index
                ) => {
                  const score =
                    Number(
                      detection
                        ?.categories?.[0]
                        ?.score
                    ) || 0;

                  const box =
                    detection?.boundingBox;

                  if (
                    !box ||
                    box.width <= 10 ||
                    box.height <= 10 ||
                    score <
                      FACE_CONFIDENCE
                  ) {
                    return null;
                  }

                  return {
                    id:
                      `${index}-${Math.round(
                        box.originX
                      )}-${Math.round(
                        box.originY
                      )}`,

                    x:
                      Number(
                        box.originX
                      ) || 0,

                    y:
                      Number(
                        box.originY
                      ) || 0,

                    width:
                      Number(
                        box.width
                      ) || 0,

                    height:
                      Number(
                        box.height
                      ) || 0,

                    confidence:
                      score,
                  };
                }
              )
              .filter(Boolean);

          // ---------------------------------------------------
          // SAVE ALL FACES
          // ---------------------------------------------------

          faceBoxesRef.current =
            validFaces;

          setDetectedFaces(
            validFaces
          );

          // ---------------------------------------------------
          // LARGEST FACE
          // ---------------------------------------------------

          const largestFace =
            validFaces.reduce(
              (
                largest,
                current
              ) => {
                if (!largest) {
                  return current;
                }

                const currentArea =
                  current.width *
                  current.height;

                const largestArea =
                  largest.width *
                  largest.height;

                return currentArea >
                  largestArea
                  ? current
                  : largest;
              },
              null
            );

          if (largestFace) {
            faceConfidenceRef.current =
              largestFace.confidence;
          } else {
            faceConfidenceRef.current =
              0;
          }

          // ---------------------------------------------------
          // STATUS
          // ---------------------------------------------------

          const hasFaces =
            validFaces.length > 0;

          faceDetectedRef.current =
            hasFaces;

          setFaceDetected(
            hasFaces
          );

          const maxConfidence =
            validFaces.length > 0
              ? Math.max(
                  ...validFaces.map(
                    (face) =>
                      face.confidence
                  )
                )
              : 0;

          faceConfidenceRef.current =
            maxConfidence;

          setFaceConfidence(
            maxConfidence
          );

          // ---------------------------------------------------
          // NO FACE
          // ---------------------------------------------------

          if (!hasFaces) {
            faceBoxesRef.current =
              [];

            setDetectedFaces([]);

            setFaceDetected(false);
            setFaceConfidence(0);

            setScanning(false);
          }
        }
      } catch (error) {
        console.error(
          "Face detection error:",
          error
        );
      }

      faceLoopRef.current =
        requestAnimationFrame(
          detectFace
        );
    }

    faceLoopRef.current =
      requestAnimationFrame(
        detectFace
      );

    return () => {
      cancelled = true;

      if (faceLoopRef.current) {
        cancelAnimationFrame(
          faceLoopRef.current
        );

        faceLoopRef.current =
          null;
      }
    };
  }, [
    cameraOnline,
    faceEngineReady,
  ]);

  // =========================================================
  // FACE CROP
  // =========================================================

const createFaceCrop = useCallback(async () => {
  const video = videoRef.current;
  const canvas = canvasRef.current;

  if (!video || !canvas) {
    return null;
  }

  const videoWidth = video.videoWidth;
  const videoHeight = video.videoHeight;

  if (videoWidth <= 0 || videoHeight <= 0) {
    return null;
  }

  // =============================================
  // FULL ORIGINAL CAMERA FRAME
  // =============================================

  canvas.width = videoWidth;
  canvas.height = videoHeight;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(
    video,
    0,
    0,
    videoWidth,
    videoHeight
  );

  // =============================================
  // JPEG - HIGH QUALITY
  // =============================================

  const blob = await new Promise((resolve) => {
    canvas.toBlob(
      resolve,
      "image/jpeg",
      0.98
    );
  });

  if (!blob) {
    return null;
  }

  console.log("FULL FRAME:", {
    source: `${videoWidth}x${videoHeight}`,
    output: `${videoWidth}x${videoHeight}`,
    blobKB: (blob.size / 1024).toFixed(1),
    type: blob.type,
  });

  return {
    blob,

    // Full frame, no crop
    crop: {
      x: 0,
      y: 0,
      width: videoWidth,
      height: videoHeight,
    },

    output: {
      width: videoWidth,
      height: videoHeight,
    },

    source: {
      width: videoWidth,
      height: videoHeight,
    },
  };
}, []);



  // =========================================================
  // CAPTURE PREVIEW
  // =========================================================

  const addCapturedFace =
    useCallback(
      (
        blob,
        confidence,
        index
      ) => {
        const url =
          URL.createObjectURL(
            blob
          );

        const id =
          `${Date.now()}-${index}-${Math.random()
            .toString(36)
            .slice(2)}`;

        setCapturedFaces(
          (current) => [
            ...current.slice(-5),

            {
              id,
              url,
              confidence,
              index:
                index + 1,
            },
          ]
        );

        const timeoutId =
          window.setTimeout(
            () => {
              setCapturedFaces(
                (current) => {
                  const item =
                    current.find(
                      (
                        entry
                      ) =>
                        entry.id ===
                        id
                    );

                  if (item) {
                    URL.revokeObjectURL(
                      item.url
                    );
                  }

                  return current.filter(
                    (
                      entry
                    ) =>
                      entry.id !==
                      id
                  );
                }
              );

              capturedTimeoutsRef.current.delete(
                id
              );
            },
            4000
          );

        capturedTimeoutsRef.current.set(
          id,
          timeoutId
        );
      },
      []
    );

  // =========================================================
  // BACKEND ERROR MESSAGE
  // =========================================================

  const getApiErrorMessage =
    useCallback(
      async (response) => {
        try {
          const data =
            await response.json();

          if (
            typeof data?.detail ===
            "string"
          ) {
            return data.detail;
          }

          if (
            data?.detail?.message
          ) {
            return data.detail.message;
          }

          return (
            data?.message ||
            `Request failed with status ${response.status}`
          );
        } catch {
          return `Request failed with status ${response.status}`;
        }
      },
      []
    );

  // =========================================================
  // RECOGNITION
  // =========================================================

  const recognize =
    useCallback(
      async () => {
        if (
          processingFaceRef.current ||
          !cameraOnline ||
          !databaseOnline ||
          !faceEngineReady
        ) {
          return;
        }

        const faces =
          faceBoxesRef.current ||
          [];

        if (!faces.length) {
          return;
        }

        processingFaceRef.current =
          true;

        setScanning(true);

        try {
          /*
           * Snapshot current faces.
           */
          const facesToProcess =
            faces.map(
              (face) => ({
                ...face,
              })
            );

          console.log(
            `Processing ${facesToProcess.length} face(s)`
          );

          for (
            let index = 0;
            index <
            facesToProcess.length;
            index++
          ) {
            if (
              !cameraOnline ||
              !databaseOnline
            ) {
              break;
            }

            const face =
              facesToProcess[
                index
              ];

            if (
              face.confidence <
              FACE_CONFIDENCE
            ) {
              continue;
            }

            // =================================================
            // CREATE FACE CROP
            // =================================================

            const result =
              await createFaceCrop(
                face
              );

            if (
              !result?.blob
            ) {
              continue;
            }

            // =================================================
            // PREVIEW
            // =================================================

            addCapturedFace(
              result.blob,
              face.confidence,
              index
            );

            // =================================================
            // FORM DATA
            // =================================================

            const form =
              new FormData();

            form.append(
              "frame",
              result.blob,
              `face_${index + 1}.jpg`
            );

            form.append(
              "face_confidence",
              String(
                face.confidence
              )
            );

            form.append(
              "face_index",
              String(index)
            );

            form.append(
              "face_count",
              String(
                facesToProcess.length
              )
            );

            /*
             * Send image dimensions as metadata too.
             *
             * Backend can verify what it actually received.
             */
            form.append(
              "image_width",
              String(
                result.output.width
              )
            );

            form.append(
              "image_height",
              String(
                result.output.height
              )
            );

            form.append(
              "image_source_width",
              String(
                result.source.width
              )
            );

            form.append(
              "image_source_height",
              String(
                result.source.height
              )
            );

            console.log(
              "Sending face:",
              {
                index:
                  index + 1,

                total:
                  facesToProcess.length,

                confidence:
                  `${(
                    face.confidence *
                    100
                  ).toFixed(1)}%`,

                image:
                  `${result.output.width}x${result.output.height}`,

                source:
                  `${result.source.width}x${result.source.height}`,

                aspect:
                  (
                    result.output.width /
                    result.output.height
                  ).toFixed(3),

                blobSize:
                  `${(
                    result.blob.size /
                    1024
                  ).toFixed(1)} KB`,
              }
            );

            // =================================================
            // API
            // =================================================

            try {
              const response =
                await fetch(
                  SEARCH_URL,
                  {
                    method:
                      "POST",

                    headers:
                      accessToken
                        ? {
                            Authorization:
                              `Bearer ${accessToken}`,
                          }
                        : undefined,

                    body:
                      form,
                  }
                );

              // ===============================================
              // SERVER ERROR
              // ===============================================

              if (
                !response.ok
              ) {
                const message =
                  await getApiErrorMessage(
                    response
                  );

                /*
                 * 404 = unknown face.
                 *
                 * Don't spam toast for every
                 * unknown face.
                 */
                if (
                  response.status !==
                  404
                ) {
                  toast.error(
                    `${response.status}: ${message}`
                  );
                }

                console.warn(
                  "Attendance rejected:",
                  response.status,
                  message
                );

                continue;
              }

              // ===============================================
              // SUCCESS
              // ===============================================

              const apiResult =
                await response.json();

              const id =
                String(
                  apiResult.student_id ||
                    apiResult.id ||
                    ""
                );

              if (!id) {
                console.warn(
                  "Backend returned no student ID:",
                  apiResult
                );

                continue;
              }

              const now =
                Date.now();

              // ===============================================
              // DUPLICATE PROTECTION
              // ===============================================

              const previous =
                recognizedStudentsRef.current.get(
                  id
                );

              if (
                previous &&
                now -
                  previous <
                  DETAIL_TIME
              ) {
                console.log(
                  `Duplicate student ignored: ${id}`
                );

                continue;
              }

              recognizedStudentsRef.current.set(
                id,
                now
              );

              // ===============================================
              // CLEAN OLD IDS
              // ===============================================

              for (
                const [
                  oldId,
                  timestamp,
                ] of recognizedStudentsRef.current
              ) {
                if (
                  now -
                    timestamp >
                  15000
                ) {
                  recognizedStudentsRef.current.delete(
                    oldId
                  );
                }
              }

              // ===============================================
              // STUDENT
              // ===============================================

              setStudent(
                apiResult
              );

              setShowStudent(
                true
              );

              // ===============================================
              // HIDE AFTER 3 SEC
              // ===============================================

              if (
                studentTimerRef.current
              ) {
                clearTimeout(
                  studentTimerRef.current
                );
              }

              studentTimerRef.current =
                window.setTimeout(
                  () => {
                    setShowStudent(
                      false
                    );
                  },
                  DETAIL_TIME
                );

              // ===============================================
              // CALLBACK
              // ===============================================

              onAttendanceDetected?.(
                apiResult
              );

              // ===============================================
              // TOAST
              // ===============================================

              if (
                String(
                  apiResult.status
                )
                  .toLowerCase() ===
                "already present"
              ) {
                toast.success(
                  `${apiResult.name} is already present`
                );
              } else {
                toast.success(
                  `Attendance marked: ${apiResult.name}`
                );
              }

              console.log(
                `Face ${
                  index + 1
                } recognized:`,
                apiResult
              );
            } catch (error) {
              console.error(
                `Face ${
                  index + 1
                } API error:`,
                error
              );
            }
          }
        } catch (error) {
          console.error(
            "Multi-face recognition error:",
            error
          );
        } finally {
          processingFaceRef.current =
            false;

          setScanning(
            false
          );
        }
      },
      [
        accessToken,
        cameraOnline,
        databaseOnline,
        faceEngineReady,
        createFaceCrop,
        addCapturedFace,
        getApiErrorMessage,
        onAttendanceDetected,
      ]
    );

  // =========================================================
  // RECOGNITION TIMER
  // =========================================================

  useEffect(() => {
    if (
      !cameraOnline ||
      !databaseOnline ||
      !faceEngineReady
    ) {
      return;
    }

    recognitionTimerRef.current =
      window.setInterval(
        () => {
          if (
            faceBoxesRef.current
              .length > 0 &&
            !processingFaceRef.current
          ) {
            recognize();
          }
        },
        RECOGNITION_INTERVAL
      );

    return () => {
      if (
        recognitionTimerRef.current
      ) {
        clearInterval(
          recognitionTimerRef.current
        );

        recognitionTimerRef.current =
          null;
      }
    };
  }, [
    cameraOnline,
    databaseOnline,
    faceEngineReady,
    recognize,
  ]);

  // =========================================================
  // RESET WHEN OFFLINE
  // =========================================================

  useEffect(() => {
    if (
      cameraOnline &&
      databaseOnline
    ) {
      return;
    }

    faceBoxesRef.current =
      [];

    faceDetectedRef.current =
      false;

    faceConfidenceRef.current =
      0;

    processingFaceRef.current =
      false;

    recognizedStudentsRef.current.clear();

    setDetectedFaces([]);

    setFaceDetected(
      false
    );

    setFaceConfidence(
      0
    );

    setScanning(
      false
    );

    setShowStudent(
      false
    );
  }, [
    cameraOnline,
    databaseOnline,
  ]);

  // =========================================================
  // CLEANUP
  // =========================================================

  useEffect(() => {
    return () => {
      if (
        studentTimerRef.current
      ) {
        clearTimeout(
          studentTimerRef.current
        );
      }

      if (
        recognitionTimerRef.current
      ) {
        clearInterval(
          recognitionTimerRef.current
        );
      }

      if (
        faceLoopRef.current
      ) {
        cancelAnimationFrame(
          faceLoopRef.current
        );
      }

      // -------------------------------------------------------
      // Captured URLs
      // -------------------------------------------------------

      capturedTimeoutsRef.current.forEach(
        (timeoutId) => {
          clearTimeout(
            timeoutId
          );
        }
      );

      capturedTimeoutsRef.current.clear();

      setCapturedFaces(
        (current) => {
          current.forEach(
            (face) => {
              try {
                URL.revokeObjectURL(
                  face.url
                );
              } catch {}
            }
          );

          return [];
        }
      );

      // -------------------------------------------------------
      // Detector
      // -------------------------------------------------------

      if (
        faceDetectorRef.current
      ) {
        try {
          faceDetectorRef.current.close();
        } catch {}

        faceDetectorRef.current =
          null;
      }

      // -------------------------------------------------------
      // Camera
      // -------------------------------------------------------

      if (
        streamRef.current
      ) {
        streamRef.current
          .getTracks()
          .forEach(
            (track) =>
              track.stop()
          );

        streamRef.current =
          null;
      }

      const video =
        videoRef.current;

      if (video) {
        video.srcObject =
          null;
      }
    };
  }, []);

  // =========================================================
  // DATA
  // =========================================================

  const name =
    student?.name ||
    "Waiting...";

  const studentId =
    student?.student_id ||
    "—";

  const course =
    student?.class ||
    student?.course ||
    "—";

  const status =
    student?.status ||
    "Present";

  const confidence =
    student?.confidence ??
    null;

  const time =
    student?.time ||
    student?.marked_at ||
    null;

  const image =
    student?.image ||
    null;

  const imageUrl = image
    ? image.startsWith("http")
      ? image
      : `${baseUri}${image}`
    : null;

  const alreadyPresent =
    String(status)
      .toLowerCase()
      .trim() ===
    "already present";

  // =========================================================
  // UI
  // =========================================================

  return (
    <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
      {/* HEADER */}

      <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <ScanFace className="h-4 w-4 text-cyan-400" />

          <div>
            <h2 className="text-sm font-semibold text-white">
              Live Attendance
            </h2>

            <p className="text-[7px] uppercase text-slate-600">
              Multi Face Recognition
            </p>
          </div>
        </div>

        <div className="flex gap-3 text-[7px]">
          <span className="flex items-center gap-1">
            <StatusDot
              active={
                databaseOnline
              }
            />

            {databaseOnline
              ? "DATABASE"
              : "OFFLINE"}
          </span>

          <span className="flex items-center gap-1">
            <StatusDot
              active={
                cameraOnline
              }
            />

            {cameraOnline
              ? "CAMERA"
              : "OFFLINE"}
          </span>

          <span className="flex items-center gap-1">
            <StatusDot
              active={
                faceEngineReady
              }
            />

            {faceEngineReady
              ? "AI READY"
              : "AI OFFLINE"}
          </span>
        </div>
      </div>

      {/* CAMERA */}

      <div className="relative min-h-[390px] overflow-hidden bg-black">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* CAPTURED FACES */}

        {capturedFaces.length >
          0 && (
          <div className="absolute left-3 top-3 z-30 flex max-w-[calc(100%-24px)] gap-2 overflow-x-auto pb-1">
            {capturedFaces.map(
              (face) => (
                <div
                  key={
                    face.id
                  }
                  className="shrink-0 overflow-hidden rounded-lg border border-cyan-400/50 bg-slate-950/95 shadow-2xl"
                >
                  <div className="border-b border-cyan-400/20 bg-slate-900 px-2 py-1">
                    <p className="text-[7px] font-semibold uppercase tracking-wider text-cyan-300">
                      Face{" "}
                      {
                        face.index
                      }
                    </p>
                  </div>

                  <img
                    src={
                      face.url
                    }
                    alt={`Captured face ${face.index}`}
                    className="h-24 w-[76px] object-cover"
                  />

                  <div className="flex items-center justify-center gap-1 border-t border-slate-800 px-2 py-1">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />

                    <span className="text-[6px] font-semibold text-emerald-300">
                      {(
                        face.confidence *
                        100
                      ).toFixed(
                        0
                      )}
                      %
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* HIDDEN CANVAS */}

        <canvas
          ref={
            canvasRef
          }
          className="hidden"
        />

        {/* CAMERA OFFLINE */}

        {!cameraOnline && (
          <Overlay
            icon={
              <Camera className="h-8 w-8 text-red-400" />
            }
            title="Camera Offline"
            text={
              cameraError ||
              "Camera permission required."
            }
          />
        )}

        {/* DATABASE OFFLINE */}

        {cameraOnline &&
          !databaseOnline && (
            <Overlay
              icon={
                <Wifi className="h-8 w-8 text-red-400" />
              }
              title="Database Offline"
              text="Recognition paused."
            />
          )}

        {/* AI LOADING */}

        {cameraOnline &&
          databaseOnline &&
          !faceEngineReady && (
            <Overlay
              icon={
                <ScanFace className="h-8 w-8 animate-pulse text-cyan-400" />
              }
              title="Loading Face Detection"
              text={
                faceEngineError ||
                "Please wait..."
              }
            />
          )}

        {/* FACE BOXES */}

        {cameraOnline &&
          databaseOnline &&
          faceEngineReady && (
            <FaceBoxes
              videoRef={
                videoRef
              }
              faces={
                detectedFaces
              }
            />
          )}

        {/* FACE STATUS */}

        {cameraOnline &&
          databaseOnline &&
          faceEngineReady &&
          !showStudent && (
            <div className="absolute left-1/2 top-4 z-20 -translate-x-1/2">
              <div
                className={`rounded-full border px-3 py-1.5 ${
                  faceDetected
                    ? "border-emerald-400/40 bg-emerald-400/10"
                    : "border-slate-700 bg-black/60"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      faceDetected
                        ? "bg-emerald-400"
                        : "bg-slate-600"
                    }`}
                  />

                  <span
                    className={`text-[8px] font-medium ${
                      faceDetected
                        ? "text-emerald-300"
                        : "text-slate-500"
                    }`}
                  >
                    {faceDetected
                      ? `${detectedFaces.length} PERSON${
                          detectedFaces.length !==
                          1
                            ? "S"
                            : ""
                        } DETECTED • ${(
                          faceConfidence *
                          100
                        ).toFixed(
                          0
                        )}%`
                      : "WAITING FOR PERSON"}
                  </span>
                </div>
              </div>
            </div>
          )}

        {/* FACE COUNT */}

        {cameraOnline &&
          databaseOnline &&
          faceEngineReady &&
          detectedFaces.length >
            0 && (
            <div className="absolute right-3 top-3 z-20 rounded-lg border border-emerald-400/30 bg-black/70 px-2 py-1.5">
              <div className="flex items-center gap-1.5">
                <ScanFace className="h-3 w-3 text-emerald-400" />

                <span className="text-[7px] font-semibold text-emerald-300">
                  {
                    detectedFaces.length
                  }{" "}
                  FACE
                  {detectedFaces.length !==
                  1
                    ? "S"
                    : ""}
                </span>
              </div>
            </div>
          )}

        {/* STUDENT RESULT */}

        {showStudent &&
          student && (
            <div className="absolute bottom-4 left-1/2 z-20 w-[92%] max-w-lg -translate-x-1/2">
              <div className="rounded-xl border border-emerald-400/30 bg-slate-950/95 p-3 shadow-xl">
                <div className="flex items-center gap-3">
                  {/* IMAGE */}

                  {imageUrl ? (
                    <img
                      src={
                        imageUrl
                      }
                      alt={
                        name
                      }
                      className="h-14 w-14 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="grid h-14 w-14 place-items-center rounded-lg bg-emerald-400/10">
                      <UserCheck className="h-7 w-7 text-emerald-400" />
                    </div>
                  )}

                  {/* INFO */}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle2
                        className={`h-4 w-4 ${
                          alreadyPresent
                            ? "text-yellow-400"
                            : "text-emerald-400"
                        }`}
                      />

                      <p className="truncate text-[11px] font-semibold text-white">
                        {
                          name
                        }
                      </p>
                    </div>

                    <div className="mt-1 flex gap-2">
                      <span className="font-mono text-[7px] text-slate-500">
                        {
                          studentId
                        }
                      </span>

                      <span className="text-[7px] text-cyan-300">
                        {
                          course
                        }
                      </span>
                    </div>
                  </div>

                  {/* STATUS */}

                  <div className="text-right">
                    <p className="text-[6px] text-slate-600">
                      STATUS
                    </p>

                    <p
                      className={`text-[9px] font-bold ${
                        alreadyPresent
                          ? "text-yellow-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {String(
                        status
                      ).toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* METRICS */}

                <div className="mt-3 grid grid-cols-3 border-t border-slate-800 pt-2">
                  <SmallMetric
                    label="Confidence"
                    value={
                      confidence !=
                      null
                        ? `${Number(
                            confidence
                          ).toFixed(
                            1
                          )}%`
                        : "—"
                    }
                  />

                  <SmallMetric
                    label="Check In"
                    value={formatTime(
                      time
                    )}
                  />

                  <SmallMetric
                    label="Attendance"
                    value={
                      student.attendance ||
                      "—"
                    }
                  />
                </div>
              </div>
            </div>
          )}

        {/* RECOGNIZING */}

        {scanning &&
          cameraOnline &&
          databaseOnline && (
            <div className="absolute bottom-3 right-3 z-30 flex items-center gap-1 rounded bg-black/70 px-2 py-1">
              <Wifi className="h-3 w-3 animate-pulse text-cyan-400" />

              <span className="text-[7px] text-slate-400">
                Recognizing{" "}
                {
                  detectedFaces.length
                }{" "}
                face
                {detectedFaces.length !==
                1
                  ? "s"
                  : ""}
                ...
              </span>
            </div>
          )}
      </div>

      {/* FOOTER */}

      <div className="grid grid-cols-4 border-t border-slate-800">
        <Metric
          icon={Camera}
          label="Camera"
          value={
            cameraOnline
              ? "ONLINE"
              : "OFFLINE"
          }
        />

        <Metric
          icon={
            Fingerprint
          }
          label="Engine"
          value={
            databaseOnline &&
            faceEngineReady
              ? "READY"
              : "OFFLINE"
          }
        />

        <Metric
          icon={
            ShieldCheck
          }
          label="Faces"
          value={
            detectedFaces.length >
            0
              ? `${
                  detectedFaces.length
                } • ${(
                  faceConfidence *
                  100
                ).toFixed(
                  0
                )}%`
              : "—"
          }
        />

        <Metric
          icon={Clock3}
          label="Check In"
          value={formatTime(
            time
          )}
        />
      </div>
    </section>
  );
}

// =========================================================
// FACE BOXES
// =========================================================

function FaceBoxes({
  videoRef,
  faces,
}) {
  const video =
    videoRef.current;

  if (
    !video ||
    !faces?.length
  ) {
    return null;
  }

  const videoWidth =
    video.videoWidth || 1;

  const videoHeight =
    video.videoHeight || 1;

  /*
   * The video uses object-cover.
   *
   * Raw camera coordinates need to be
   * mapped to the displayed video.
   */

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {faces.map(
        (
          face,
          index
        ) => {
          const containerWidth =
            video.clientWidth ||
            1;

          const containerHeight =
            video.clientHeight ||
            1;

          const videoAspect =
            videoWidth /
            videoHeight;

          const containerAspect =
            containerWidth /
            containerHeight;

          let renderedWidth =
            containerWidth;

          let renderedHeight =
            containerHeight;

          let offsetX = 0;
          let offsetY = 0;

          if (
            videoAspect >
            containerAspect
          ) {
            renderedHeight =
              containerHeight;

            renderedWidth =
              renderedHeight *
              videoAspect;

            offsetX =
              (containerWidth -
                renderedWidth) /
              2;
          } else {
            renderedWidth =
              containerWidth;

            renderedHeight =
              renderedWidth /
              videoAspect;

            offsetY =
              (containerHeight -
                renderedHeight) /
              2;
          }

          const left =
            offsetX +
            (face.x /
              videoWidth) *
              renderedWidth;

          const top =
            offsetY +
            (face.y /
              videoHeight) *
              renderedHeight;

          const width =
            (face.width /
              videoWidth) *
            renderedWidth;

          const height =
            (face.height /
              videoHeight) *
            renderedHeight;

          return (
            <div
              key={
                face.id
              }
              className="absolute"
              style={{
                left,
                top,
                width,
                height,
              }}
            >
              {/* TOP LEFT */}

              <div className="absolute left-0 top-0 h-7 w-7 border-l-2 border-t-2 border-emerald-400" />

              {/* TOP RIGHT */}

              <div className="absolute right-0 top-0 h-7 w-7 border-r-2 border-t-2 border-emerald-400" />

              {/* BOTTOM LEFT */}

              <div className="absolute bottom-0 left-0 h-7 w-7 border-b-2 border-l-2 border-emerald-400" />

              {/* BOTTOM RIGHT */}

              <div className="absolute bottom-0 right-0 h-7 w-7 border-b-2 border-r-2 border-emerald-400" />

              {/* FACE NUMBER */}

              <div className="absolute -top-5 left-0 rounded bg-emerald-500 px-1.5 py-0.5 shadow">
                <span className="text-[7px] font-bold text-black">
                  FACE{" "}
                  {index +
                    1}
                </span>
              </div>

              {/* CONFIDENCE */}

              <div className="absolute -bottom-5 left-0 rounded bg-black/80 px-1.5 py-0.5">
                <span className="text-[7px] font-semibold text-emerald-300">
                  {(
                    face.confidence *
                    100
                  ).toFixed(
                    0
                  )}
                  %
                </span>
              </div>
            </div>
          );
        }
      )}
    </div>
  );
}

// =========================================================
// METRIC
// =========================================================

function Metric({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="border-r border-slate-800 p-2.5 last:border-0">
      <div className="flex items-center gap-1">
        <Icon className="h-3 w-3 text-slate-600" />

        <span className="text-[7px] text-slate-600">
          {label}
        </span>
      </div>

      <p className="mt-1 text-[8px] font-semibold text-cyan-300">
        {value}
      </p>
    </div>
  );
}

// =========================================================
// SMALL METRIC
// =========================================================

function SmallMetric({
  label,
  value,
}) {
  return (
    <div>
      <p className="text-[6px] uppercase text-slate-600">
        {label}
      </p>

      <p className="mt-0.5 text-[8px] font-semibold text-slate-300">
        {value}
      </p>
    </div>
  );
}

// =========================================================
// OVERLAY
// =========================================================

function Overlay({
  icon,
  title,
  text,
}) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60">
      <div className="max-w-sm px-4 text-center">
        {icon}

        <p className="mt-2 text-xs font-semibold text-slate-300">
          {title}
        </p>

        <p className="mt-1 break-words text-[8px] text-slate-600">
          {text}
        </p>
      </div>
    </div>
  );
}

// =========================================================
// TIME
// =========================================================

function formatTime(
  value
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleTimeString(
    [],
    {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }
  );
}
