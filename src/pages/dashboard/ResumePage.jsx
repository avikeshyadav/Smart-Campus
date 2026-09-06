import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";

const STORAGE_KEY = "dashboard-resume";
const defaultResume = {
  personal: {
    fullName: "Sally Branders",
    jobTitle: "Business Development Manager",
    email: "sally.branders@gmail.com",
    phone: "+1 232 555 55 55",
    address: "NY, USA",
    summary: "Business development manager looking to obtain a challenging position in an organization, utilizing my proven track record in driving revenue growth and forging strategic partnerships to achieve business objectives.",
  },
  skills: ["Excel", "PowerPoint", "CRM", "Problem-Solving", "Team Leadership"],
  languages: ["English: Native", "Spanish: Intermediate", "French: Beginner"],
  experience: [
    {
      id: Date.now(),
      company: "XYZ Consulting Firm",
      role: "Business Development Manager",
      duration: "00/00/0000 - 00/00/0000",
      location: "NY, USA",
      details: "Developed and executed a comprehensive sales strategy, resulting in a 40% increase in annual revenue within one year. Identified and pursued new business opportunities through market research.",
    },
    {
      id: Date.now() + 1,
      company: "ABC Corporation",
      role: "Sales Representative",
      duration: "00/00/0000 - 00/00/0000",
      location: "NY, USA",
      details: "Achieved consistent sales targets by successfully prospecting and closing new business opportunities in a competitive market. Conducted product demonstrations and presentations to potential clients.",
    },
    {
      id: Date.now() + 2,
      company: "DEF Research Agency",
      role: "Market Research Analyst",
      duration: "00/00/0000 - 00/00/0000",
      location: "NY, USA",
      details: "Conducted in-depth market research and competitor analysis, providing valuable insights to guide strategic decision-making. Developed comprehensive market reports.",
    },
  ],
  education: [
    {
      id: Date.now() + 3,
      school: "Master of Business Administration",
      degree: "NYU",
      year: "20XX - 20XX",
      details: "Graduate business program focusing on strategy, leadership, and analytics.",
    },
    {
      id: Date.now() + 4,
      school: "Bachelor of Commerce in Marketing",
      degree: "NYU",
      year: "20XX - 20XX",
      details: "Marketing degree with practical coursework in branding and digital strategy.",
    },
  ],
  photo: "",
};

