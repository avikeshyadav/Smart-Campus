import React from "react";

import { motion } from "framer-motion";

import {
  Camera,
  CameraOff,
  CheckCircle2,
  CircleCheck,
  Cloud,
  Fingerprint,
  RefreshCw,
  RotateCcw,
  ScanFace,
  Wifi,
} from "lucide-react";

import StatusDot from "./StatusDot";

export default function CameraEnrollmentCard({
  videoRef,

  cameraOn,
  cameraLoading,

  capturedPhoto,

  cameraQuality,
  qualityColor,

  liveQuality,
  photoQuality,

  startCamera,
  stopCamera,
  retake,
  capturePhoto,
}) {
  /* =========================================================
     ACTIVE QUALITY
  ========================================================= */

  const activeQuality =
    capturedPhoto
      ? photoQuality
      : liveQuality;

  const liveScore =
    liveQuality?.score ?? null;

  const finalScore =
    photoQuality?.score ?? null;

  /* =========================================================
     QUALITY STATE
  ========================================================= */

  const isQualified =
    activeQuality?.score >= 80;

  const isExcellent =
    activeQuality?.score >= 90;

  return (
    <section
      className="
        overflow-hidden rounded-xl
        border border-slate-800/90
        bg-slate-900/55
      "
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        className="
          flex flex-wrap items-center
          justify-between gap-3
          border-b border-slate-800/80
          px-3 py-2.5
        "
      >
        {/* LEFT */}

        <div className="flex items-center gap-2">
          <div
            className="
              grid h-8 w-8 place-items-center
              rounded-lg
              border border-cyan-400/20
              bg-cyan-400/5
            "
          >
            <Camera className="h-4 w-4 text-cyan-300" />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-white">
              Facial Enrollment
            </h2>

            <p className="text-[7px] uppercase tracking-wider text-slate-600">
              Student Identity Capture sec
            </p>
          </div>
        </div>

        {/* RIGHT */}

        <div className="flex items-center gap-2">
          <span
            className="
              flex items-center gap-1.5
              text-[7px] text-slate-500
            "
          >
            <StatusDot
              active={cameraOn}
            />

            {cameraOn
              ? "LIVE"
              : "OFFLINE"}
          </span>

          {!capturedPhoto ? (
            <button
              type="button"
              onClick={
                cameraOn
                  ? stopCamera
                  : startCamera
              }
              disabled={
                cameraLoading
              }
              className={`
                flex items-center gap-1.5
                rounded-lg border
                px-2.5 py-1.5
                text-[8px] font-semibold
                transition
                disabled:opacity-50

                ${
                  cameraOn
                    ? "border-red-400/20 bg-red-400/5 text-red-300 hover:bg-red-400/10"
                    : "border-emerald-400/20 bg-emerald-400/5 text-emerald-400 hover:bg-emerald-400/10"
                }
              `}
            >
              {cameraLoading ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : cameraOn ? (
                <CameraOff className="h-3 w-3" />
              ) : (
                <Camera className="h-3 w-3" />
              )}

              {cameraLoading
                ? "Starting"
                : cameraOn
                ? "Stop"
                : "Start Camera"}
            </button>
          ) : (
            <button
              type="button"
              onClick={retake}
              className="
                flex items-center gap-1.5
                rounded-lg border
                border-slate-800
                bg-slate-950/50
                px-2.5 py-1.5
                text-[8px] text-slate-400
                transition
                hover:text-white
              "
            >
              <RotateCcw className="h-3 w-3" />

              Retake
            </button>
          )}
        </div>
      </div>

      {/* =====================================================
          CAMERA VIEW
      ===================================================== */}

      <div
        className="
          relative aspect-video
          min-h-[300px]
          overflow-hidden
          bg-black
        "
      >
        {/* ===================================================
            CAPTURED PHOTO
        =================================================== */}

        {capturedPhoto ? (
          <motion.img
            initial={{
              opacity: 0,
              scale: 1.04,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            src={
              capturedPhoto.previewUrl
            }
            alt="Captured student"
            className="
              h-full w-full
              object-cover
            "
          />
        ) : (
          <>
            {/* =================================================
                VIDEO
            ================================================= */}

            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="
                h-full w-full
                object-cover
              "
              style={{
                opacity: cameraOn
                  ? 1
                  : 0.2,
              }}
            />

            {/* =================================================
                STANDBY
            ================================================= */}

            {!cameraOn && (
              <div
                className="
                  absolute inset-0
                  flex flex-col
                  items-center
                  justify-center
                  bg-slate-950/70
                "
              >
                <Camera
                  className="
                    mb-2 h-9 w-9
                    text-slate-700
                  "
                  strokeWidth={1}
                />

                <p className="text-xs text-slate-500">
                  Camera Standby
                </p>

                <p className="mt-1 text-[7px] text-slate-700">
                  Start camera to begin
                  enrollment
                </p>
              </div>
            )}

            {/* =================================================
                FACE FRAME
            ================================================= */}

            <div
              className="
                pointer-events-none
                absolute left-1/2 top-1/2
                h-[65%] w-[30%]
                min-w-[150px]
                max-w-[220px]
                -translate-x-1/2
                -translate-y-1/2
              "
            >
              {/* TOP LEFT */}

              <div
                className="
                  absolute left-0 top-0
                  h-8 w-8
                  border-l-2
                  border-t-2
                  border-emerald-400
                "
              />

              {/* TOP RIGHT */}

              <div
                className="
                  absolute right-0 top-0
                  h-8 w-8
                  border-r-2
                  border-t-2
                  border-emerald-400
                "
              />

              {/* BOTTOM LEFT */}

              <div
                className="
                  absolute bottom-0 left-0
                  h-8 w-8
                  border-b-2
                  border-l-2
                  border-emerald-400
                "
              />

              {/* BOTTOM RIGHT */}

              <div
                className="
                  absolute bottom-0 right-0
                  h-8 w-8
                  border-b-2
                  border-r-2
                  border-emerald-400
                "
              />

              {/* =================================================
                  SCANNING LINE
              ================================================= */}

              {cameraOn && (
                <motion.div
                  className="
                    absolute left-0 right-0
                    h-px
                    bg-emerald-400
                    shadow-[0_0_10px_rgba(74,222,128,.9)]
                  "
                  animate={{
                    top: [
                      "0%",
                      "100%",
                      "0%",
                    ],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              )}
            </div>

            {/* =================================================
                TOP STATUS
            ================================================= */}

            <div
              className="
                absolute left-3 top-3
                flex items-center gap-2
                rounded-lg border
                border-slate-800
                bg-slate-950/75
                px-2.5 py-1.5
                backdrop-blur
              "
            >
              <StatusDot
                active={cameraOn}
              />

              <span
                className="
                  text-[7px]
                  uppercase
                  tracking-wider
                  text-slate-400
                "
              >
                {cameraOn
                  ? "Camera Live"
                  : "Offline"}
              </span>
            </div>

            {/* =================================================
                LIVE QUALITY BADGE
            ================================================= */}

            {cameraOn &&
              liveQuality && (
                <motion.div
                  initial={{
                    opacity: 0,
                    x: 10,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  className="
                    absolute right-3 top-3
                    min-w-[100px]
                    rounded-lg border
                    border-slate-800
                    bg-slate-950/80
                    px-2.5 py-2
                    backdrop-blur
                  "
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[7px] uppercase tracking-wider text-slate-500">
                      Live Quality
                    </span>

                    <span
                      className={`
                        text-sm font-bold

                        ${
                          liveScore >=
                          90
                            ? "text-yellow-300"
                            : liveScore >=
                              80
                            ? "text-emerald-400"
                            : "text-red-400"
                        }
                      `}
                    >
                      {liveScore}%
                    </span>
                  </div>

                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-800">
                    <motion.div
                      className={`
                        h-full rounded-full

                        ${
                          liveScore >=
                          90
                            ? "bg-yellow-300"
                            : liveScore >=
                              80
                            ? "bg-emerald-400"
                            : "bg-red-400"
                        }
                      `}
                      animate={{
                        width: `${liveScore}%`,
                      }}
                      transition={{
                        duration: 0.25,
                      }}
                    />
                  </div>

                  <p
                    className={`
                      mt-1 text-[6px]
                      uppercase tracking-wider
                      ${
                        liveScore >=
                        80
                          ? "text-emerald-400"
                          : "text-red-400"
                      }
                    `}
                  >
                    {liveScore >=
                    80
                      ? "Ready to capture"
                      : "Adjust face / lighting"}
                  </p>
                </motion.div>
              )}

            {/* =================================================
                INSTRUCTION
            ================================================= */}

            {cameraOn && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="
                  absolute bottom-3
                  left-1/2
                  -translate-x-1/2
                  rounded-lg border
                  border-emerald-400/20
                  bg-slate-950/80
                  px-3 py-1.5
                  backdrop-blur
                "
              >
                <div className="flex items-center gap-2">
                  <ScanFace className="h-3 w-3 text-emerald-400" />

                  <span
                    className="
                      text-[7px]
                      uppercase
                      tracking-wider
                      text-emerald-400
                    "
                  >
                    Align face inside frame
                  </span>
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* =====================================================
            CAPTURED BADGE
        ===================================================== */}

        {capturedPhoto && (
          <motion.div
            initial={{
              opacity: 0,
              x: -10,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            className="
              absolute left-3 top-3
              flex items-center gap-1.5
              rounded-lg border
              border-emerald-400/30
              bg-slate-950/80
              px-2.5 py-1.5
            "
          >
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />

            <span className="text-[7px] uppercase text-emerald-400">
              Photo Captured
            </span>
          </motion.div>
        )}

        {/* =====================================================
            FINAL QUALITY BADGE
        ===================================================== */}

        {capturedPhoto &&
          photoQuality && (
            <div
              className="
                absolute right-3 top-3
                rounded-lg border
                border-emerald-400/30
                bg-slate-950/80
                px-3 py-2
                backdrop-blur
              "
            >
              <p className="text-[6px] uppercase tracking-wider text-slate-500">
                Final Quality
              </p>

              <p
                className={`
                  mt-0.5 text-lg font-bold
                  ${
                    finalScore >=
                    90
                      ? "text-yellow-300"
                      : finalScore >=
                        80
                      ? "text-emerald-400"
                      : "text-red-400"
                  }
                `}
              >
                {finalScore}%
              </p>
            </div>
          )}

        {/* =====================================================
            CAPTURE BUTTON
        ===================================================== */}

        {cameraOn &&
          !capturedPhoto && (
            <div
              className="
                absolute bottom-4
                left-1/2
                -translate-x-1/2
                flex flex-col
                items-center
              "
            >
              <button
                type="button"
                onClick={capturePhoto}
                disabled={
                  liveQuality &&
                  liveQuality.score <
                    80
                }
                className={`
                  grid h-12 w-12
                  place-items-center
                  rounded-full
                  border-4
                  border-white/20
                  shadow-[0_0_25px_rgba(74,222,128,.25)]
                  transition

                  ${
                    liveQuality &&
                    liveQuality.score <
                      80
                      ? "cursor-not-allowed bg-slate-600 opacity-60"
                      : "bg-emerald-400 text-slate-950 hover:scale-105"
                  }
                `}
              >
                <CircleCheck className="h-5 w-5" />
              </button>

              <span
                className="
                  mt-1.5 rounded
                  bg-slate-950/70
                  px-2 py-0.5
                  text-[6px]
                  uppercase
                  tracking-wider
                  text-slate-500
                "
              >
                {liveQuality?.score >=
                80
                  ? "Capture"
                  : "Quality must reach 80%"}
              </span>
            </div>
          )}
      </div>

      {/* =====================================================
          CAMERA METRICS
      ===================================================== */}

      <div className="grid grid-cols-4 border-t border-slate-800/80">
        <Metric
          label="Camera"
          value={
            cameraOn
              ? "ONLINE"
              : "OFFLINE"
          }
          valueClass={
            cameraOn
              ? "text-emerald-400"
              : "text-slate-600"
          }
        />

        <Metric
          label="Quality"
          value={
            activeQuality
              ? `${activeQuality.score}%`
              : "WAITING"
          }
          valueClass={
            activeQuality?.score >=
            90
              ? "text-yellow-300"
              : activeQuality?.score >=
                80
              ? "text-emerald-400"
              : activeQuality
              ? "text-red-400"
              : "text-slate-600"
          }
        />

        <Metric
          label="Face"
          value={
            capturedPhoto
              ? "READY"
              : cameraOn
              ? "ALIGNING"
              : "WAITING"
          }
          valueClass={
            capturedPhoto
              ? "text-emerald-400"
              : cameraOn
              ? "text-yellow-300"
              : "text-slate-600"
          }
        />

        <Metric
          label="Security"
          value="PROTECTED"
          valueClass="text-purple-400"
        />
      </div>

      {/* =====================================================
          SYSTEM INFO
      ===================================================== */}

      <div
        className="
          grid grid-cols-3 gap-1.5
          border-t border-slate-800/80
          p-2
        "
      >
        <SystemInfo
          icon={Cloud}
          label="Cloud Backup"
          value={
            capturedPhoto
              ? "Ready"
              : "Synced"
          }
          iconClass="text-blue-400"
        />

        <SystemInfo
          icon={Fingerprint}
          label="Face Engine"
          value={
            cameraOn
              ? "Scanning"
              : "Ready"
          }
          iconClass="text-purple-400"
        />

        <SystemInfo
          icon={Wifi}
          label="Network"
          value="Excellent"
          iconClass="text-cyan-400"
          valueClass="text-yellow-300"
        />
      </div>
    </section>
  );
}

/* =========================================================
   METRIC
========================================================= */

function Metric({
  label,
  value,
  valueClass,
}) {
  return (
    <div className="border-r border-slate-800/70 p-2.5 last:border-r-0">
      <p className="text-[7px] uppercase text-slate-600">
        {label}
      </p>

      <p
        className={`
          mt-1 text-[9px]
          font-semibold
          ${valueClass}
        `}
      >
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   SYSTEM INFO
========================================================= */

function SystemInfo({
  icon: Icon,
  label,
  value,

  iconClass = "text-slate-400",

  valueClass = "text-emerald-400",
}) {
  return (
    <div
      className="
        rounded-lg
        border border-slate-800/70
        bg-slate-950/30
        px-2 py-1.5
      "
    >
      <div className="flex items-center gap-1.5">
        <Icon
          className={`
            h-3 w-3
            ${iconClass}
          `}
        />

        <span className="text-[7px] text-slate-500">
          {label}
        </span>
      </div>

      <p
        className={`
          mt-1 text-[8px]
          font-semibold
          ${valueClass}
        `}
      >
        {value}
      </p>
    </div>
  );
}