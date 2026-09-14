import React, { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { BASE_URI } from "../../../config/api";

const Topbar = ({
  title = "Dashboard",
  student,
  onLogout,
}) => {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [notificationLoading, setNotificationLoading] = useState(false);

  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  // =========================================
  // STUDENT DATA
  // =========================================

  const studentName =
    student?.name ||
    student?.full_name ||
    student?.student_name ||
    "Student";

  const studentEmail = student?.email || "";

  const studentDepartment =
    student?.department ||
    student?.course ||
    "Student";

  // =========================================
  // PROFILE IMAGE
  // =========================================

  const studentImage =
    student?.profileImage ||
    student?.profile_image ||
    student?.photo ||
    student?.image ||
    student?.avatar ||
    null;

  const avatarName = studentName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

  // =========================================
  // FETCH NOTIFICATIONS
  // =========================================

  const fetchNotifications = async () => {
    try {
      setNotificationLoading(true);

      const token = sessionStorage.getItem(
        "Student_access_token"
      );

      const response = await fetch(
        `${BASE_URI}/api/student/notifications`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",

            ...(token && {
              Authorization: `Bearer ${token}`,
            }),
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(
          `Notification API Error: ${response.status}`
        );
      }

      const data = await response.json();

      /*
        API response agar:

        {
          success: true,
          notifications: [...]
        }

        ho to ye work karega.
      */

      setNotifications(
        data?.notifications ||
        data?.data ||
        []
      );

    } catch (error) {
      console.error(
        "Notification fetch error:",
        error
      );

      setNotifications([]);
    } finally {
      setNotificationLoading(false);
    }
  };

  // =========================================
  // LOAD NOTIFICATIONS
  // =========================================

  useEffect(() => {
    fetchNotifications();

    // Optional polling
    const interval = setInterval(() => {
      fetchNotifications();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // =========================================
  // CLOSE DROPDOWNS OUTSIDE CLICK
  // =========================================

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationOpen(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  // =========================================
  // UNREAD COUNT
  // =========================================

  const unreadCount = notifications.filter(
    (notification) =>
      !notification.isRead &&
      !notification.read
  ).length;

  // =========================================
  // NOTIFICATION CLICK
  // =========================================

  const handleNotificationClick = async (
    notification
  ) => {
    try {
      const notificationId =
        notification?._id ||
        notification?.id;

      if (!notificationId) return;

      const token = sessionStorage.getItem(
        "Student_access_token"
      );

      await fetch(
        `${BASE_URI}/api/student/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",

            ...(token && {
              Authorization: `Bearer ${token}`,
            }),
          },
          credentials: "include",
        }
      );

      // Local UI update
      setNotifications((prev) =>
        prev.map((item) =>
          (
            item?._id ||
            item?.id
          ) === notificationId
            ? {
                ...item,
                isRead: true,
                read: true,
              }
            : item
        )
      );

    } catch (error) {
      console.error(
        "Mark notification read error:",
        error
      );
    }
  };

  // =========================================
  // FORMAT TIME
  // =========================================

  const formatTime = (date) => {
    if (!date) return "";

    const notificationDate = new Date(date);

    if (Number.isNaN(notificationDate.getTime())) {
      return "";
    }

    return notificationDate.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  return (
    <header
      className="
        fixed
        left-0
        right-0
        top-0
        z-40
        h-[72px]
        border-b
        border-slate-200
        bg-white
        text-slate-900
        shadow-sm
        lg:left-[260px]
      "
    >

      <div className="flex h-full items-center justify-between px-4 sm:px-6">

        {/* =====================================
            LEFT
        ====================================== */}

        <div className="min-w-0">

          <h1 className="truncate text-lg font-bold sm:text-xl">
            {title}
          </h1>

          <p className="hidden text-xs text-slate-500 sm:block">
            Student Portal
          </p>

        </div>

        {/* =====================================
            RIGHT
        ====================================== */}

        <div className="flex items-center gap-2 sm:gap-4">

          {/* ===================================
              NOTIFICATION
          ==================================== */}

          <div
            ref={notificationRef}
            className="relative"
          >

            <button
              type="button"
              onClick={() => {
                setNotificationOpen(
                  (prev) => !prev
                );

                setProfileOpen(false);
              }}
              className="
                relative
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                text-lg
                transition
                hover:bg-slate-100
              "
              aria-label="Notifications"
            >
              🔔

              {unreadCount > 0 && (
                <span
                  className="
                    absolute
                    right-0
                    top-0
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
                    ring-2
                    ring-white
                  "
                >
                  {unreadCount > 9
                    ? "9+"
                    : unreadCount}
                </span>
              )}

            </button>

            {/* =================================
                NOTIFICATION DROPDOWN
            ================================== */}

            {notificationOpen && (
              <div
                className="
                  absolute
                  right-0
                  mt-3
                  w-[340px]
                  max-w-[calc(100vw-24px)]
                  overflow-hidden
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  shadow-2xl
                "
              >

                {/* Header */}

                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">

                  <div>

                    <h3 className="text-sm font-bold text-slate-900">
                      Notifications
                    </h3>

                    <p className="text-xs text-slate-500">
                      Your latest updates
                    </p>

                  </div>

                  {unreadCount > 0 && (
                    <span className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-600">
                      {unreadCount} unread
                    </span>
                  )}

                </div>

                {/* Notification List */}

                <div className="max-h-[360px] overflow-y-auto">

                  {notificationLoading ? (

                    <div className="px-4 py-8 text-center">

                      <div className="mx-auto mb-2 h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />

                      <p className="text-xs text-slate-500">
                        Loading notifications...
                      </p>

                    </div>

                  ) : notifications.length === 0 ? (

                    <div className="px-4 py-10 text-center">

                      <div className="mb-2 text-3xl">
                        🔔
                      </div>

                      <p className="text-sm font-semibold text-slate-700">
                        No notifications
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        You're all caught up.
                      </p>

                    </div>

                  ) : (

                    notifications.map(
                      (notification, index) => {

                        const notificationId =
                          notification?._id ||
                          notification?.id ||
                          index;

                        const isRead =
                          notification?.isRead ||
                          notification?.read;

                        return (
                          <button
                            key={notificationId}
                            type="button"
                            onClick={() =>
                              handleNotificationClick(
                                notification
                              )
                            }
                            className={`
                              flex
                              w-full
                              gap-3
                              border-b
                              border-slate-100
                              px-4
                              py-3
                              text-left
                              transition
                              hover:bg-slate-50
                              ${
                                !isRead
                                  ? "bg-indigo-50/50"
                                  : "bg-white"
                              }
                            `}
                          >

                            {/* Icon */}

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm">
                              {notification?.icon ||
                                "📢"}
                            </div>

                            {/* Content */}

                            <div className="min-w-0 flex-1">

                              <div className="flex items-start justify-between gap-2">

                                <p
                                  className={`
                                    line-clamp-1
                                    text-sm
                                    ${
                                      !isRead
                                        ? "font-bold text-slate-900"
                                        : "font-semibold text-slate-700"
                                    }
                                  `}
                                >
                                  {notification?.title ||
                                    "Notification"}
                                </p>

                                {!isRead && (
                                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-600" />
                                )}

                              </div>

                              <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                                {notification?.message ||
                                  notification?.description ||
                                  ""}
                              </p>

                              {(notification?.createdAt ||
                                notification?.created_at ||
                                notification?.date) && (
                                <p className="mt-1 text-[10px] text-slate-400">
                                  {formatTime(
                                    notification?.createdAt ||
                                      notification?.created_at ||
                                      notification?.date
                                  )}
                                </p>
                              )}

                            </div>

                          </button>
                        );
                      }
                    )

                  )}

                </div>

                {/* Footer */}

                <div className="border-t border-slate-100 p-2">

                  <NavLink
                    to="/student/notices"
                    onClick={() =>
                      setNotificationOpen(false)
                    }
                    className="
                      block
                      rounded-lg
                      px-3
                      py-2
                      text-center
                      text-xs
                      font-semibold
                      text-indigo-600
                      transition
                      hover:bg-indigo-50
                    "
                  >
                    View all notifications
                  </NavLink>

                </div>

              </div>
            )}

          </div>

          {/* ===================================
              DIVIDER
          ==================================== */}

          <div className="hidden h-8 w-px bg-slate-200 sm:block" />

          {/* ===================================
              PROFILE
          ==================================== */}

          <div
            ref={profileRef}
            className="relative"
          >

            <button
              type="button"
              onClick={() => {
                setProfileOpen(
                  (prev) => !prev
                );

                setNotificationOpen(false);
              }}
              className="
                flex
                items-center
                gap-2
                rounded-xl
                p-1.5
                transition
                hover:bg-slate-100
                sm:gap-3
              "
            >

              {/* Student Image */}

              {studentImage ? (

                <img
                  src={studentImage}
                  alt={studentName}
                  className="
                    h-10
                    w-10
                    rounded-full
                    object-cover
                    ring-2
                    ring-slate-100
                  "
                  onError={(event) => {
                    event.currentTarget.style.display =
                      "none";
                  }}
                />

              ) : (

                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-gradient-to-br
                    from-indigo-500
                    to-purple-600
                    text-sm
                    font-bold
                    text-white
                  "
                >
                  {avatarName || "S"}
                </div>

              )}

              {/* Name */}

              <div className="hidden min-w-0 text-left sm:block">

                <p className="max-w-[150px] truncate text-sm font-semibold text-slate-900">
                  {studentName}
                </p>

                <p className="max-w-[150px] truncate text-xs text-slate-500">
                  {studentDepartment}
                </p>

              </div>

              {/* Arrow */}

              <span
                className={`
                  hidden
                  text-xs
                  text-slate-400
                  transition
                  sm:block
                  ${
                    profileOpen
                      ? "rotate-180"
                      : ""
                  }
                `}
              >
                ▼
              </span>

            </button>

            {/* =================================
                PROFILE DROPDOWN
            ================================== */}

            {profileOpen && (
              <div
                className="
                  absolute
                  right-0
                  mt-3
                  w-72
                  overflow-hidden
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  shadow-2xl
                "
              >

                {/* Profile Header */}

                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-4 text-white">

                  <div className="flex items-center gap-3">

                    {studentImage ? (

                      <img
                        src={studentImage}
                        alt={studentName}
                        className="h-12 w-12 rounded-full border-2 border-white/50 object-cover"
                      />

                    ) : (

                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
                        {avatarName || "S"}
                      </div>

                    )}

                    <div className="min-w-0">

                      <p className="truncate text-sm font-bold">
                        {studentName}
                      </p>

                      <p className="truncate text-xs text-indigo-100">
                        {studentDepartment}
                      </p>

                    </div>

                  </div>

                  {studentEmail && (
                    <p className="mt-3 truncate text-xs text-indigo-100">
                      {studentEmail}
                    </p>
                  )}

                </div>

                {/* Menu */}

                <div className="p-2">

                  <NavLink
                    to="/student/profile"
                    onClick={() =>
                      setProfileOpen(false)
                    }
                    className="
                      flex
                      items-center
                      gap-3
                      rounded-lg
                      px-3
                      py-2.5
                      text-sm
                      text-slate-700
                      transition
                      hover:bg-slate-100
                    "
                  >
                    <span>👤</span>
                    <span>My Profile</span>
                  </NavLink>

                  <NavLink
                    to="/student/settings"
                    onClick={() =>
                      setProfileOpen(false)
                    }
                    className="
                      flex
                      items-center
                      gap-3
                      rounded-lg
                      px-3
                      py-2.5
                      text-sm
                      text-slate-700
                      transition
                      hover:bg-slate-100
                    "
                  >
                    <span>⚙️</span>
                    <span>Settings</span>
                  </NavLink>

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);

                      if (onLogout) {
                        onLogout();
                      }
                    }}
                    className="
                      flex
                      w-full
                      items-center
                      gap-3
                      rounded-lg
                      px-3
                      py-2.5
                      text-left
                      text-sm
                      text-red-600
                      transition
                      hover:bg-red-50
                    "
                  >
                    <span>🚪</span>
                    <span>Logout</span>
                  </button>

                </div>

              </div>
            )}

          </div>

        </div>

      </div>

    </header>
  );
};

export default Topbar;
