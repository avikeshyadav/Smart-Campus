import React, { useCallback, useEffect, useState } from "react";
import {
  Bell,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
  Megaphone,
  Users,
  Building2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "react-hot-toast";

import { useAuth } from "../../../../context/AuthContext";
import { BASE_URI } from "../../../../config/api";

export default function Notices() {
  const { accessToken } = useAuth();

  // =========================================================
  // API URL
  // =========================================================

  const API_URL = `${String(BASE_URI || "").replace(/\/$/, "")}/api/hostel/notices`;

  // =========================================================
  // STATE
  // =========================================================

  const [notices, setNotices] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);

  const [editingNotice, setEditingNotice] = useState(null);

  const [deletingId, setDeletingId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    message: "",
    notice_type: "general",
    priority: "normal",
    target_type: "all",
    target_student_id: "",
    target_department: "",
    expires_at: "",
  });

  // =========================================================
  // FORM SETTER
  // =========================================================

  const set = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // =========================================================
  // RESET FORM
  // =========================================================

  const resetForm = () => {
    setForm({
      title: "",
      message: "",
      notice_type: "general",
      priority: "normal",
      target_type: "all",
      target_student_id: "",
      target_department: "",
      expires_at: "",
    });

    setEditingNotice(null);
  };

  // =========================================================
  // SAFE RESPONSE PARSER
  //
  // JSON response ho to JSON return karega.
  // HTML/text response ho to proper error dega.
  // =========================================================

  const parseResponse = async (response) => {
    const contentType =
      response.headers.get("content-type") || "";

    const rawText = await response.text();

    // JSON response
    if (contentType.includes("application/json")) {
      try {
        return rawText ? JSON.parse(rawText) : {};
      } catch (error) {
        console.error("INVALID JSON RESPONSE:", rawText);

        throw new Error(
          `Server ne invalid JSON return kiya. Status: ${response.status}`
        );
      }
    }

    // Non JSON response
    console.error("NON JSON RESPONSE:", {
      status: response.status,
      contentType,
      response: rawText,
    });

    // HTML response
    if (
      rawText.includes("<!DOCTYPE") ||
      rawText.includes("<html") ||
      rawText.includes("<HTML")
    ) {
      throw new Error(
        `API ke badle HTML page return hua. API URL check karo: ${response.url}`
      );
    }

    // Plain text response
    throw new Error(
      rawText ||
        `Server ne JSON response nahi diya. Status: ${response.status}`
    );
  };

  // =========================================================
  // GET NOTICES
  //
  // GET /api/hostel/notices
  // =========================================================

  const fetchNotices = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      console.log("GET NOTICES URL:", API_URL);

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Server error: ${response.status}`
        );
      }

      const noticeData = Array.isArray(data)
        ? data
        : Array.isArray(data?.notices)
        ? data.notices
        : Array.isArray(data?.data)
        ? data.data
        : [];

      setNotices(noticeData);
    } catch (error) {
      console.error("FETCH NOTICES ERROR:", error);

      toast.error(
        error?.message || "Unable to load notices"
      );

      setNotices([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken, API_URL]);

  // =========================================================
  // LOAD NOTICES
  // =========================================================

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  // =========================================================
  // OPEN CREATE MODAL
  // =========================================================

  const handleCreate = () => {
    resetForm();
    setShowModal(true);
  };

  // =========================================================
  // DATE FORMAT FOR INPUT
  // =========================================================

  const formatDateTimeLocal = (date) => {
    try {
      const d = new Date(date);

      if (Number.isNaN(d.getTime())) {
        return "";
      }

      const year = d.getFullYear();

      const month = String(
        d.getMonth() + 1
      ).padStart(2, "0");

      const day = String(
        d.getDate()
      ).padStart(2, "0");

      const hours = String(
        d.getHours()
      ).padStart(2, "0");

      const minutes = String(
        d.getMinutes()
      ).padStart(2, "0");

      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
      return "";
    }
  };

  // =========================================================
  // OPEN EDIT MODAL
  // =========================================================

  const handleEdit = (notice) => {
    setEditingNotice(notice);

    setForm({
      title: notice?.title || "",

      message: notice?.message || "",

      notice_type:
        notice?.notice_type || "general",

      priority:
        notice?.priority || "normal",

      target_type:
        notice?.target_type || "all",

      target_student_id:
        notice?.target_student_id || "",

      target_department:
        notice?.target_department || "",

      expires_at: notice?.expires_at
        ? formatDateTimeLocal(
            notice.expires_at
          )
        : "",
    });

    setShowModal(true);
  };

  // =========================================================
  // CREATE / UPDATE NOTICE
  //
  // POST /api/hostel/notices
  // PUT  /api/hostel/notices/:id
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // -------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------

    if (!accessToken) {
      toast.error("Authentication token missing");
      return;
    }

    if (!form.title.trim()) {
      toast.error("Please enter notice title");
      return;
    }

    if (!form.message.trim()) {
      toast.error("Please enter notice message");
      return;
    }

    if (
      form.target_type === "student" &&
      !String(form.target_student_id).trim()
    ) {
      toast.error("Please enter student ID");
      return;
    }

    if (
      form.target_type === "student" &&
      Number.isNaN(
        Number(form.target_student_id)
      )
    ) {
      toast.error("Student ID must be a number");
      return;
    }

    if (
      form.target_type === "department" &&
      !form.target_department.trim()
    ) {
      toast.error("Please enter department");
      return;
    }

    // -------------------------------------------------------
    // PAYLOAD
    // -------------------------------------------------------

    const payload = {
      title: form.title.trim(),

      message: form.message.trim(),

      notice_type: form.notice_type,

      priority: form.priority,

      target_type: form.target_type,

      target_student_id:
        form.target_type === "student"
          ? Number(form.target_student_id)
          : null,

      target_department:
        form.target_type === "department"
          ? form.target_department.trim()
          : null,

      expires_at:
        form.expires_at || null,
    };

    // -------------------------------------------------------
    // URL + METHOD
    // -------------------------------------------------------

    const url = editingNotice?.id
      ? `${API_URL}/${editingNotice.id}`
      : API_URL;

    const method = editingNotice?.id
      ? "PUT"
      : "POST";

    try {
      setSaving(true);

      console.log("NOTICE REQUEST:", {
        method,
        url,
        payload,
      });

      const response = await fetch(url, {
        method,

        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },

        body: JSON.stringify(payload),
      });

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Server error: ${response.status}`
        );
      }

      toast.success(
        editingNotice
          ? "Notice updated successfully"
          : "Notice created successfully"
      );

      setShowModal(false);

      resetForm();

      await fetchNotices();
    } catch (error) {
      console.error("SAVE NOTICE ERROR:", error);

      toast.error(
        error?.message ||
          "Unable to save notice"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE NOTICE
  //
  // DELETE /api/hostel/notices/:id
  // =========================================================

  const handleDelete = async (noticeId) => {
    if (!noticeId) return;

    if (!accessToken) {
      toast.error("Authentication token missing");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this notice?"
    );

    if (!confirmDelete) return;

    try {
      setDeletingId(noticeId);

      const url = `${API_URL}/${noticeId}`;

      console.log("DELETE NOTICE URL:", url);

      const response = await fetch(url, {
        method: "DELETE",

        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Server error: ${response.status}`
        );
      }

      toast.success(
        "Notice deleted successfully"
      );

      setNotices((prev) =>
        prev.filter(
          (notice) =>
            notice.id !== noticeId
        )
      );
    } catch (error) {
      console.error(
        "DELETE NOTICE ERROR:",
        error
      );

      toast.error(
        error?.message ||
          "Unable to delete notice"
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =========================================================
  // CLOSE MODAL
  // =========================================================

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    resetForm();
  };

  // =========================================================
  // BADGE HELPERS
  // =========================================================

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-400 border-red-500/20";

      case "urgent":
        return "bg-red-600/20 text-red-300 border-red-500/30";

      case "low":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";

      default:
        return "bg-slate-500/10 text-slate-300 border-slate-700";
    }
  };

  const getTargetLabel = (notice) => {
    if (notice?.target_type === "student") {
      return `Student #${notice.target_student_id}`;
    }

    if (
      notice?.target_type ===
      "department"
    ) {
      return (
        notice.target_department ||
        "Department"
      );
    }

    return "All Students";
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <section className="min-h-full text-white">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <div className="flex items-center gap-2">
            <Bell
              size={22}
              className="text-cyan-400"
            />

            <h1 className="text-2xl font-bold">
              Notices
            </h1>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Create and manage student
            announcements.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreate}
          className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-400"
        >
          <Plus size={18} />

          Create Notice
        </button>
      </div>

      {/* =====================================================
          STATS
      ===================================================== */}

      <div className="mb-6 grid gap-4 sm:grid-cols-3">

        {/* TOTAL */}

        <div className="rounded-2xl border border-slate-800 bg-[#071022] p-5">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Total Notices
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                {notices.length}
              </h2>
            </div>

            <Megaphone
              className="text-cyan-400"
              size={25}
            />
          </div>
        </div>

        {/* HIGH PRIORITY */}

        <div className="rounded-2xl border border-slate-800 bg-[#071022] p-5">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                High Priority
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                {
                  notices.filter(
                    (notice) =>
                      notice.priority ===
                        "high" ||
                      notice.priority ===
                        "urgent"
                  ).length
                }
              </h2>
            </div>

            <AlertTriangle
              className="text-red-400"
              size={25}
            />
          </div>
        </div>

        {/* ALL STUDENTS */}

        <div className="rounded-2xl border border-slate-800 bg-[#071022] p-5">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                For All Students
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                {
                  notices.filter(
                    (notice) =>
                      notice.target_type ===
                        "all" ||
                      !notice.target_type
                  ).length
                }
              </h2>
            </div>

            <Users
              className="text-emerald-400"
              size={25}
            />
          </div>
        </div>
      </div>

      {/* =====================================================
          NOTICE LIST
      ===================================================== */}

      <div className="rounded-2xl border border-slate-800 bg-[#071022]">

        <div className="border-b border-slate-800 p-5">

          <h2 className="font-bold">
            All Notices
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Manage notices created by
            administrators.
          </p>

        </div>

        {/* LOADING */}

        {loading ? (

          <div className="flex min-h-[250px] items-center justify-center">

            <Loader2
              size={28}
              className="animate-spin text-cyan-400"
            />

          </div>

        ) : notices.length === 0 ? (

          /* EMPTY */

          <div className="flex min-h-[250px] flex-col items-center justify-center text-center">

            <Bell
              size={40}
              className="mb-3 text-slate-700"
            />

            <h3 className="font-semibold">
              No notices found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Create your first student
              notice.
            </p>

          </div>

        ) : (

          /* LIST */

          <div className="divide-y divide-slate-800">

            {notices.map((notice) => (

              <div
                key={notice.id}
                className="p-5 transition hover:bg-slate-900/40"
              >

                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

                  {/* LEFT */}

                  <div className="min-w-0 flex-1">

                    <div className="flex flex-wrap items-center gap-2">

                      <h3 className="text-base font-bold text-white">
                        {notice.title}
                      </h3>

                      <span
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase ${getPriorityClass(
                          notice.priority
                        )}`}
                      >
                        {notice.priority ||
                          "normal"}
                      </span>

                    </div>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-400">
                      {notice.message}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-2">

                      <span className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-300">
                        Type:{" "}
                        {notice.notice_type ||
                          "general"}
                      </span>

                      <span className="flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-300">

                        {notice.target_type ===
                        "department" ? (
                          <Building2
                            size={13}
                          />
                        ) : (
                          <Users
                            size={13}
                          />
                        )}

                        {getTargetLabel(
                          notice
                        )}

                      </span>

                      {notice.expires_at && (
                        <span className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-400">

                          Expires:{" "}

                          {new Date(
                            notice.expires_at
                          ).toLocaleString()}

                        </span>
                      )}

                    </div>
                  </div>

                  {/* ACTIONS */}

                  <div className="flex shrink-0 gap-2">

                    <button
                      type="button"
                      onClick={() =>
                        handleEdit(notice)
                      }
                      className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:border-cyan-500 hover:bg-cyan-500/10 hover:text-cyan-400"
                    >
                      <Pencil size={15} />

                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          notice.id
                        )
                      }
                      disabled={
                        deletingId ===
                        notice.id
                      }
                      className="flex items-center gap-2 rounded-lg border border-red-500/20 px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                    >

                      {deletingId ===
                      notice.id ? (
                        <Loader2
                          size={15}
                          className="animate-spin"
                        />
                      ) : (
                        <Trash2 size={15} />
                      )}

                      Delete
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>
        )}
      </div>

      {/* =====================================================
          MODAL
      ===================================================== */}

      {showModal && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-800 bg-[#071022] shadow-2xl">

            {/* MODAL HEADER */}

            <div className="sticky top-0 flex items-center justify-between border-b border-slate-800 bg-[#071022] p-5">

              <div>

                <h2 className="text-lg font-bold">
                  {editingNotice
                    ? "Edit Notice"
                    : "Create Notice"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Publish an announcement
                  for students.
                </p>

              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-50"
              >
                <X size={20} />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="p-5"
            >

              <div className="grid gap-5 md:grid-cols-2">

                {/* TITLE */}

                <label className="text-sm text-slate-300 md:col-span-2">

                  Notice Title

                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) =>
                      set(
                        "title",
                        e.target.value
                      )
                    }
                    placeholder="e.g. Mid Semester Exam Schedule"
                    className="mt-2 w-full rounded-xl border border-slate-700 bg-[#0a1428] p-3 text-white outline-none focus:border-cyan-500"
                  />

                </label>

                {/* NOTICE TYPE */}

                <label className="text-sm text-slate-300">

                  Notice Type

                  <select
                    value={form.notice_type}
                    onChange={(e) =>
                      set(
                        "notice_type",
                        e.target.value
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-700 bg-[#0a1428] p-3 text-white outline-none focus:border-cyan-500"
                  >

                    <option value="general">
                      General
                    </option>

                    <option value="academic">
                      Academic
                    </option>

                    <option value="exam">
                      Exam
                    </option>

                    <option value="hostel">
                      Hostel
                    </option>

                    <option value="event">
                      Event
                    </option>

                    <option value="fee">
                      Fee
                    </option>

                    <option value="holiday">
                      Holiday
                    </option>

                  </select>

                </label>

                {/* PRIORITY */}

                <label className="text-sm text-slate-300">

                  Priority

                  <select
                    value={form.priority}
                    onChange={(e) =>
                      set(
                        "priority",
                        e.target.value
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-700 bg-[#0a1428] p-3 text-white outline-none focus:border-cyan-500"
                  >

                    <option value="low">
                      Low
                    </option>

                    <option value="normal">
                      Normal
                    </option>

                    <option value="high">
                      High
                    </option>

                    <option value="urgent">
                      Urgent
                    </option>

                  </select>

                </label>

                {/* TARGET */}

                <label className="text-sm text-slate-300">

                  Send To

                  <select
                    value={form.target_type}
                    onChange={(e) =>
                      set(
                        "target_type",
                        e.target.value
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-700 bg-[#0a1428] p-3 text-white outline-none focus:border-cyan-500"
                  >

                    <option value="all">
                      All Students
                    </option>

                    <option value="department">
                      Department
                    </option>

                    <option value="student">
                      Specific Student
                    </option>

                  </select>

                </label>

                {/* DEPARTMENT */}

                {form.target_type ===
                  "department" && (

                  <label className="text-sm text-slate-300">

                    Department

                    <input
                      type="text"
                      value={
                        form.target_department
                      }
                      onChange={(e) =>
                        set(
                          "target_department",
                          e.target.value
                        )
                      }
                      placeholder="e.g. Computer Science"
                      className="mt-2 w-full rounded-xl border border-slate-700 bg-[#0a1428] p-3 text-white outline-none focus:border-cyan-500"
                    />

                  </label>

                )}

                {/* STUDENT ID */}

                {form.target_type ===
                  "student" && (

                  <label className="text-sm text-slate-300">

                    Student ID

                    <input
                      type="number"
                      min="1"
                      value={
                        form.target_student_id
                      }
                      onChange={(e) =>
                        set(
                          "target_student_id",
                          e.target.value
                        )
                      }
                      placeholder="Enter student ID"
                      className="mt-2 w-full rounded-xl border border-slate-700 bg-[#0a1428] p-3 text-white outline-none focus:border-cyan-500"
                    />

                  </label>

                )}

                {/* EXPIRES */}

                <label className="text-sm text-slate-300">

                  Expires At

                  <input
                    type="datetime-local"
                    value={form.expires_at}
                    onChange={(e) =>
                      set(
                        "expires_at",
                        e.target.value
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-700 bg-[#0a1428] p-3 text-white outline-none focus:border-cyan-500"
                  />

                </label>

                {/* MESSAGE */}

                <label className="text-sm text-slate-300 md:col-span-2">

                  Message

                  <textarea
                    rows={6}
                    value={form.message}
                    onChange={(e) =>
                      set(
                        "message",
                        e.target.value
                      )
                    }
                    placeholder="Write notice message..."
                    className="mt-2 w-full resize-none rounded-xl border border-slate-700 bg-[#0a1428] p-3 text-white outline-none focus:border-cyan-500"
                  />

                </label>

              </div>

              {/* BUTTONS */}

              <div className="mt-6 flex justify-end gap-3">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {saving && (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  )}

                  {saving
                    ? "Saving..."
                    : editingNotice
                    ? "Update Notice"
                    : "Create Notice"}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}
    </section>
  );
}
