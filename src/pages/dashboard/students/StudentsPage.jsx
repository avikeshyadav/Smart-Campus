import { useEffect, useState } from "react";
import DashboardShell from "../DashboardShell";
import { useAuth } from "../../../context/AuthContext";
import {BASE_URI} from "../../../config/api";
const emptyStudentForm = {
  name: "",
  className: "",
  status: "Pending",
  access: "Review",
  email: "",
  phone: "",
  guardian: "",
};


const StudentsPage = () => {
    const {accessToken} = useAuth();

  const [students, setStudents] = useState([]);
  const [studentForm, setStudentForm] = useState(emptyStudentForm);
  const [editingId, setEditingId] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [loading, setLoading] = useState(true);

  
const fetchStudents = async () => {

  const response = await fetch(`${BASE_URI}/students`,
    {
      method:"GET",
      headers:{
        Authorization: `Bearer ${accessToken}`
      }
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch students");
  }
  return response.json();
};

const syncStudents = async (value) => {
  const response = await fetch(`${BASE_URI}/students`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(value),
  });

  if (!response.ok) {
    throw new Error("Failed to sync students");
  }
console.log(response.json());

  return response.json();
};

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const data = await fetchStudents();
        setStudents(data);
        if (data.length) setSelectedStudentId(data[0].id);
      } catch (error) {
        console.error("Failed to load students", error);
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  console.log("Students:",students);
  const selectedStudent = students.find((student) => student.id === selectedStudentId) || students[0] || null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setStudentForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setStudentForm(emptyStudentForm);
    setEditingId(null); 
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextStudent = {
      id: editingId ?? Date.now(),
      name: studentForm.name,
      class: studentForm.className,
      status: studentForm.status,
      access: studentForm.access,
      email: studentForm.email,
      phone: studentForm.phone,
      guardian: studentForm.guardian,
    };

    const nextStudents = editingId
      ? students.map((student) => (student.id === editingId ? nextStudent : student))
      : [nextStudent, ...students];

    try {
      setStudents(nextStudents);
      await syncStudents(nextStudents);
      setSelectedStudentId(nextStudent.id);
      resetForm();
    } catch (error) {
      console.error("Failed to save student", error);
    }
  };

  const handleEdit = (student) => {
    setEditingId(student.id);
    setSelectedStudentId(student.id);
    setStudentForm({
      name: student.name,
      className: student.class,
      status: student.status,
      access: student.access,
      email: student.email || "",
      phone: student.phone || "",
      guardian: student.guardian || "",
    });
  };

  const handleDelete = async (id) => {
    const nextStudents = students.filter((student) => student.id !== id);
    try {
      setStudents(nextStudents);
      await syncStudents(nextStudents);
      if (selectedStudentId === id) {
        setSelectedStudentId(nextStudents[0]?.id || null);
      }
      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.error("Failed to delete student", error);
    }
  };

  return (
    <DashboardShell title="Students">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Student Management</h2>
              <p className="mt-1 text-sm text-slate-400">Create, edit, and organize student records in a dedicated panel.</p>
            </div>
            <span className="rounded-full border border-cyan-500/40 px-3 py-1 text-sm text-cyan-400">{loading ? "Loading..." : `${students.length} Students`}</span>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm text-slate-300">
                  <span className="mb-2 block">Student Name</span>
                  <input name="name" value={studentForm.name} onChange={handleChange} required className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-cyan-500" placeholder="Enter name" />
                </label>
                <label className="text-sm text-slate-300">
                  <span className="mb-2 block">Class</span>
                  <input name="className" value={studentForm.className} onChange={handleChange} required className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-cyan-500" placeholder="10-A" />
                </label>
                <label className="text-sm text-slate-300">
                  <span className="mb-2 block">Status</span>
                  <select name="status" value={studentForm.status} onChange={handleChange} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-cyan-500">
                    <option value="Verified">Verified</option>
                    <option value="Pending">Pending</option>
                    <option value="Review">Review</option>
                  </select>
                </label>
                <label className="text-sm text-slate-300">
                  <span className="mb-2 block">Access</span>
                  <select name="access" value={studentForm.access} onChange={handleChange} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-cyan-500">
                    <option value="Granted">Granted</option>
                    <option value="Review">Review</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </label>
                <label className="text-sm text-slate-300">
                  <span className="mb-2 block">Email</span>
                  <input name="email" value={studentForm.email} onChange={handleChange} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-cyan-500" placeholder="student@email.com" />
                </label>
                <label className="text-sm text-slate-300">
                  <span className="mb-2 block">Phone</span>
                  <input name="phone" value={studentForm.phone} onChange={handleChange} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-cyan-500" placeholder="+91 99999 99999" />
                </label>
              </div>
              <label className="mt-4 block text-sm text-slate-300">
                <span className="mb-2 block">Guardian</span>
                <input name="guardian" value={studentForm.guardian} onChange={handleChange} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none focus:border-cyan-500" placeholder="Parent or guardian name" />
              </label>
              <div className="mt-4 flex gap-3">
                <button type="submit" className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600">{editingId ? "Update Student" : "Add Student"}</button>
                <button type="button" onClick={resetForm} className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-500 hover:text-cyan-400">Reset</button>
              </div>
            </form>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <h3 className="text-lg font-semibold text-white">Student Details Preview</h3>
                {selectedStudent ? (
                  <div className="mt-3 space-y-2 text-sm text-slate-300">
                    <p><span className="text-slate-400">Name:</span> {selectedStudent.name}</p>
                    <p><span className="text-slate-400">Class:</span> {selectedStudent.class}</p>
                    <p><span className="text-slate-400">Status:</span> {selectedStudent.status}</p>
                    <p><span className="text-slate-400">Access:</span> {selectedStudent.access}</p>
                    <p><span className="text-slate-400">Email:</span> {selectedStudent.email || "—"}</p>
                    <p><span className="text-slate-400">Phone:</span> {selectedStudent.phone || "—"}</p>
                    <p><span className="text-slate-400">Guardian:</span> {selectedStudent.guardian || "—"}</p>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-400">No student selected yet.</p>
                )}
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/70 p-2">
                <table className="min-w-full text-left text-sm text-slate-300">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-3 pr-4">Name</th>
                      <th className="py-3 pr-4">Class</th>
                      <th className="py-3 pr-4">Status</th>
                      <th className="py-3 pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id} className="border-b border-slate-800/70">
                        <td className="py-3 pr-4">
                          <button type="button" onClick={() => setSelectedStudentId(student.id)} className="text-left font-medium text-white hover:text-cyan-400">{student.name}</button>
                        </td>
                        <td className="py-3 pr-4">{student.class}</td>
                        <td className="py-3 pr-4">{student.status}</td>
                        <td className="py-3 pr-4">
                          <div className="flex gap-2">
                            <button type="button" onClick={() => handleEdit(student)} className="rounded-full border border-cyan-500/40 px-2 py-1 text-xs text-cyan-400">Edit</button>
                            <button type="button" onClick={() => handleDelete(student.id)} className="rounded-full border border-rose-500/40 px-2 py-1 text-xs text-rose-400">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
};

export default StudentsPage;
