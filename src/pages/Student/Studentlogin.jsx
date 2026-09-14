import React, { useState } from "react";
import { BASE_URI } from "../../config/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const StudentLogin = () => {
  const navigate = useNavigate();
  console.log(BASE_URI)
  const [isRegister, setIsRegister] = useState(false);

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

    if (error) setError("");
  };

  const switchMode = () => {
    setIsRegister((prev) => !prev);
    setError("");

    setFormData({
      email: "",
      password: "",
    });

    setShowPassword(false);
  };

  const handleLogin = async () => {
    const response = await fetch(`${BASE_URI}/api/student/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: formData.email.trim(),
        password: formData.password,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Login failed");
    }

    if (data.user) {
      sessionStorage.setItem("student", JSON.stringify(data.user));
    }

    if (data.accessToken) {
      sessionStorage.setItem(
        "Student_access_token",
        data.accessToken
      );
    }

    toast.success(data.message || "Login successful!");

    navigate("/student", {
      replace: true,
    });
  };

  const handleRegister = async () => {
    const response = await fetch(`${BASE_URI}/api/student/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: formData.email.trim(),
        password: formData.password,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Registration failed");
    }

    toast.success(data.message || "Registration successful!");

    setIsRegister(false);

    setFormData({
      email: "",
      password: "",
    });

    setShowPassword(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

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

    if (isRegister && formData.password.length < 6) {
      const message = "Password must be at least 6 characters.";
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
        isRegister ? "Register Error:" : "Login Error:",
        err
      );

      const message =
        err.message || "Something went wrong. Please try again.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-8 sm:px-6">

      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-indigo-600/30 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-3xl" />
      </div>

      <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center">

        <section className="w-full max-w-md">

          {/* Logo / Brand */}
          <div className="mb-6 text-center">

            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-2xl font-extrabold text-white shadow-lg shadow-indigo-500/30">
              S
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white">
              Student Portal
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Access your student account
            </p>

          </div>

          {/* Card */}
          <div className="rounded-3xl border border-white/10 bg-white p-6 shadow-2xl shadow-black/30 sm:p-8">

            {/* Login / Register Toggle */}
            <div className="mb-7 grid grid-cols-2 rounded-xl bg-slate-100 p-1">

              <button
                type="button"
                onClick={() => !loading && !isRegister ? null : switchMode()}
                disabled={loading}
                className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                  !isRegister
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Login
              </button>

              <button
                type="button"
                onClick={() => !loading && isRegister ? null : switchMode()}
                disabled={loading}
                className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                  isRegister
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Register
              </button>

            </div>

            {/* Heading */}
            <div className="mb-6">

              <h2 className="text-xl font-bold text-slate-900">
                {isRegister
                  ? "Create your account"
                  : "Welcome My Dear Student"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {isRegister
                  ? "Please Provide Your Register Email."
                  : "Enter your credentials to continue."}
              </p>

            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold">
                  !
                </span>

                <span>{error}</span>

              </div>
            )}

            <form onSubmit={handleSubmit}>

              {/* Email */}
              <div className="mb-5">

                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email address
                </label>

                <div className="relative">

                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </span>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="avikesh@gmail.com"
                    autoComplete="email"
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                </div>

              </div>

              {/* Password */}
              <div className="mb-6">

                <div className="mb-2 flex items-center justify-between">

                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={loading}
                    className="text-xs font-semibold text-indigo-600 transition hover:text-indigo-700 disabled:opacity-50"
                  >
                    {showPassword ? "Hide password" : "Show password"}
                  </button>

                </div>

                <div className="relative">

                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </span>

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={
                      isRegister
                        ? "Create a password"
                        : "Enter your password"
                    }
                    autoComplete={
                      isRegister
                        ? "new-password"
                        : "current-password"
                    }
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                </div>

                {isRegister && (
                  <p className="mt-2 text-xs text-slate-400">
                    Use at least 6 characters.
                  </p>
                )}

              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:from-indigo-700 hover:to-violet-700 hover:shadow-xl hover:shadow-indigo-500/25 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >

                {loading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                    {isRegister
                      ? "Creating account..."
                      : "Signing you in..."}
                  </>
                ) : (
                  <>
                    {isRegister
                      ? "Create Account"
                      : "Login"}

                    <svg
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </>
                )}

              </button>

            </form>

            {/* Bottom */}
            <div className="mt-6 text-center">

              <p className="text-sm text-slate-500">

                {isRegister
                  ? "Already have an account?"
                  : "Don't have an account?"}

                <button
                  type="button"
                  onClick={switchMode}
                  disabled={loading}
                  className="ml-1 font-bold text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
                >
                  {isRegister
                    ? "Login"
                    : "Create account"}
                </button>

              </p>

            </div>

          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} Student Portal. All rights reserved.
          </p>

        </section>

      </div>
    </main>
  );
};

export default StudentLogin;