const ResumePage = () => {
  const [resume, setResume] = useState(defaultResume);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setResume(JSON.parse(saved));
      } catch {
        setResume(defaultResume);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resume));
  }, [resume]);

  const updatePersonal = (field, value) => {
    setResume((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        [field]: value,
      },
    }));
  };

  const updateEducation = (id, field, value) => {
    setResume((prev) => ({
      ...prev,
      education: prev.education.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry,
      ),
    }));
  };

  const addEducation = () => {
    setResume((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { id: Date.now(), school: "", degree: "", year: "", details: "" },
      ],
    }));
  };

  const removeEducation = (id) => {
    setResume((prev) => ({
      ...prev,
      education: prev.education.filter((entry) => entry.id !== id),
    }));
  };

  const updateSkills = (index, value) => {
    setResume((prev) => ({
      ...prev,
      skills: prev.skills.map((skill, i) => (i === index ? value : skill)),
    }));
  };

  const addSkill = () => {
    setResume((prev) => ({ ...prev, skills: [...prev.skills, ""] }));
  };

  const removeSkill = (index) => {
    setResume((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const updateLanguages = (index, value) => {
    setResume((prev) => ({
      ...prev,
      languages: prev.languages.map((lang, i) => (i === index ? value : lang)),
    }));
  };

  const addLanguage = () => {
    setResume((prev) => ({ ...prev, languages: [...prev.languages, ""] }));
  };

  const removeLanguage = (index) => {
    setResume((prev) => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index),
    }));
  };

  const updateExperience = (id, field, value) => {
    setResume((prev) => ({
      ...prev,
      experience: prev.experience.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry,
      ),
    }));
  };

  const addExperience = () => {
    setResume((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        { id: Date.now(), company: "", role: "", duration: "", location: "", details: "" },
      ],
    }));
  };

  const removeExperience = (id) => {
    setResume((prev) => ({
      ...prev,
      experience: prev.experience.filter((entry) => entry.id !== id),
    }));
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setResume((prev) => ({ ...prev, photo: reader.result || "" }));
    };
    reader.readAsDataURL(file);
  };

  const exportPdf = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    const leftWidth = 180;
    const contentWidth = pageWidth - leftWidth - margin * 2 - 20;
    const leftX = margin;
    const rightX = margin + leftWidth + 20;
    let cursor = 50;

    doc.setFillColor(5, 99, 128);
    doc.rect(0, 0, pageWidth, 110, "F");
    doc.setFillColor(245, 249, 252);
    doc.rect(margin, 120, leftWidth, pageHeight - 160, "F");
    doc.setFillColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor("#ffffff");
    doc.text(resume.personal.fullName, margin + 14, 70);
    doc.setFontSize(12);
    doc.setTextColor("#e2f2ff");
    doc.text(resume.personal.jobTitle || "", margin + 14, 90);

    if (resume.photo) {
      const imgType = resume.photo.startsWith("data:image/png") ? "PNG" : "JPEG";
      doc.addImage(resume.photo, imgType, rightX + contentWidth - 120, 40, 90, 90, undefined, "FAST");
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor("#073b4c");
    doc.text("CONTACT", leftX + 12, 150);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    cursor = 170;
    const contactLines = [
      resume.personal.email,
      resume.personal.phone,
      resume.personal.address,
    ];
    contactLines.forEach((line) => {
      if (line) {
        doc.text(line, leftX + 14, cursor);
        cursor += 16;
      }
    });

    if (resume.personal.summary) {
      cursor += 10;
      doc.setFont("helvetica", "bold");
      doc.text("PROFILE SUMMARY", leftX + 12, cursor);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      cursor += 16;
      const summaryLines = doc.splitTextToSize(resume.personal.summary, leftWidth - 24);
      doc.text(summaryLines, leftX + 14, cursor);
      cursor += summaryLines.length * 14;
    }

    cursor += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("SKILLS", leftX + 12, cursor);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    cursor += 16;
    resume.skills.forEach((skill) => {
      if (skill) {
        doc.text(`• ${skill}`, leftX + 14, cursor);
        cursor += 14;
      }
    });

    cursor += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("LANGUAGES", leftX + 12, cursor);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    cursor += 16;
    resume.languages.forEach((language) => {
      if (language) {
        doc.text(`• ${language}`, leftX + 14, cursor);
        cursor += 14;
      }
    });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor("#073b4c");
    doc.text("PROFESSIONAL EXPERIENCE", rightX, 150);
    cursor = 170;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    resume.experience.forEach((entry) => {
      if (cursor > pageHeight - 80) {
        doc.addPage();
        cursor = 50;
      }
      doc.setFont("helvetica", "bold");
      doc.text(entry.company || "", rightX, cursor);
      doc.setFont("helvetica", "normal");
      doc.text(`${entry.role || ""} • ${entry.location || ""}`, rightX, cursor + 14);
      doc.text(entry.duration || "", rightX, cursor + 28);
      const expLines = doc.splitTextToSize(entry.details || "", contentWidth);
      doc.text(expLines, rightX, cursor + 44);
      cursor += 44 + expLines.length * 12;
      cursor += 10;
    });

    if (cursor > pageHeight - 140) {
      doc.addPage();
      cursor = 50;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("EDUCATION", rightX, cursor);
    cursor += 20;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    resume.education.forEach((entry) => {
      if (cursor > pageHeight - 80) {
        doc.addPage();
        cursor = 50;
      }
      doc.setFont("helvetica", "bold");
      doc.text(entry.school || "", rightX, cursor);
      doc.setFont("helvetica", "normal");
      doc.text(`${entry.degree || ""} • ${entry.year || ""}`, rightX, cursor + 14);
      const eduLines = doc.splitTextToSize(entry.details || "", contentWidth);
      doc.text(eduLines, rightX, cursor + 30);
      cursor += 30 + eduLines.length * 12;
      cursor += 10;
    });

    doc.save(`${resume.personal.fullName.replace(/\s+/g, "_")}_resume.pdf`);
    setStatus("PDF downloaded successfully.");
  };

  const handleLogout = () => {
    document.cookie = "auth_user=; path=/; max-age=0";
    navigate("/login");
  };

  return (
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">Student Resume Designer</h2>
              <p className="mt-2 text-sm text-slate-400">Manage personal details, profile photo, education history, and export your resume as a PDF.</p>
            </div>
            <button
              type="button"
              onClick={exportPdf}
              className="inline-flex items-center rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600"
            >
              Download PDF
            </button>
          </div>
          {status && <p className="mb-4 text-sm text-emerald-300">{status}</p>}

          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
                <h3 className="text-lg font-semibold text-white">Personal Information</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {[
                    { name: "fullName", label: "Full Name" },
                    { name: "jobTitle", label: "Job Title" },
                    { name: "email", label: "Email" },
                    { name: "phone", label: "Phone" },
                    { name: "address", label: "Location" },
                  ].map((field) => (
                    <label key={field.name} className="block text-sm text-slate-300">
                      <span className="mb-2 block text-slate-400">{field.label}</span>
                      <input
                        name={field.name}
                        value={resume.personal[field.name]}
                        onChange={(event) => updatePersonal(field.name, event.target.value)}
                        className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-500"
                      />
                    </label>
                  ))}
                  <label className="md:col-span-2 block text-sm text-slate-300">
                    <span className="mb-2 block text-slate-400">Profile Summary</span>
                    <textarea
                      name="summary"
                      value={resume.personal.summary}
                      onChange={(event) => updatePersonal("summary", event.target.value)}
                      rows={4}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-500"
                    />
                  </label>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Education Background</h3>
                  <button
                    type="button"
                    onClick={addEducation}
                    className="rounded-full border border-cyan-500/40 px-3 py-2 text-sm text-cyan-400 transition hover:border-cyan-300"
                  >
                    + Add entry
                  </button>
                </div>
                <div className="mt-4 space-y-4">
                  {resume.education.map((entry) => (
                    <div key={entry.id} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="block text-sm text-slate-300">
                          <span className="mb-2 block text-slate-400">School</span>
                          <input
                            value={entry.school}
                            onChange={(event) => updateEducation(entry.id, "school", event.target.value)}
                            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                          />
                        </label>
                        <label className="block text-sm text-slate-300">
                          <span className="mb-2 block text-slate-400">Degree</span>
                          <input
                            value={entry.degree}
                            onChange={(event) => updateEducation(entry.id, "degree", event.target.value)}
                            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                          />
                        </label>
                        <label className="block text-sm text-slate-300">
                          <span className="mb-2 block text-slate-400">Year</span>
                          <input
                            value={entry.year}
                            onChange={(event) => updateEducation(entry.id, "year", event.target.value)}
                            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                          />
                        </label>
                        <label className="block text-sm text-slate-300">
                          <span className="mb-2 block text-slate-400">Details</span>
                          <input
                            value={entry.details}
                            onChange={(event) => updateEducation(entry.id, "details", event.target.value)}
                            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                          />
                        </label>
                      </div>
                      <div className="mt-3 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => removeEducation(entry.id)}
                          className="rounded-full border border-rose-500/40 px-3 py-2 text-sm text-rose-400 transition hover:border-rose-300"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Skills & Languages</h3>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={addSkill}
                      className="rounded-full border border-cyan-500/40 px-3 py-2 text-sm text-cyan-400 transition hover:border-cyan-300"
                    >
                      + Skill
                    </button>
                    <button
                      type="button"
                      onClick={addLanguage}
                      className="rounded-full border border-cyan-500/40 px-3 py-2 text-sm text-cyan-400 transition hover:border-cyan-300"
                    >
                      + Language
                    </button>
                  </div>
                </div>
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="mb-3 text-sm font-semibold text-white">Skills</p>
                    <div className="space-y-3">
                      {resume.skills.map((skill, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            value={skill}
                            onChange={(event) => updateSkills(index, event.target.value)}
                            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                          />
                          <button
                            type="button"
                            onClick={() => removeSkill(index)}
                            className="rounded-full border border-rose-500/40 px-3 py-3 text-sm text-rose-400 transition hover:border-rose-300"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-3 text-sm font-semibold text-white">Languages</p>
                    <div className="space-y-3">
                      {resume.languages.map((language, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            value={language}
                            onChange={(event) => updateLanguages(index, event.target.value)}
                            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                          />
                          <button
                            type="button"
                            onClick={() => removeLanguage(index)}
                            className="rounded-full border border-rose-500/40 px-3 py-3 text-sm text-rose-400 transition hover:border-rose-300"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Experience</h3>
                  <button
                    type="button"
                    onClick={addExperience}
                    className="rounded-full border border-cyan-500/40 px-3 py-2 text-sm text-cyan-400 transition hover:border-cyan-300"
                  >
                    + Add experience
                  </button>
                </div>
                <div className="mt-4 space-y-4">
                  {resume.experience.map((entry) => (
                    <div key={entry.id} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="block text-sm text-slate-300">
                          <span className="mb-2 block text-slate-400">Company</span>
                          <input
                            value={entry.company}
                            onChange={(event) => updateExperience(entry.id, "company", event.target.value)}
                            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                          />
                        </label>
                        <label className="block text-sm text-slate-300">
                          <span className="mb-2 block text-slate-400">Role</span>
                          <input
                            value={entry.role}
                            onChange={(event) => updateExperience(entry.id, "role", event.target.value)}
                            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                          />
                        </label>
                        <label className="block text-sm text-slate-300">
                          <span className="mb-2 block text-slate-400">Duration</span>
                          <input
                            value={entry.duration}
                            onChange={(event) => updateExperience(entry.id, "duration", event.target.value)}
                            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                          />
                        </label>
                        <label className="block text-sm text-slate-300">
                          <span className="mb-2 block text-slate-400">Location</span>
                          <input
                            value={entry.location}
                            onChange={(event) => updateExperience(entry.id, "location", event.target.value)}
                            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                          />
                        </label>
                        <label className="md:col-span-2 block text-sm text-slate-300">
                          <span className="mb-2 block text-slate-400">Details</span>
                          <textarea
                            value={entry.details}
                            onChange={(event) => updateExperience(entry.id, "details", event.target.value)}
                            rows={3}
                            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                          />
                        </label>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeExperience(entry.id)}
                          className="rounded-full border border-rose-500/40 px-3 py-2 text-sm text-rose-400 transition hover:border-rose-300"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-950 p-5 shadow-2xl shadow-cyan-500/10">
                <h3 className="text-lg font-semibold text-white">Resume Preview</h3>
                <div className="mt-5 rounded-3xl border border-slate-800 bg-slate-950/95 p-5">
                  <div className="flex flex-col items-center gap-4 rounded-3xl bg-gradient-to-br from-cyan-500/10 via-slate-900/50 to-slate-950/80 p-5 text-center">
                    {resume.photo ? (
                      <img src={resume.photo} alt="Profile" className="h-32 w-32 rounded-full border-4 border-cyan-500 object-cover" />
                    ) : (
                      <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-dashed border-cyan-500 bg-slate-950 text-slate-400">Photo</div>
                    )}
                    <div>
                      <p className="text-xl font-semibold text-white">{resume.personal.fullName}</p>
                      <p className="text-sm text-cyan-300">{resume.personal.headline}</p>
                    </div>
                  </div>
                  <div className="mt-5 space-y-3 text-sm text-slate-300">
                    <p><span className="font-semibold text-white">Email:</span> {resume.personal.email}</p>
                    <p><span className="font-semibold text-white">Phone:</span> {resume.personal.phone}</p>
                    <p><span className="font-semibold text-white">Address:</span> {resume.personal.address}</p>
                  </div>
                  <div className="mt-5 rounded-3xl border border-slate-800 bg-slate-900/80 p-4 text-sm text-slate-300">
                    <h4 className="mb-2 text-sm font-semibold uppercase tracking-[0.24em] text-cyan-400">About</h4>
                    <p>{resume.personal.about}</p>
                  </div>
                  <div className="mt-5 space-y-4">
                    <h4 className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-400">Education</h4>
                    {resume.education.map((entry) => (
                      <div key={entry.id} className="rounded-3xl border border-slate-800 bg-slate-950/90 p-4">
                        <p className="font-medium text-white">{entry.school}</p>
                        <p className="text-sm text-slate-400">{entry.degree} • {entry.year}</p>
                        <p className="mt-2 text-sm text-slate-300">{entry.details}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
                <label className="block text-sm text-slate-300">
                  <span className="mb-2 block text-slate-400">Upload Profile Photo</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none" />
                </label>
              </div>
            </div>
          </div>
        </section>
      </div>
  );
};

export default ResumePage;
