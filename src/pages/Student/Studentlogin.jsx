import React, { useState } from "react";
import { BASE_URI } from "../../config/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const StudentLogin = () => {
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // INPUT CHANGE
  // =========================
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

  // =========================
  // SWITCH LOGIN / REGISTER
  // =========================
  const switchMode = () => {
    setIsRegister((prev) => !prev);
    setError("");

    setFormData({
      email: "",
      password: "",
    });

    setShowPassword(false);
  };

  // =========================
  // LOGIN
  // =========================
  const handleLogin = async () => {
    const response = await fetch(
      `${BASE_URI}/api/student/login`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Login failed");
    }

    // Save student
    if (data.user) {
      sessionStorage.setItem(
        "student", 
        JSON.stringify(data.user)
      );
    }

    // Save ACCESS TOKEN
    if (data.accessToken) {
      sessionStorage.setItem(
        "Student_access_token",
        data.accessToken
      );
    }

    toast.success(
      data.message || "Login successful!"
    );

    navigate("/student", {
      replace: true,
    });
  };

  // =========================
  // REGISTER
  // =========================
  const handleRegister = async () => {
    const response = await fetch(
      `${BASE_URI}/api/student/register`,
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

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Registration failed"
      );
    }

    toast.success(
      data.message || "Registration successful!"
    );

    // Registration ke baad login page par switch
    setIsRegister(false);

    setFormData({
      email: "",
      password: "",
    });

    setShowPassword(false);
  };

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // -------------------------
    // VALIDATION
    // -------------------------

    if (!formData.email.trim()) {
      const message = "Please enter your email address.";

      setError(message);
      toast.error(message);

      return;
    }

    if (!formData.password) {
      const message = "Please enter your password.";

      setError(message);
      toast.error(message);

      return;
    }

    // Optional password validation
    if (isRegister && formData.password.length < 6) {
      const message =
        "Password must be at least 6 characters.";

      setError(message);
      toast.error(message);

      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        await handleRegister();
      } else {
        await handleLogin();
      }
    } catch (err) {
      console.error(
        isRegister
          ? "Register Error:"
          : "Login Error:",
        err
      );

      const message =
        err.message ||
        "Something went wrong. Please try again.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">

      <div className="mx-auto flex min-h-[80vh] max-w-md items-center justify-center">

        <section className="w-full rounded-2xl bg-white p-6 shadow-xl sm:p-8">

          {/* ================= HEADER ================= */}

          <div className="mb-8 text-center">

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-xl font-bold text-white">
              S
            </div>

            <h1 className="text-2xl font-bold text-slate-900">
              {isRegister
                ? "Create Student Account"
                : "Student Login"}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {isRegister
                ? "Register your student account"
                : "Login to your student account"}
            </p>

          </div>

          {/* ================= ERROR ================= */}

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* ================= FORM ================= */}

          <form onSubmit={handleSubmit}>

            {/* EMAIL */}

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
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100"
              />

            </div>

            {/* PASSWORD */}

            <div className="mb-6">

              <div className="mb-2 flex items-center justify-between">

                <label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-700"
                >
                  Password
                </label>

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (prev) => !prev
                    )
                  }
                  disabled={loading}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  {showPassword
                    ? "Hide"
                    : "Show"}
                </button>

              </div>

              <input
                id="password"
                name="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={formData.password}
                onChange={handleChange}
                placeholder={
                  isRegister
                    ? "Create your password"
                    : "Enter your password"
                }
                autoComplete={
                  isRegister
                    ? "new-password"
                    : "current-password"
                }
                disabled={loading}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100"
              />

              {isRegister && (
                <p className="mt-2 text-xs text-slate-500">
                  Password must be at least 6 characters.
                </p>
              )}

            </div>

            {/* ================= BUTTON ================= */}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {loading ? (
                <>
                  <span className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />

                  {isRegister
                    ? "Creating account..."
                    : "Logging in..."}
                </>
              ) : (
                isRegister
                  ? "Create Account"
                  : "Login"
              )}

            </button>

          </form>

          {/* ================= SWITCH ================= */}

          <div className="mt-6 text-center">

            <p className="text-sm text-slate-500">

              {isRegister
                ? "Already have an account?"
                : "Don't have an account?"}

              <button
                type="button"
                onClick={switchMode}
                disabled={loading}
                className="ml-1 font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
              >
                {isRegister
                  ? "Login"
                  : "Create Account"}
              </button>

            </p>

          </div>

        </section>

      </div>

    </main>
  );
};

export default StudentLogin;