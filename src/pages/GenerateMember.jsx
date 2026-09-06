import React, { useState } from "react";
import jsPDF from "jspdf";
import { BASE_URI } from "../config/api";
import { toast } from "react-hot-toast";

export default function AddMember() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    course: "",
    semester: "",
    department: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const generateCertificate = (member) => {
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const W = 297;
    const H = 210;

    // Background + premium borders
    pdf.setFillColor(248, 250, 252);
    pdf.rect(0, 0, W, H, "F");

    pdf.setDrawColor(8, 35, 62);
    pdf.setLineWidth(2.2);
    pdf.rect(8, 8, W - 16, H - 16);

    pdf.setDrawColor(198, 154, 55);
    pdf.setLineWidth(0.7);
    pdf.rect(12, 12, W - 24, H - 24);

    // Cyber side bars
    pdf.setFillColor(8, 35, 62);
    pdf.rect(12, 12, 7, H - 24, "F");
    pdf.rect(W - 19, 12, 7, H - 24, "F");

    // Circuit dots
    pdf.setFillColor(78, 151, 194);
    [
      [25, 35], [25, 53], [25, 71], [25, 89],
      [272, 35], [272, 53], [272, 71], [272, 89],
      [25, 126], [25, 144], [25, 162],
      [272, 126], [272, 144], [272, 162],
    ].forEach(([x, y]) => pdf.circle(x, y, 1.1, "F"));

    // Header
    pdf.setTextColor(8, 35, 62);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(20);
    pdf.text("CYBERSECURITY CLUB", W / 2, 29, { align: "center" });

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(90, 105, 120);
    pdf.text("SECURE • LEARN • LEAD", W / 2, 36, { align: "center" });

    // Shield emblem
    pdf.setFillColor(8, 35, 62);
    pdf.roundedRect(133.5, 43, 30, 25, 5, 5, "F");
    pdf.setDrawColor(198, 154, 55);
    pdf.setLineWidth(1);
    pdf.roundedRect(136, 45.5, 25, 20, 4, 4);
    pdf.setTextColor(198, 154, 55);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text("CSC", W / 2, 58, { align: "center" });

    // Title
    pdf.setTextColor(8, 35, 62);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(31);
    pdf.text("MEMBERSHIP", W / 2, 81, { align: "center" });

    pdf.setTextColor(198, 154, 55);
    pdf.setFontSize(14);
    pdf.text("CERTIFICATE", W / 2, 90, { align: "center" });

    pdf.setDrawColor(198, 154, 55);
    pdf.setLineWidth(0.5);
    pdf.line(75, 96, 222, 96);

    pdf.setTextColor(65, 75, 85);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text("THIS CERTIFICATE IS PROUDLY PRESENTED TO", W / 2, 106, {
      align: "center",
    });

    // Member name
    pdf.setTextColor(8, 35, 62);
    pdf.setFont("times", "italic");
    pdf.setFontSize(27);
    pdf.text(String(member.name || "Member"), W / 2, 120, { align: "center" });

    pdf.setDrawColor(8, 35, 62);
    pdf.setLineWidth(0.35);
    pdf.line(82, 124, 215, 124);

    // Description
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8.5);
    pdf.setTextColor(60, 60, 60);

    const description =
      "has been officially registered as a Core Member of the Cybersecurity Club " +
      "and is recognized for their commitment to cybersecurity awareness, learning and leadership.";

    pdf.text(pdf.splitTextToSize(description, 145), W / 2, 134, {
      align: "center",
      lineHeightFactor: 1.5,
    });

    // Member details card
    pdf.setFillColor(241, 245, 249);
    pdf.roundedRect(72, 146, 153, 25, 3, 3, "F");

    pdf.setDrawColor(210, 218, 226);
    pdf.setLineWidth(0.35);
    pdf.roundedRect(72, 146, 153, 25, 3, 3);

    const xs = [80, 132, 183];
    const labels = ["MEMBER ID", "REGISTER DATE", "DEPARTMENT"];
    const values = [
      member.memberId || "-",
      member.registerDate || "-",
      member.department || "-",
    ];

    labels.forEach((label, i) => {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(6.5);
      pdf.setTextColor(8, 35, 62);
      pdf.text(label, xs[i], 155);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.5);
      pdf.setTextColor(45, 45, 45);
      pdf.text(pdf.splitTextToSize(String(values[i]), 40).slice(0, 2), xs[i], 161);
    });

    // Core Member seal
    pdf.setFillColor(8, 35, 62);
    pdf.setDrawColor(198, 154, 55);
    pdf.setLineWidth(1.2);
    pdf.circle(W / 2, 185, 12, "FD");

    pdf.setTextColor(198, 154, 55);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(6.5);
    pdf.text("CORE", W / 2, 184, { align: "center" });
    pdf.text("MEMBER", W / 2, 188, { align: "center" });

    // Signatures
    pdf.setDrawColor(70, 70, 70);
    pdf.setLineWidth(0.3);
    pdf.line(48, 185, 98, 185);
    pdf.line(199, 185, 249, 185);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7);
    pdf.setTextColor(8, 35, 62);
    pdf.text("CLUB PRESIDENT", 73, 191, { align: "center" });
    pdf.text("FACULTY COORDINATOR", 224, 191, { align: "center" });

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6.5);
    pdf.setTextColor(100, 100, 100);
    pdf.text("Cybersecurity Club", 73, 195, { align: "center" });
    pdf.text("Cybersecurity Club", 224, 195, { align: "center" });

    pdf.save(
      `Cybersecurity-Club-Membership-${member.memberId || "certificate"}.pdf`
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BASE_URI}/api/members/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || data.error || "Failed to register member");
        return;
      }

      if (!data.member) {
        toast.error("Member data was not returned by server");
        return;
      }

      toast.success("Member registered successfully");
      generateCertificate(data.member);

      setForm({
        name: "",
        email: "",
        phone: "",
        course: "",
        semester: "",
        department: "",
      });
    } catch (error) {
      console.error("REGISTER MEMBER ERROR:", error);
      toast.error("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-7">
          <span className="inline-flex rounded-full bg-[#0b3155]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0b3155]">
            Cybersecurity Club
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Register New Member
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Register a student and generate the membership certificate automatically.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="bg-gradient-to-r from-[#0b3155] to-[#12466f] px-6 py-5 text-white">
            <h2 className="text-lg font-semibold">Member Information</h2>
            <p className="mt-1 text-xs text-slate-200">
              Enter the student's details below.
            </p>
          </div>

          <div className="p-6">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Student Name" required>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                  className={inputClass}
                />
              </Field>

              <Field label="Email Address" required>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="student@example.com"
                  required
                  className={inputClass}
                />
              </Field>

              <Field label="Phone Number">
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  className={inputClass}
                />
              </Field>

              <Field label="Course">
                <input
                  type="text"
                  name="course"
                  value={form.course}
                  onChange={handleChange}
                  placeholder="e.g. BCA"
                  className={inputClass}
                />
              </Field>

              <Field label="Department">
                <input
                  type="text"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  placeholder="e.g. Computer Science"
                  className={inputClass}
                />
              </Field>

              <Field label="Semester">
                <select
                  name="semester"
                  value={form.semester}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select semester</option>
                  {["1st", "2nd", "3rd", "4th", "5th", "6th"].map((sem) => (
                    <option key={sem} value={sem}>
                      {sem} Semester
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
              <span className="mt-0.5 text-blue-700">✓</span>
              <p className="text-xs leading-5 text-blue-800">
                After successful registration, the returned member details are
                used to create the official membership certificate PDF.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0b3155] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#12466f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Registering Member...
                </>
              ) : (
                <>
                  Register Member
                  <span>→</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0b3155] focus:ring-4 focus:ring-[#0b3155]/10";

function Field({ label, required, children }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
