import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  RefreshCw,
  Trash2,
  Info,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  Calendar,
  BookOpen,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { BASE_URI } from "../../../config/api";
import { useAuth } from "../../../context/AuthContext";

const Index = () => {
  const  {accessToken} = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  // ==========================================
  // FETCH NOTIFICATIONS
  // ==========================================
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await fetch(
        `${BASE_URI}/api/notifications/all`,
        {
          method: "GET",
          headers:{
            authorization:`Bearer ${accessToken}`,
          },
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to fetch notifications"
        );
      }

      setNotifications(data.notifications || []);
    } catch (error) {
      console.error("Fetch notifications error:", error);

      toast.error(
        error?.message || "Unable to load notifications."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ==========================================
  // FETCH UNREAD COUNT
  // ==========================================
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await fetch(
        `${BASE_URI}/api/notifications/unread-count`,
        {
          method: "GET",
          headers:{
            authorization:`Bearer ${accessToken}`,
          },
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to get unread count"
        );
      }

      setUnreadCount(Number(data.count) || 0);
    } catch (error) {
      console.error("Unread count error:", error);
    }
  }, []);

  // ==========================================
  // LOAD DATA
  // ==========================================
  const loadNotifications = useCallback(async () => {
    await Promise.all([
      fetchNotifications(),
      fetchUnreadCount(),
    ]);
  }, [fetchNotifications, fetchUnreadCount]);

  // ==========================================
  // INITIAL LOAD
  // ==========================================
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // ==========================================
  // MARK SINGLE AS READ
  // ==========================================
  const markAsRead = async (notificationId) => {
    try {
      setProcessingId(notificationId);

      const response = await fetch(
        `${BASE_URI}/api/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers:{
            authorization:`Bearer ${accessToken}`,
          },
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to mark notification as read"
        );
      }

      if (data.updated) {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId
              ? {
                  ...notification,
                  is_read: true,
                }
              : notification
          )
        );

        setUnreadCount((prev) =>
          prev > 0 ? prev - 1 : 0
        );
      }
    } catch (error) {
      console.error("Mark notification error:", error);

      toast.error(
        error?.message ||
          "Unable to mark notification as read."
      );
    } finally {
      setProcessingId(null);
    }
  };

  // ==========================================
  // MARK ALL AS READ
  // ==========================================
  const markAllAsRead = async () => {
    if (unreadCount === 0) {
      return;
    }

    try {
      setIsMarkingAll(true);

      const response = await fetch(
        `${BASE_URI}/api/notifications/read-all`,
        {
          method: "PATCH",          
          headers:{
            authorization:`Bearer ${accessToken}`,
          },
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to mark notifications"
        );
      }

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );

      setUnreadCount(0);

      toast.success("All notifications marked as read.");
    } catch (error) {
      console.error(
        "Mark all notifications error:",
        error
      );

      toast.error(
        error?.message ||
          "Unable to mark notifications as read."
      );
    } finally {
      setIsMarkingAll(false);
    }
  };

  // ==========================================
  // REFRESH
  // ==========================================
  const handleRefresh = async () => {
    await loadNotifications();
  };

  // ==========================================
  // NOTIFICATION ICON
  // ==========================================
  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return (
          <CheckCircle
            size={20}
            className="text-emerald-400"
          />
        );

      case "warning":
        return (
          <AlertCircle
            size={20}
            className="text-yellow-400"
          />
        );

      case "message":
        return (
          <MessageSquare
            size={20}
            className="text-blue-400"
          />
        );

      case "calendar":
        return (
          <Calendar
            size={20}
            className="text-purple-400"
          />
        );

      case "academic":
        return (
          <BookOpen
            size={20}
            className="text-cyan-400"
          />
        );

      default:
        return (
          <Info
            size={20}
            className="text-cyan-400"
          />
        );
    }
  };
  //===========================================
  // DELETE NOTIFICATION 
  //===========================================
  const deleteNotification = async (notificationId) => {
  try {
    setProcessingId(notificationId);

    const response = await fetch(
      `${BASE_URI}/api/notifications/${notificationId}`,
      {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message || "Failed to delete notification"
      );
    }

    if (data.deleted) {
      const deletedNotification = notifications.find(
        (notification) =>
          notification.id === notificationId
      );

      setNotifications((prev) =>
        prev.filter(
          (notification) =>
            notification.id !== notificationId
        )
      );

      // Agar deleted notification unread thi,
      // unread count bhi decrease karo.
      if (
        deletedNotification &&
        !Boolean(deletedNotification.is_read)
      ) {
        setUnreadCount((prev) =>
          prev > 0 ? prev - 1 : 0
        );
      }

      toast.success("Notification deleted.");
    }
  } catch (error) {
    console.error(
      "Delete notification error:",
      error
    );

    toast.error(
      error?.message ||
        "Unable to delete notification."
    );
  } finally {
    setProcessingId(null);
  }
};


  // ==========================================
  // DATE FORMAT
  // ==========================================
  const formatDate = (date) => {
    if (!date) return "";

    const notificationDate = new Date(date);

    if (Number.isNaN(notificationDate.getTime())) {
      return "";
    }

    return notificationDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ==========================================
  // UI
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8">
      <div className="mx-auto w-full max-w-4xl">

        {/* =================================
            HEADER
        ================================= */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10">
              <Bell
                size={24}
                className="text-cyan-400"
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white">
                Notifications
              </h1>

              <p className="text-sm text-slate-400">
                {unreadCount > 0
                  ? `You have ${unreadCount} unread notification${
                      unreadCount > 1 ? "s" : ""
                    }`
                  : "You're all caught up"}
              </p>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-2">

            {/* Refresh */}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading}
              title="Refresh notifications"
              className="flex items-center justify-center rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-slate-300 transition hover:border-cyan-500 hover:text-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={18}
                className={
                  isLoading ? "animate-spin" : ""
                }
              />
            </button>

            {/* Mark All */}
            <button
              type="button"
              onClick={markAllAsRead}
              disabled={
                isMarkingAll || unreadCount === 0
              }
              className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:border-cyan-500 hover:text-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isMarkingAll ? (
                <RefreshCw
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <CheckCheck size={16} />
              )}

              Mark all as read
            </button>
          </div>
        </div>

        {/* =================================
            NOTIFICATION CARD
        ================================= */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">

          {/* Loading */}
          {isLoading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <RefreshCw
                  size={28}
                  className="animate-spin text-cyan-400"
                />

                <p className="text-sm text-slate-400">
                  Loading notifications...
                </p>
              </div>
            </div>
          ) : notifications.length === 0 ? (

            /* Empty */
            <div className="flex min-h-[350px] flex-col items-center justify-center px-6 text-center">

              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800">
                <Bell
                  size={30}
                  className="text-slate-500"
                />
              </div>

              <h2 className="text-lg font-semibold text-white">
                No notifications
              </h2>

              <p className="mt-2 max-w-sm text-sm text-slate-500">
                You don't have any notifications right now.
                We'll let you know when something important
                happens.
              </p>
            </div>
          ) : (

            /* List */
            <div className="divide-y divide-slate-800">

              {notifications.map((notification) => {
                const isUnread =
                  !Boolean(notification.is_read);

                const isProcessing =
                  processingId === notification.id;

                return (
                  <div
                    key={notification.id}
                    className={`relative flex gap-4 p-5 transition ${
                      isUnread
                        ? "bg-cyan-500/[0.04] hover:bg-cyan-500/[0.07]"
                        : "bg-slate-900 hover:bg-slate-800/40"
                    }`}
                  >

                    {/* Unread Indicator */}
                    {isUnread && (
                      <div className="absolute left-0 top-0 h-full w-1 bg-cyan-500" />
                    )}

                    {/* ICON */}
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        isUnread
                          ? "bg-cyan-500/10"
                          : "bg-slate-800"
                      }`}
                    >
                      {getNotificationIcon(
                        notification.type
                      )}
                    </div>

                    {/* CONTENT */}
                    <div className="min-w-0 flex-1">

                      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">

                        <div className="min-w-0">
                          <h3
                            className={`text-sm font-semibold ${
                              isUnread
                                ? "text-white"
                                : "text-slate-300"
                            }`}
                          >
                            {notification.title ||
                              "Notification"}
                          </h3>

                          <p className="mt-1 text-sm leading-6 text-slate-400">
                            {notification.message}
                          </p>
                        </div>

                        {/* DATE */}
                        <span className="shrink-0 text-xs text-slate-500">
                          {formatDate(
                            notification.created_at
                          )}
                        </span>
                      </div>

                      {/* BOTTOM */}
                      <div className="mt-3 flex items-center justify-between">

                        <div className="flex items-center gap-2">
                          {isUnread && (
                            <span className="rounded-full bg-cyan-500/10 px-2 py-1 text-[11px] font-medium text-cyan-400">
                              Unread
                            </span>
                          )}

                          {notification.entity_type && (
                            <span className="rounded-full bg-slate-800 px-2 py-1 text-[11px] text-slate-500">
                              {notification.entity_type}
                            </span>
                          )}
                        </div>
                        {/*Mark READ */} 
                        <div className="flex items-center gap-3">

                        {/* MARK AS READ */}
                        {isUnread && (
                            <button
                            type="button"
                            onClick={() =>
                                markAsRead(notification.id)
                            }
                            disabled={isProcessing}
                            className="flex items-center gap-1.5 text-xs font-medium text-cyan-400 transition hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                            {isProcessing ? (
                                <RefreshCw
                                size={14}
                                className="animate-spin"
                                />
                            ) : (
                                <Check size={14} />
                            )}

                            Mark as read
                            </button>
                        )}

                        {/* DELETE */}
                        <button
                            type="button"
                            onClick={() =>
                            deleteNotification(notification.id)
                            }
                            disabled={isProcessing}
                            title="Delete notification"
                            className="flex items-center gap-1.5 text-xs font-medium text-red-400 transition hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isProcessing ? (
                            <RefreshCw
                                size={14}
                                className="animate-spin"
                            />
                            ) : (
                            <Trash2 size={14} />
                            )}

                            Delete
                        </button>

                        </div>


                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
