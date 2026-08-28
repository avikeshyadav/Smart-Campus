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

import StatusDot from "./StatusDot";
import { toast } from "react-hot-toast";
const SEARCH_URL =
  "/py-api/api/students/attendance";
const SCAN_DELAY = 2500;
const DETAIL_TIME = 3000;

/*
 * Minimum face confidence.
 *
 * 0.80 = 80%
 */
const FACE_CONFIDENCE = 0.65;

/*
 * MediaPipe face detector model
 */
const FACE_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite";

/*
 * MediaPipe WASM
 */
const WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";

export default function LiveAttendanceCard({
  baseUri,
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

  const timerRef = useRef(null);

  const faceDetectorRef =
    useRef(null);

  const faceLoopRef =
    useRef(null);

  /*
   * Prevent multiple recognition jobs
   * at the same time.
   */
  const runningRef =
    useRef(false);

  /*
   * Current valid face detected.
   */
  const faceDetectedRef =
    useRef(false);

  /*
   * Backward-compatible single/latest face box.
   */
  const faceBoxRef =
    useRef(null);

  /*
   * ALL currently detected valid faces.
   */
  const faceBoxesRef =
    useRef([]);

  /*
   * Latest face confidence.
   */
  const faceConfidenceRef =
    useRef(0);

  /*
   * Last recognized student.
   */
  const lastStudentRef =
    useRef("");

  const lastTimeRef =
    useRef(0);

  /*
   * Prevent multiple face-processing loops.
   */
  const processingFaceRef =
    useRef(false);

  /*
   * Student duplicate protection.
   *
   * student_id -> timestamp
   */
  const recognizedStudentsRef =
    useRef(new Map());

  // =========================================================
  // STATE
  // =========================================================

  const [
    cameraOnline,
    setCameraOnline,
  ] = useState(false);

  const [
    cameraError,
    setCameraError,
  ] = useState("");

  const [
    faceDetected,
    setFaceDetected,
  ] = useState(false);

  const [
    faceConfidence,
    setFaceConfidence,
  ] = useState(0);

  const [
    detectedFaces,
    setDetectedFaces,
  ] = useState([]);

  const [
    faceEngineReady,
    setFaceEngineReady,
  ] = useState(false);

  const [
    faceEngineError,
    setFaceEngineError,
  ] = useState("");

  const [
    scanning,
    setScanning,
  ] = useState(false);

  const [
    student,
    setStudent,
  ] = useState(null);

  const [
    showStudent,
    setShowStudent,
  ] = useState(false);

  /*
   * Multiple captured face previews.
   */
  const [
    capturedFaces,
    setCapturedFaces,
  ] = useState([]);

  // =========================================================
  // CAMERA
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      try {
        if (
          !navigator.mediaDevices?.getUserMedia
        ) {
          throw new Error(
            "Camera not supported by this browser"
          );
        }

        const stream =
          await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: "user",

              width: {
                ideal: 1920,
                min: 1280,
              },
              height: {
                ideal: 1080,
                min: 720,
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
            .forEach((track) =>
              track.stop()
            );

          return;
        }

        streamRef.current =
          stream;

        const video =
          videoRef.current;

        if (video) {
          video.srcObject =
            stream;

          await video.play();
        }

        setCameraOnline(true);

        setCameraError("");
      } catch (error) {
        console.error(
          "Camera error:",
          error
        );

        setCameraOnline(false);

        setCameraError(
          error?.message ||
            "Camera permission required"
        );
      }
    }

    startCamera();

    return () => {
      cancelled = true;

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) =>
            track.stop()
          );

        streamRef.current =
          null;
      }
    };
  }, []);

  // =========================================================
  // INITIALIZE MEDIAPIPE
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

        // =====================================================
        // TRY GPU
        // =====================================================

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

                minSuppressionThreshold:
                  0.3,
              }
            );

          console.log(
            "GPU face detector ready"
          );
        } catch (gpuError) {
          console.warn(
            "GPU failed. Falling back to CPU.",
            gpuError
          );

          // ===================================================
          // CPU FALLBACK
          // ===================================================

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

                minSuppressionThreshold:
                  0.3,
              }
            );

          console.log(
            "CPU face detector ready"
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
          "Face detector READY"
        );
      } catch (error) {
        console.error(
          "Face detector initialization failed:",
          error
        );

        setFaceEngineReady(false);

        setFaceEngineError(
          error?.message ||
            "Face detection engine failed to load"
        );
      }
    }

    initializeFaceDetector();

    return () => {
      cancelled = true;

      if (
        faceDetectorRef.current
      ) {
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

      const video =
        videoRef.current;

      const detector =
        faceDetectorRef.current;

      // =====================================================
      // CAMERA / DETECTOR NOT READY
      // =====================================================

      if (
        !video ||
        !detector ||
        video.readyState <
          HTMLMediaElement.HAVE_CURRENT_DATA ||
        video.videoWidth === 0 ||
        video.videoHeight === 0
      ) {
        faceLoopRef.current =
          requestAnimationFrame(
            detectFace
          );

        return;
      }

      try {
        /*
         * Same video frame ko repeatedly
         * process na karein.
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
            result?.detections ||
            [];

          // ===================================================
          // ALL VALID FACES
          // ===================================================

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

          // ===================================================
          // SAVE ALL FACES
          // ===================================================

          faceBoxesRef.current =
            validFaces;
          setDetectedFaces(
            validFaces
          );

          // ===================================================
          // LARGEST FACE
          // ===================================================

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

          /*
           * Keep old refs populated
           * for compatibility.
           */
          if (largestFace) {
            faceBoxRef.current = {
              x: largestFace.x,
              y: largestFace.y,
              width:
                largestFace.width,
              height:
                largestFace.height,
            };

            faceConfidenceRef.current =
              largestFace.confidence;
          } else {
            faceBoxRef.current =
              null;

            faceConfidenceRef.current =
              0;
          }

          // ===================================================
          // FACE STATUS
          // ===================================================

          const hasFaces =
            validFaces.length > 0;

          if (
            faceDetectedRef.current !==
            hasFaces
          ) {
            faceDetectedRef.current =
              hasFaces;

            setFaceDetected(
              hasFaces
            );
          }

          const maxConfidence =
            validFaces.length
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

          // ===================================================
          // NO FACE
          // ===================================================

          if (!hasFaces) {
            faceDetectedRef.current =
              false;

            faceBoxRef.current =
              null;

            faceBoxesRef.current =
              [];

            faceConfidenceRef.current =
              0;

            setDetectedFaces([]);

            setFaceDetected(
              false
            );

            setFaceConfidence(0);

            setScanning(false);

            /*
             * Pending retry cancel.
             */
            if (timerRef.current) {
              clearTimeout(
                timerRef.current
              );

              timerRef.current =
                null;
            }
          }

          // ===================================================
          // DEBUG
          // ===================================================

          if (hasFaces) {
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

      if (
        faceLoopRef.current
      ) {
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
  // CREATE FACE CROP
  // =========================================================

  const createFaceCrop =
    useCallback(
      async (inputFaceBox) => {
        const video =
          videoRef.current;

        const canvas =
          canvasRef.current;

        const faceBox =
          inputFaceBox ||
          faceBoxRef.current;

        if (
          !video ||
          !canvas ||
          !faceBox
        ) {
          return null;
        }

        if (
          video.videoWidth <= 0 ||
          video.videoHeight <= 0
        ) {
          return null;
        }

        // ===================================================
        // FACE BOX
        // ===================================================

        let x =
          Number(faceBox.x) || 0;

        let y =
          Number(faceBox.y) || 0;

        let width =
          Number(faceBox.width) || 0;

        let height =
          Number(faceBox.height) || 0;

        if (
          width <= 10 ||
          height <= 10
        ) {
          return null;
        }

        // ===================================================
        // FACE PADDING
        // ===================================================

        let paddingX =
          width * 0.55;

        let paddingY =
          height * 0.65;

        // ===================================================
        // DISTANCE COMPENSATION
        // ===================================================

        const videoArea =
          video.videoWidth *
          video.videoHeight;

        const faceArea =
          width * height;

        const faceRatio =
          faceArea /
          videoArea;

        /*
         * Small/distant face.
         */
        if (
          faceRatio < 0.05
        ) {
          paddingX =
            width * 0.45;

          paddingY =
            height * 0.65;
        }

        /*
         * Extremely small face.
         */
        if (
          faceRatio < 0.05
        ) {
          paddingX =
            width * 0.40;

          paddingY =
            height * 0.60;
        }

        // ===================================================
        // EXPAND
        // ===================================================

        x -= paddingX;

        y -= paddingY;

        width +=
          paddingX * 2;

        height +=
          paddingY * 2;

        // ===================================================
        // ASPECT RATIO
        // ===================================================

        const targetAspect =
          4 / 5;

        const currentAspect =
          width / height;

        if (
          currentAspect >
          targetAspect
        ) {
          const newWidth =
            height *
            targetAspect;

          x +=
            (width -
              newWidth) /
            2;

          width =
            newWidth;
        } else {
          const newHeight =
            width /
            targetAspect;

          y +=
            (height -
              newHeight) /
            2;

          height =
            newHeight;
        }

        // ===================================================
        // CLAMP
        // ===================================================

        x = Math.max(
          0,
          x
        );

        y = Math.max(
          0,
          y
        );

        width = Math.min(
          width,
          video.videoWidth -
            x
        );

        height = Math.min(
          height,
          video.videoHeight -
            y
        );

        if (
          width <= 5 ||
          height <= 5
        ) {
          return null;
        }

        // ===================================================
        // OUTPUT
        // ===================================================

        const outputWidth =
          640;

        const outputHeight =
          Math.round(
            outputWidth *
              (height / width)
          );

        canvas.width =
          outputWidth;

        canvas.height =
          outputHeight;

        const ctx =
          canvas.getContext(
            "2d"
          );

        if (!ctx) {
          return null;
        }

        // ===================================================
        // IMAGE QUALITY
        // ===================================================

        ctx.imageSmoothingEnabled =
          true;

        ctx.imageSmoothingQuality =
          "high";

        ctx.fillStyle =
          "#000";

        ctx.fillRect(
          0,
          0,
          outputWidth,
          outputHeight
        );

        // ===================================================
        // DRAW FACE
        // ===================================================

        ctx.drawImage(
          video,

          x,
          y,
          width,
          height,

          0,
          0,
          outputWidth,
          outputHeight
        );

        // ===================================================
        // JPEG
        // ===================================================

        const blob =
          await new Promise(
            (resolve) => {
              canvas.toBlob(
                resolve,
                "image/jpeg",
                0.60
              );
            }
          );

        if (!blob) {
          return null;
        }

        return {
          blob,

          crop: {
            x,
            y,
            width,
            height,
          },
        };
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

        runningRef.current =
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
            `Sending ${facesToProcess.length} faces to backend`
          );

          // =================================================
          // PROCESS EVERY FACE
          // =================================================

          for (
            let index = 0;
            index <
            facesToProcess.length;
            index++
          ) {
            /*
             * Camera/backend state may have changed.
             */
            if (
              !cameraOnline ||
              !databaseOnline
            ) {
              break;
            }

            const face =
              facesToProcess[index];

            // ===============================================
            // CONFIDENCE
            // ===============================================

            if (
              face.confidence <
              FACE_CONFIDENCE
            ) {
              continue;
            }

            // ===============================================
            // CREATE FACE CROP
            // ===============================================

            const result =
              await createFaceCrop({
                x: face.x,
                y: face.y,
                width:
                  face.width,
                height:
                  face.height,
              });

            if (!result?.blob) {
              continue;
            }

            // ===============================================
            // CAPTURE PREVIEW
            // ===============================================

            const previewUrl =
              URL.createObjectURL(
                result.blob
              );

            const capturedId =
              `${Date.now()}-${index}-${Math.random()}`;

            setCapturedFaces(
              (current) => [
                ...current.slice(-5),

                {
                  id: capturedId,

                  url: previewUrl,

                  confidence:
                    face.confidence,

                  index:
                    index + 1,
                },
              ]
            );

            // ===============================================
            // REMOVE PREVIEW AFTER 4 SEC
            // ===============================================

            window.setTimeout(
              () => {
                setCapturedFaces(
                  (current) => {
                    const item =
                      current.find(
                        (entry) =>
                          entry.id ===
                          capturedId
                      );

                    if (item) {
                      URL.revokeObjectURL(
                        item.url
                      );
                    }

                    return current.filter(
                      (entry) =>
                        entry.id !==
                        capturedId
                    );
                  }
                );
              },
              4000
            );

            // ===============================================
            // FORM DATA
            // ===============================================

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

            /*
             * Optional metadata.
             *
             * Existing backend can simply ignore
             * these fields.
             */
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

            // ===============================================
            // DEBUG
            // ===============================================

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

                crop:
                  result.crop,

                blobSize:
                  result.blob.size,
              }
            );

            // ===============================================
            // BACKEND
            // ===============================================

            try {
              const response =
                await fetch(
                  SEARCH_URL,
                  {
                    method: "POST",

                    headers:
                      accessToken
                        ? {
                            Authorization:
                              `Bearer ${accessToken}`,
                          }
                        : {},

                    body: form,
                  }
                );

              // =============================================
              // UNKNOWN FACE
              // =============================================

              if (
                response.status ===
                  404 ||
                response.status ===
                  422
              ) {
                console.log(
                  `Face ${
                    index + 1
                  }: unknown`
                );

                continue;
              }

              // =============================================
              // SERVER ERROR
              // =============================================

              if (!response.ok) {
                console.error(
                  `Face ${
                    index + 1
                  } recognition failed:`,
                  response.status
                );
                toast.error(`Recognition failed due to ${response.status}`);
                continue;
              }

              // =============================================
              // RESPONSE
              // =============================================

              const apiResult =
                await response.json();

              if (
                !apiResult?.student_id
              ) {
                console.log(
                  `Face ${
                    index + 1
                  }: no student`
                );

                continue;
              }

              const id =
                String(
                  apiResult.student_id
                );

              const now =
                Date.now();

              // =============================================
              // DUPLICATE PROTECTION
              // =============================================

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
                toast.warn(`duplicate Student Found : ${id}`)

                continue;
              }

              recognizedStudentsRef.current.set(
                id,
                now
              );

              /*
               * Cleanup old map entries.
               */
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

              // =============================================
              // LAST STUDENT
              // =============================================

              lastStudentRef.current =
                id;

              lastTimeRef.current =
                now;

              // =============================================
              // SHOW STUDENT
              // =============================================

              setStudent(
                apiResult
              );

              setShowStudent(
                true
              );

              if (
                timerRef.current
              ) {
                clearTimeout(
                  timerRef.current
                );
              }

              timerRef.current =
                window.setTimeout(
                  () => {
                    setShowStudent(
                      false
                    );
                  },
                  DETAIL_TIME
                );

              // =============================================
              // CALLBACK
              // =============================================

              onAttendanceDetected?.(
                apiResult
              );

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

          runningRef.current =
            false;

          setScanning(false);

          /*
           * If faces are still present,
           * next interval will process them again.
           */
        }
      },
      [
        accessToken,
        cameraOnline,
        databaseOnline,
        faceEngineReady,
        createFaceCrop,
        onAttendanceDetected,
      ]
    );

  // =========================================================
  // RECOGNITION STARTER
  // =========================================================

  useEffect(() => {
    if (
      !cameraOnline ||
      !databaseOnline ||
      !faceEngineReady
    ) {
      return;
    }

    /*
     * Check every 700ms.
     *
     * If multiple faces are available,
     * recognize() sends all of them.
     */
    const interval =
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
        700
      );

    return () => {
      clearInterval(
        interval
      );
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
      !cameraOnline ||
      !databaseOnline
    ) {
      faceDetectedRef.current =
        false;

      faceBoxRef.current =
        null;

      faceBoxesRef.current =
        [];

      faceConfidenceRef.current =
        0;

      processingFaceRef.current =
        false;

      runningRef.current =
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

      if (
        timerRef.current
      ) {
        clearTimeout(
          timerRef.current
        );

        timerRef.current =
          null;
      }
    }
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
        timerRef.current
      ) {
        clearTimeout(
          timerRef.current
        );

        timerRef.current =
          null;
      }

      if (
        faceLoopRef.current
      ) {
        cancelAnimationFrame(
          faceLoopRef.current
        );

        faceLoopRef.current =
          null;
      }

      /*
       * Revoke captured preview URLs.
       */
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

      if (
        faceDetectorRef.current
      ) {
        try {
          faceDetectorRef.current.close();
        } catch {}

        faceDetectorRef.current =
          null;
      }

      if (
        streamRef.current
      ) {
        streamRef.current
          .getTracks()
          .forEach((track) =>
            track.stop()
          );

        streamRef.current =
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
      .toLowerCase() ===
    "already present";

  // =========================================================
  // UI
  // =========================================================

  return (
    <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">

      {/* ===================================================
          HEADER
      =================================================== */}

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

          {/* DATABASE */}

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

          {/* CAMERA */}

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

          {/* AI */}

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

      {/* ===================================================
          CAMERA
      =================================================== */}

      <div className="relative min-h-[390px] bg-black">

        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* =================================================
            CAPTURED FACES
        ================================================= */}

        {capturedFaces.length >
          0 && (
          <div className="absolute left-3 top-3 z-30 flex max-w-[calc(100%-24px)] gap-2 overflow-x-auto pb-1">

            {capturedFaces.map(
              (face) => (
                <div
                  key={face.id}
                  className="shrink-0 overflow-hidden rounded-lg border border-cyan-400/50 bg-slate-950/95 shadow-2xl"
                >

                  <div className="border-b border-cyan-400/20 bg-slate-900 px-2 py-1">

                    <p className="text-[7px] font-semibold uppercase tracking-wider text-cyan-300">
                      Face{" "}
                      {face.index}
                    </p>

                  </div>

                  <img
                    src={face.url}
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

        {/* =================================================
            HIDDEN CANVAS
        ================================================= */}

        <canvas
          ref={canvasRef}
          className="hidden"
        />

        {/* =================================================
            CAMERA OFFLINE
        ================================================= */}

        {!cameraOnline && (
          <Overlay
            icon={
              <Camera className="h-8 w-8 text-red-400" />
            }
            title="Camera Offline"
            text={
              cameraError ||
              "Camera permission required"
            }
          />
        )}

        {/* =================================================
            DATABASE OFFLINE
        ================================================= */}

        {cameraOnline &&
          !databaseOnline && (
            <Overlay
              icon={
                <Wifi className="h-8 w-8 text-red-400" />
              }
              title="Database Offline"
              text="Recognition paused"
            />
          )}

        {/* =================================================
            AI LOADING
        ================================================= */}

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

        {/* =================================================
            ALL FACE BOXES
        ================================================= */}

        {cameraOnline &&
          databaseOnline &&
          faceEngineReady && (
            <FaceBoxes
              videoRef={videoRef}
              faces={detectedFaces}
            />
          )}

        {/* =================================================
            FACE STATUS
        ================================================= */}

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
                      ? `${
                          detectedFaces.length
                        } PERSON${
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

        {/* =================================================
            MULTI FACE COUNT
        ================================================= */}

        {cameraOnline &&
          databaseOnline &&
          faceEngineReady &&
          detectedFaces.length >
            0 && (
            <div className="absolute right-3 top-3 z-20 rounded-lg border border-emerald-400/30 bg-black/70 px-2 py-1.5">

              <div className="flex items-center gap-1.5">

                <ScanFace className="h-3 w-3 text-emerald-400" />

                <span className="text-[7px] font-semibold text-emerald-300">
                  {detectedFaces.length}{" "}
                  FACE
                  {detectedFaces.length !==
                  1
                    ? "S"
                    : ""}
                </span>

              </div>

            </div>
          )}

        {/* =================================================
            STUDENT RESULT
        ================================================= */}

        {showStudent &&
          student && (
            <div className="absolute bottom-4 left-1/2 z-20 w-[92%] max-w-lg -translate-x-1/2">

              <div className="rounded-xl border border-emerald-400/30 bg-slate-950/95 p-3 shadow-xl">

                <div className="flex items-center gap-3">

                  {/* IMAGE */}

                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={name}
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
                        {name}
                      </p>

                    </div>

                    <div className="mt-1 flex gap-2">

                      <span className="font-mono text-[7px] text-slate-500">
                        {studentId}
                      </span>

                      <span className="text-[7px] text-cyan-300">
                        {course}
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
                      {status.toUpperCase()}
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

        {/* =================================================
            RECOGNIZING
        ================================================= */}

        {scanning &&
          cameraOnline &&
          databaseOnline && (
            <div className="absolute bottom-3 right-3 z-30 flex items-center gap-1 rounded bg-black/70 px-2 py-1">

              <Wifi className="h-3 w-3 animate-pulse text-cyan-400" />

              <span className="text-[7px] text-slate-400">
                Recognizing{" "}
                {detectedFaces.length}{" "}
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

      {/* ===================================================
          FOOTER
      =================================================== */}

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
          icon={Fingerprint}
          label="Engine"
          value={
            databaseOnline &&
            faceEngineReady
              ? "READY"
              : "OFFLINE"
          }
        />

        <Metric
          icon={ShieldCheck}
          label="Faces"
          value={
            detectedFaces.length >
            0
              ? `${detectedFaces.length} • ${(
                  faceConfidence *
                  100
                ).toFixed(0)}%`
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

  if (!video || !faces?.length) {
    return null;
  }

  const videoWidth =
    video.videoWidth || 1;

  const videoHeight =
    video.videoHeight || 1;

  return (
    <div className="pointer-events-none absolute inset-0 z-10">

      {faces.map(
        (face, index) => {
          /*
           * MediaPipe gives coordinates in
           * original video pixels.
           *
           * Convert to percentage for overlay.
           */
          const left =
            `${
              (face.x /
                videoWidth) *
              100
            }%`;

          const top =
            `${
              (face.y /
                videoHeight) *
              100
            }%`;

          const width =
            `${
              (face.width /
                videoWidth) *
              100
            }%`;

          const height =
            `${
              (face.height /
                videoHeight) *
              100
            }%`;

          return (
            <div
              key={face.id}
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
                  {index + 1}
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
// TIME FORMAT
// =========================================================

function formatTime(value) {
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
