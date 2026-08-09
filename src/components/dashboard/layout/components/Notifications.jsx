import React, { useEffect, useRef, useState } from "react";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle,
  Trash2,
} from "lucide-react";

const Notification = () => {
  const notificationRef = useRef(null);

  const [open, setOpen] = useState(false);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New Student",
      message: "Rahul registered successfully.",
      time: "2 min ago",
      type: "success",
      read: false,
    },
    {
      id: 2,
      title: "Unknown Face",
      message: "Camera 2 detected unknown person.",
      time: "5 min ago",
      type: "warning",
      read: false,
    },
  ]);

  useEffect(() => {
    const handleClick = (e) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);

    return () =>
      document.removeEventListener("mousedown", handleClick);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications((prev) =>
      prev.filter((n) => n.id !== id)
    );
  };

return (
  <div
    ref={notificationRef}
    className="relative"
  >
    {/* Bell Button */}
    <button
      onClick={() => setOpen(!open)}
      className="
        relative
        rounded-xl
        border
        border-slate-700
        bg-slate-900
        p-2.5
        transition
        hover:border-cyan-500
        hover:text-cyan-400
      "
    >
      <Bell size={20} />

      {unreadCount > 0 && (
        <span
          className="
            absolute
            -top-1
            -right-1
            flex
            h-5
            w-5
            items-center
            justify-center
            rounded-full
            bg-red-500
            text-[10px]
            font-bold
            text-white
          "
        >
          {unreadCount}
        </span>
      )}
    </button>

    {/* Dropdown */}
    {open && (
      <div
        className="
          absolute
          right-0
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
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-4">
          <h3 className="font-semibold text-white">
            Notifications
          </h3>

          <button
            onClick={markAllRead}
            className="text-sm text-cyan-400 hover:underline"
          >
            Mark all read
          </button>
        </div>

        {/* Notification List */}
        <div className="max-h-56 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-10  text-center text-slate-500">
              No Notifications
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className={`flex cursor-pointer items-start gap-1 border-b border-slate-800 p-4 transition hover:bg-slate-900 ${
                  !item.read ? "bg-slate-900/40" : ""
                }`}
              >
                {/* Icon */}
                <div className="mt-1">
                  {item.type === "success" && (
                    <CheckCircle
                      size={20}
                      className="text-green-400"
                    />
                  )}

                  {item.type === "warning" && (
                    <AlertTriangle
                      size={20}
                      className="text-yellow-400"
                    />
                  )}

                  {item.type === "error" && (
                    <XCircle
                      size={20}
                      className="text-red-400"
                    />
                  )}

                  {item.type === "info" && (
                    <Info
                      size={20}
                      className="text-cyan-400"
                    />
                  )}
                </div>

                {/* Text */}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-white">
                      {item.title}
                    </h4>

                    {!item.read && (
                      <span className="h-2 w-2 rounded-full bg-cyan-400"></span>
                    )}
                  </div>

                  <p className="mt-1 text-sm text-slate-400">
                    {item.message}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    {item.time}
                  </p>
                </div>

                {/* Delete */}
                <button
                  onClick={() => deleteNotification(item.id)}
                  className="text-slate-500 hover:text-red-400"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 p-3">
          <button
            className="
              w-full
              rounded-lg
              bg-cyan-500
              py-2
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