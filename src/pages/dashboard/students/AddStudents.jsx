import { useState } from "react";
import DashboardShell from "../DashboardShell";
const AddStudent = () => {
  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      alert("Select Image");
      return;
    }

    const formData = new FormData();
    formData.append("student_id", studentId);
    formData.append("name", name);
    formData.append("image", image);

    try {
      const res = await fetch("http://127.0.0.1:8000/students/add", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
      } else {
        setMessage(data.detail);
      }
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <DashboardShell title="Add Student">
    <div className="p-6 rounded-xl bg-slate-900 text-white">
      <h2 className="text-2xl mb-5">Add Student</h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          className="w-full p-2 rounded bg-slate-800"
          placeholder="Student ID"
          value={studentId}
          onChange={(e)=>setStudentId(e.target.value)}
        />

        <input
          className="w-full p-2 rounded bg-slate-800"
          placeholder="Student Name"
          value={name}
          onChange={(e)=>setName(e.target.value)}
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e)=>setImage(e.target.files[0])}
        />

        <button
          className="bg-cyan-600 px-5 py-2 rounded"
        >
          Add Student
        </button>

      </form>

      <p className="mt-4">{message}</p>

    </div>
    </DashboardShell>
  );
};

export default AddStudent;