import React, { useEffect, useState } from "react";
import { BASE_URI } from "../../../config/api";

const Notice = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotices = async () => {
    try {
      setLoading(true);
      setError("");

      const token = sessionStorage.getItem(
        "Student_access_token"
      );

      const response = await fetch(
        `${BASE_URI}/api/student/studentdashboard/notices`, 
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to fetch notices"
        );
      }

      setNotices(
        data?.data?.notices ||
        data?.notices ||
        data?.data ||
        []
      );
    } catch (err) {
      console.error("Notice API Error:", err);
      setError(
        err.message || "Unable to load notices"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-40 rounded bg-slate-200" />
          <div className="h-20 rounded bg-slate-200" />
          <div className="h-20 rounded bg-slate-200" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
        <p className="font-semibold text-red-700">
          Unable to load notices
        </p>

        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>

        <button
          onClick={fetchNotices}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">

      <div className="mb-6 flex items-center justify-between">

        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Notices & Announcements
          </h2>

          <p className="text-sm text-slate-500">
            Latest updates from college and hostel
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-xl">
          📢
        </div>

      </div>

      {notices.length === 0 ? (
        <div className="rounded-xl bg-slate-50 p-8 text-center">
          <p className="text-slate-500">
            No notices available.
          </p>
        </div>
      ) : (
        <div className="space-y-4">

          {notices.map((notice, index) => {

            const priority =
              notice.priority || "normal";

            return (
              <div
                key={notice.id || index}
                className="rounded-xl border border-slate-100 p-4 transition hover:border-indigo-200 hover:bg-indigo-50/30"
              >

                <div className="flex gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100">
                    📢
                  </div>

                  <div className="min-w-0 flex-1">

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                      <h3 className="font-semibold text-slate-900">
                        {notice.title || "Announcement"}
                      </h3>

                      <span
                        className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          priority === "high"
                            ? "bg-red-100 text-red-700"
                            : priority === "medium"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {priority}
                      </span>

                    </div>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {notice.message ||
                        notice.description ||
                        notice.content ||
                        "No description available."}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400">

                      {notice.date && (
                        <span>
                          📅 {notice.date}
                        </span>
                      )}

                      {notice.createdAt && (
                        <span>
                          📅{" "}
                          {new Date(
                            notice.createdAt
                          ).toLocaleDateString()}
                        </span>
                      )}

                      {notice.created_by && (
                        <span>
                          👤 {notice.created_by}
                        </span>
                      )}

                    </div>

                  </div>

                </div>

              </div>
            );
          })}

        </div>
      )}

    </section>
  );
};

export default Notice;
