import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {BASE_URI} from '../config/api';
import {
  ShieldCheck,
  ScanFace,
  LockKeyhole,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle2,
  Users,  
  Building2,
  Fingerprint,
  Activity,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Globe2,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";

const initialState = {
  name: "",
  email: "",
  password: "",
  captcha: "",
};


const sliderImages = [
  {
    image:
      "../../../media/collegePic/background_3.jpeg",
    title: "Smart Campus",
    description:
      "Experience a modern and intelligent campus management ecosystem.",
  },
  {
    image:
      "../../../media/collegePic/background_!.jpeg",
    title: "Secure Access",
    description:
      "Advanced security technologies keep your campus safe and connected.",
  },
  {
    image:
      "../../../media/collegePic/background_2.jpeg",
    title: "Digital Management",
    description:
      "Manage students, faculty, attendance and campus activities digitally.",
  },
  {
    image:
      "../../../media/collegePic/background.jpeg",
    title: "Connected Community",
    description:
      "One platform for students, faculty, administration and campus security.",
  },
];

const features = [
  {
    icon: ScanFace,
    title: "Face Recognition",
    description: "Smart identity verification",
  },
  {
    icon: ShieldCheck,
    title: "Secure Login",
    description: "Protected authentication",
  },
  {
    icon: Activity,
    title: "Live Monitoring",
    description: "Real-time campus insights",
  },
  {
    icon: Users,
    title: "Student Management",
    description: "Centralized student records",
  },
];

const LoginPage = () => {
  const [isRegister, setIsRegister] = useState(false);

  const [formData, setFormData] = useState(initialState);

  const [captcha, setCaptcha] = useState({
    token: "",
    value: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [currentSlide, setCurrentSlide] = useState(0);

  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // =========================
  // CAPTCHA
  // =========================

  const loadCaptcha = async () => {
    try {
      const response = await fetch(`${BASE_URI}/api/captcha`, {
        credentials: "include",
      });

      const data = await response.json();

      setCaptcha({
        token: data.token,
        value: data.captcha,
      });

      setFormData((prev) => ({
        ...prev,
        captcha: "",
      }));
    } catch (err) {
      console.error(err);

      toast.error(
        "Backend is not reachable. Start the backend server first."
      );
    }
  };

  useEffect(() => {
    loadCaptcha();
  }, []);

  // =========================
  // AUTO IMAGE SLIDER
  // =========================

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
  };

  const previousSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + sliderImages.length) % sliderImages.length
    );
  };

  // =========================
  // INPUT CHANGE
  // =========================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // LOGIN / REGISTER
  // =========================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      (isRegister && !formData.name.trim()) ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.captcha.trim()
    ) {
      toast.error("Please fill all required fields including captcha.");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      captcha: formData.captcha.trim(),
      token: captcha.token,
    };

    try {
      setIsLoading(true);

      const endpoint = isRegister
        ? `${BASE_URI}/api/register`
        : `${BASE_URI}/api/login`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        await loadCaptcha();

        toast.error(data.message || "Authentication failed.");

        return;
      }

      if (isRegister) {
        toast.success(data.message || "Account created successfully!");

        setIsRegister(false);

        setFormData(initialState);

        await loadCaptcha();

        return;
      }

      toast.success(`Welcome Mr. ${data.user?.name || "User"}`);

      login(data.accessToken, data.user);

      navigate("/dashboard");
    } catch (err) {
      console.error(err);

      toast.error(
        "Server connection failed. Start the backend server first."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // =========================
  // SWITCH LOGIN / REGISTER
  // =========================

  const toggleAuthMode = () => {
    setIsRegister((prev) => !prev);

    setFormData(initialState);

    loadCaptcha();
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">

      {/* =========================================
          BACKGROUND IMAGE
      ========================================= */}

      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=2200&q=90')",
        }}
      />

      {/* Dark overlay */}

      <div className="absolute inset-0 bg-slate-950/90" />

      {/* Gradient overlays */}

      <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/50 via-slate-950/80 to-blue-950/60" />

      {/* Decorative glow */}

      <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-3xl" />

      {/* =========================================
          HEADER
      ========================================= */}

      <header className="relative z-30 border-b border-white/10 bg-slate-950/60 backdrop-blur-xl">

        <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between px-5 sm:px-8 lg:px-12">

          {/* Logo */}

          <Link
            to="/"
            className="group flex items-center gap-3"
          >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl overflow-hidden shadow-lg">
          <img
            src="../../../media/collegePic/logo.jpeg"
            alt="Logo"
            className="h-full w-full object-cover"
          />
        </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white sm:text-2xl">
                Smart<span className="text-cyan-400">Campus</span>
              </h1>

              <p className="hidden text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400 sm:block">
                Intelligent Campus System
              </p>
            </div>
          </Link>

          {/* Header Right */}

          <div className="flex items-center gap-3 sm:gap-6">

            <div className="hidden items-center gap-2 text-xs font-semibold text-slate-400 md:flex">
              <Globe2 size={16} className="text-cyan-400" />
              Secure Digital Campus
            </div>

            <Link
              to="/"
              className="rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm font-bold text-slate-200 transition hover:border-cyan-500 hover:text-cyan-400 sm:px-5"
            >
              Home
            </Link>

          </div>
        </div>
      </header>

      {/* =========================================
          MAIN
      ========================================= */}

      <main className="relative z-20 mx-auto flex min-h-[calc(100vh-80px)] max-w-[1600px] items-center px-4 py-8 sm:px-8 lg:px-12">

        <div className="grid w-full grid-cols-1 gap-8 xl:grid-cols-[1.3fr_0.7fr] xl:gap-12">

          {/* =====================================
              LEFT SECTION
          ===================================== */}

          <section className="hidden min-h-[680px] overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/30 shadow-2xl backdrop-blur-sm xl:block">

            {/* Slider */}

            <div className="relative h-full min-h-[680px] overflow-hidden">

              {sliderImages.map((slide, index) => (
                <div
                  key={slide.title}
                  className={`absolute inset-0 transition-all duration-1000 ${
                    currentSlide === index
                      ? "scale-100 opacity-100"
                      : "scale-105 opacity-0"
                  }`}
                >

                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="h-full w-full object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-transparent to-transparent" />

                </div>
              ))}

              {/* Slider Content */}

              <div className="absolute bottom-0 left-0 right-0 p-10 lg:p-14">

                <div className="mb-5 flex w-fit items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-cyan-300 backdrop-blur-md">

                  <Sparkles size={14} />

                  Next Generation Campus

                </div>

                <h2 className="max-w-2xl text-4xl font-black leading-tight text-white lg:text-5xl">

                  {sliderImages[currentSlide].title}

                </h2>

                <p className="mt-4 max-w-xl text-base font-medium leading-7 text-slate-300 lg:text-lg">

                  {sliderImages[currentSlide].description}

                </p>

                {/* Features */}

                <div className="mt-8 grid max-w-3xl grid-cols-2 gap-3">

                  {features.map((feature) => {
                    const Icon = feature.icon;

                    return (
                      <div
                        key={feature.title}
                        className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3 backdrop-blur-md"
                      >

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10">
                          <Icon
                            size={18}
                            className="text-cyan-400"
                          />
                        </div>

                        <div>
                          <p className="text-sm font-bold text-white">
                            {feature.title}
                          </p>

                          <p className="text-[11px] text-slate-400">
                            {feature.description}
                          </p>
                        </div>

                      </div>
                    );
                  })}

                </div>

              </div>

              {/* Previous */}

              <button
                type="button"
                onClick={previousSlide}
                className="absolute left-5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-md transition hover:border-cyan-400 hover:bg-cyan-500/20"
              >
                <ChevronLeft size={20} />
              </button>

              {/* Next */}

              <button
                type="button"
                onClick={nextSlide}
                className="absolute right-5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-md transition hover:border-cyan-400 hover:bg-cyan-500/20"
              >
                <ChevronRight size={20} />
              </button>

              {/* Dots */}

              <div className="absolute bottom-7 right-10 flex gap-2">

                {sliderImages.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      currentSlide === index
                        ? "w-8 bg-cyan-400"
                        : "w-2 bg-white/40 hover:bg-white/70"
                    }`}
                  />
                ))}

              </div>

            </div>
          </section>

          {/* =====================================
              RIGHT LOGIN SECTION
          ===================================== */}

          <section className="flex items-center justify-center">

            <div className="w-full max-w-xl">

              {/* Mobile Brand */}

              <div className="mb-6 text-center xl:hidden">

                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10">
                  <ShieldCheck
                    size={34}
                    className="text-cyan-400"
                  />
                </div>

                <h2 className="text-3xl font-black">
                  Smart<span className="text-cyan-400">Campus</span>
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  Intelligent Campus Management
                </p>

              </div>

              {/* Login Card */}

              <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/85 p-6 shadow-2xl shadow-black/50 backdrop-blur-2xl sm:p-8 lg:p-10">

                {/* Card Header */}

                <div className="mb-8">

                  <div className="mb-5 flex items-center justify-between">

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10">
                      {isRegister ? (
                        <Users
                          size={24}
                          className="text-cyan-400"
                        />
                      ) : (
                        <LockKeyhole
                          size={24}
                          className="text-cyan-400"
                        />
                      )}
                    </div>

                    <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                      System Online
                    </div>

                  </div>

                  <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                    {isRegister ? "Create Account" : "Welcome Back"}
                  </h1>

                  <p className="mt-2 text-sm font-medium leading-6 text-slate-400">
                    {isRegister
                      ? "Create your secure SmartCampus account."
                      : "Sign in securely to access your campus dashboard."}
                  </p>

                </div>

                {/* Form */}

                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >

                  {/* Name */}

                  {isRegister && (
                    <div>

                      <label
                        htmlFor="name"
                        className="mb-2 block text-sm font-bold text-slate-300"
                      >
                        Full Name
                      </label>

                      <div className="relative">

                        <Users
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                        />

                        <input
                          id="name"
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleChange}
                          autoComplete="name"
                          className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-3.5 pl-11 pr-4 text-sm font-medium text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                          placeholder="Enter your full name"
                        />

                      </div>

                    </div>
                  )}

                  {/* Email */}

                  <div>

                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-bold text-slate-300"
                    >
                      Email Address
                    </label>

                    <div className="relative">

                      <svg
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect
                          width="20"
                          height="16"
                          x="2"
                          y="4"
                          rx="2"
                        />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>

                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        autoComplete="email"
                        className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-3.5 pl-11 pr-4 text-sm font-medium text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                        placeholder="you@example.com"
                      />

                    </div>

                  </div>

                  {/* Password */}

                  <div>

                    <div className="mb-2 flex items-center justify-between">

                      <label
                        htmlFor="password"
                        className="text-sm font-bold text-slate-300"
                      >
                        Password
                      </label>

                      {!isRegister && (
                        <Link
                          to="/forgetpassword"
                          className="text-xs font-bold text-cyan-400 transition hover:text-cyan-300 hover:underline"
                        >
                          Forgot Password?
                        </Link>
                      )}

                    </div>

                    <div className="relative">

                      <LockKeyhole
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                      />

                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        autoComplete={
                          isRegister
                            ? "new-password"
                            : "current-password"
                        }
                        className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-3.5 pl-11 pr-12 text-sm font-medium text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                        placeholder="Enter your password"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((prev) => !prev)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition hover:bg-slate-700 hover:text-cyan-400"
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>

                    </div>

                  </div>

                  {/* CAPTCHA */}

                  <div>

                    <label
                      htmlFor="captcha"
                      className="mb-2 block text-sm font-bold text-slate-300"
                    >
                      Security Verification
                    </label>

                    <div className="grid grid-cols-[auto_auto_1fr] gap-2">

                      {/* Captcha value */}

                      <div className="flex min-w-[105px] items-center justify-center rounded-xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 px-4 py-3.5">

                        <span className="select-none font-mono text-lg font-black tracking-[0.25em] text-cyan-300">
                          {captcha.value || "------"}
                        </span>

                      </div>

                      {/* Refresh */}

                      <button
                        type="button"
                        onClick={loadCaptcha}
                        className="flex h-full min-h-[50px] w-12 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-cyan-400 transition hover:border-cyan-500 hover:bg-cyan-500/10"
                        aria-label="Refresh captcha"
                      >
                        <RefreshCw size={18} />
                      </button>

                      {/* Input */}

                      <input
                        id="captcha"
                        name="captcha"
                        type="text"
                        value={formData.captcha}
                        onChange={handleChange}
                        autoComplete="off"
                        className="min-w-0 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3.5 text-sm font-bold text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                        placeholder="Enter code"
                      />

                    </div>

                  </div>

                  {/* Security Info */}

                  <div className="flex items-center gap-3 rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-3">

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                      <Fingerprint
                        size={17}
                        className="text-emerald-400"
                      />
                    </div>

                    <p className="text-xs font-medium leading-5 text-slate-400">
                      Your authentication data is protected with secure
                      verification and encrypted communication.
                    </p>

                  </div>

                  {/* Submit */}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-4 text-sm font-black text-white shadow-lg shadow-cyan-500/20 transition duration-300 hover:scale-[1.01] hover:shadow-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    <span className="relative z-10 flex items-center justify-center gap-2">

                      {isLoading ? (
                        <>
                          <RefreshCw
                            size={18}
                            className="animate-spin"
                          />
                          Processing...
                        </>
                      ) : (
                        <>
                          {isRegister
                            ? "Create Secure Account"
                            : "Login to Dashboard"}

                          <ChevronRight
                            size={18}
                            className="transition group-hover:translate-x-1"
                          />
                        </>
                      )}

                    </span>

                    <div className="absolute inset-0 -translate-x-full bg-white/10 transition-transform duration-500 group-hover:translate-x-full" />

                  </button>

                </form>

                {/* Switch Auth */}

                <div className="mt-7 border-t border-slate-800 pt-6 text-center">

                  <p className="text-sm font-medium text-slate-500">

                    {isRegister
                      ? "Already have an account?"
                      : "Don't have an account?"}

                    <button
                      type="button"
                      onClick={toggleAuthMode}
                      className="ml-2 font-black text-cyan-400 transition hover:text-cyan-300 hover:underline"
                    >
                      {isRegister
                        ? "Login here"
                        : "Create one"}
                    </button>

                  </p>

                </div>

                {/* Back Home */}

                <Link
                  to="/"
                  className="mt-5 flex items-center justify-center gap-2 text-xs font-bold text-slate-500 transition hover:text-cyan-400"
                >
                  ← Back to Home
                </Link>

              </div>

              {/* Bottom Security Badges */}

              <div className="mt-5 grid grid-cols-3 gap-2">

                <div className="flex flex-col items-center justify-center rounded-xl border border-white/5 bg-slate-900/50 px-2 py-3 text-center backdrop-blur-md">

                  <ShieldCheck
                    size={18}
                    className="mb-1 text-cyan-400"
                  />

                  <span className="text-[10px] font-bold text-slate-500">
                    SECURE
                  </span>

                </div>

                <div className="flex flex-col items-center justify-center rounded-xl border border-white/5 bg-slate-900/50 px-2 py-3 text-center backdrop-blur-md">

                  <LockKeyhole
                    size={18}
                    className="mb-1 text-cyan-400"
                  />

                  <span className="text-[10px] font-bold text-slate-500">
                    ENCRYPTED
                  </span>

                </div>

                <div className="flex flex-col items-center justify-center rounded-xl border border-white/5 bg-slate-900/50 px-2 py-3 text-center backdrop-blur-md">

                  <CheckCircle2
                    size={18}
                    className="mb-1 text-emerald-400"
                  />

                  <span className="text-[10px] font-bold text-slate-500">
                    VERIFIED
                  </span>

                </div>

              </div>

            </div>

          </section>

        </div>

      </main>

      {/* =========================================
          FOOTER
      ========================================= */}

      <footer className="relative z-20 border-t border-white/5 bg-slate-950/40 px-5 py-4 text-center backdrop-blur-md">

        <p className="text-xs font-medium text-slate-600">
          © {new Date().getFullYear()} SmartCampus · Intelligent Campus
          Management System
        </p>

      </footer>

    </div>
  );
};

export default LoginPage;