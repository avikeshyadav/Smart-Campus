import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle,
  Trash2,
  Loader2,
} from "lucide-react";

import { useAuth } from "../../../../context/AuthContext";
import { BASE_URI } from "../../../../config/api";


// =====================================================
// Notification type -> UI type
// =====================================================
const getNotificationType = (type) => {
  switch (type) {
    case "STUDENT_REGISTERED":
    case "STUDENT_UPDATED":
      return "success";

    case "UNKNOWN_FACE":
    case "ATTENDANCE_LATE":
    case "ATTENDANCE_ABSENT":
    case "CAMERA_DISCONNECTED":
    case "MODULE_DISABLED":
      return "warning";

    case "SYSTEM_ERROR":
    case "PAYMENT_FAILED":
      return "error";

    default:
      return "info";
  }
};


// =====================================================
// Relative time
// =====================================================
const getRelativeTime = (date) => {
  if (!date) return "";

  const created = new Date(date).getTime();
  const now = Date.now();

  const diff = Math.max(0, now - created);

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  if (hours < 24) {
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }

  return `${days} day${days > 1 ? "s" : ""} ago`;
};


// =====================================================
// Notification Component
// =====================================================
const Notification = () => {
  const { authFetch, isLoading: authLoading } = useAuth();

  const notificationRef = useRef(null);

  const [open, setOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState(false);


  // ===================================================
  // Fetch notifications
  // ===================================================
  const fetchNotifications = useCallback(async () => {
    if (authLoading) return;

    try {
      setLoading(true);

      const res = await authFetch(
        `${BASE_URI}/api/notifications`
      );

      if (!res.ok) {
        throw new Error(
          `Failed to fetch notifications: ${res.status}`
        );
      }

      const data = await res.json();

      setNotifications(data.notifications || data.data || []);
    } catch (error) {
      console.error(
        "Fetch notifications error:",
        error
      );

      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [authFetch, authLoading]);


  // ===================================================
  // Initial load
  // ===================================================
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);


  // ===================================================
  // Poll every 30 seconds
  // ===================================================
  useEffect(() => {
    if (authLoading) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications, authLoading]);


  // ===================================================
  // Close dropdown outside click
  // ===================================================
  useEffect(() => {
    const handleClick = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClick
      );
    };
  }, []);


  // ===================================================
  // Unread count
  // ===================================================
  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;


  // ===================================================
  // Mark single notification as read
  // ===================================================
  const markAsRead = async (id) => {
    try {
      const res = await authFetch(
        `${BASE_URI}/api/notifications/${id}/read`,
        {
          method: "PATCH",
        }
      );

      if (!res.ok) {
        throw new Error(
          `Failed to mark notification: ${res.status}`
        );
      }

      // Update UI immediately
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? {
                ...notification,
                is_read: true,
              }
            : notification
        )
      );
    } catch (error) {
      console.error(
        "Mark notification read error:",
        error
      );
    }
  };


  // ===================================================
  // Mark all as read
  // ===================================================
  const markAllRead = async () => {
    if (unreadCount === 0) return;

    try {
      setActionLoading(true);

      const res = await authFetch(
        `${BASE_URI}/api/notifications/read-all`,
        {
          method: "PATCH",
        }
      );

      if (!res.ok) {
        throw new Error(
          `Failed to mark all: ${res.status}`
        );
      }

      // Update UI immediately
      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );
    } catch (error) {
      console.error(
        "Mark all notifications error:",
        error
      );
    } finally {
      setActionLoading(false);
    }
  };


  // ===================================================
  // Delete notification
  // ===================================================
  const deleteNotification = async (id) => {
    try {
      setActionLoading(true);

      const res = await authFetch(
        `${BASE_URI}/api/notifications/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        throw new Error(
          `Failed to delete notification: ${res.status}`
        );
      }

      // Remove immediately from UI
      setNotifications((prev) =>
        prev.filter(
          (notification) => notification.id !== id
        )
      );
    } catch (error) {
      console.error(
        "Delete notification error:",
        error
      );
    } finally {
      setActionLoading(false);
    }
  };


  // ===================================================
  // Icon
  // ===================================================
  const renderIcon = (type) => {
    const uiType = getNotificationType(type);

    if (uiType === "success") {
      return (
        <CheckCircle
          size={20}
          className="text-green-400"
        />
      );
    }

    if (uiType === "warning") {
      return (
        <AlertTriangle
          size={20}
          className="text-yellow-400"
        />
      );
    }

    if (uiType === "error") {
      return (
        <XCircle
          size={20}
          className="text-red-400"
        />
      );
    }

    return (
      <Info
        size={20}
        className="text-cyan-400"
      />
    );
  };


  return (
    <div
      ref={notificationRef}
      className="relative"
    >
      {/* =================================================
          Bell Button
      ================================================= */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="
          relative
          rounded-xl
          border
          border-slate-700
          bg-slate-900
          p-2.5
          text-white
          transition
          hover:border-cyan-500
          hover:text-cyan-400
        "
        aria-label="Notifications"
      >
        <Bell size={20} />

        {unreadCount > 0 && (
          <span
            className="
              absolute
              -right-1
              -top-1
              flex
              h-5
              min-w-5
              items-center
              justify-center
              rounded-full
              bg-red-500
              px-1
              text-[10px]
              font-bold
              text-white
            "
          >
            {unreadCount > 99
              ? "99+"
              : unreadCount}
          </span>
        )}
      </button>


      {/* =================================================
          Dropdown
      ================================================= */}
      {open && (
        <div
          className="
            absolute
            right-0
            z-50
            mt-3
            w-[380px]
            overflow-hidden
            rounded-xl
            border
            border-slate-700
            bg-slate-950
            shadow-2xl
          "
        >

          {/* =================================================
              Header
          ================================================= */}
          <div
            className="
              flex
              items-center
              justify-between
              border-b
              border-slate-800
              p-4
            "
          >
            <div>
              <h3 className="font-semibold text-white">
                Notifications
              </h3>

              {unreadCount > 0 && (
                <p className="mt-1 text-xs text-slate-500">
                  {unreadCount} unread
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={markAllRead}
              disabled={
                unreadCount === 0 ||
                actionLoading
              }
              className="
                text-sm
                text-cyan-400
                transition
                hover:underline
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              {actionLoading
                ? "Updating..."
                : "Mark all read"}
            </button>
          </div>


          {/* =================================================
              Notification List
          ================================================= */}
          <div className="max-h-[400px] overflow-y-auto">

            {/* Loading */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2
                  size={24}
                  className="animate-spin text-cyan-400"
                />
              </div>
            ) : notifications.length === 0 ? (

              /* Empty */
              <div className="py-12 text-center">
                <Bell
                  size={30}
                  className="mx-auto mb-3 text-slate-700"
                />

                <p className="text-sm text-slate-500">
                  No notifications
                </p>
              </div>

            ) : (

              /* List */
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (!item.is_read) {
                      markAsRead(item.id);
                    }
                  }}
                  className={`
                    flex
                    cursor-pointer
                    items-start
                    gap-3
                    border-b
                    border-slate-800
                    p-4
                    transition
                    hover:bg-slate-900
                    ${
                      !item.is_read
                        ? "bg-slate-900/50"
                        : ""
                    }
                  `}
                >

                  {/* Icon */}
                  <div className="mt-1 shrink-0">
                    {renderIcon(item.type)}
                  </div>


                  {/* Text */}
                  <div className="min-w-0 flex-1">

                    <div className="flex items-center justify-between gap-2">

                      <h4 className="truncate font-medium text-white">
                        {item.title}
                      </h4>

                      {!item.is_read && (
                        <span
                          className="
                            h-2
                            w-2
                            shrink-0
                            rounded-full
                            bg-cyan-400
                          "
                        />
                      )}
                    </div>


                    <p className="mt-1 text-sm text-slate-400">
                      {item.message}
                    </p>


                    <p className="mt-2 text-xs text-slate-500">
                      {getRelativeTime(item.created_at)}
                    </p>

                  </div>


                  {/* Delete */}
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      deleteNotification(item.id);
                    }}
                    disabled={actionLoading}
                    className="
                      shrink-0
                      text-slate-600
                      transition
                      hover:text-red-400
                      disabled:opacity-40
                    "
                    aria-label="Delete notification"
                  >
                    <Trash2 size={16} />
                  </button>

                </div>
              ))
            )}
          </div>


          {/* =================================================
              Footer
          ================================================= */}
          <div className="border-t border-slate-800 p-3">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                // Later:
                // navigate("/notifications");
              }}
              className="
                w-full
                rounded-lg
                bg-cyan-500
                py-2
                text-sm
                font-medium
                text-white
                transition
                hover:bg-cyan-600
              "
            >
              View All Notifications
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default Notification;
