import React, { useState } from "react";
import { BASE_URI } from "../../config/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const StudentLogin = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.email.trim()) {
      setError("Please enter your email address.");
      toast.error("Please enter your email address.");
      return;
    }

    if (!formData.password) {
      setError("Please enter your password.");
      toast.error("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${BASE_URI}/api/studentdashboard/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email.trim(),
            password: formData.password,
          }),
        }
      );

      // Convert response into JSON
      const data = await response.json();

      console.log("API Response:", data);

      // Handle backend errors
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Login failed");
      }

      // Student data
      console.log("Student:", data.student);

      toast.success(data.message || "Login successful!");

      // Save student information if needed
      sessionStorage.setItem(
        "student",
        JSON.stringify(data.student)
      );

      // Go to dashboard
      navigate("/student/");
    } catch (err) {
      console.error("Login Error:", err);

      setError(
        err.message || "Something went wrong. Please try again."
      );

      toast.error(
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center justify-center">
        <section className="w-full rounded-2xl bg-white p-6 shadow-xl sm:p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-xl font-bold text-white">
              S
            </div>

            <h1 className="text-2xl font-bold text-slate-900">
              Student Login
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Login to your student account
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="mb-5">
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                autoComplete="email"
                disabled={loading}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100"
              />
            </div>

            {/* Password */}
            <div className="mb-6">
              <div className="mb-2 flex justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-700"
                >
                  Password
                </label>

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  className="text-sm font-medium text-indigo-600"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>   

              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
};

export default StudentLogin;
