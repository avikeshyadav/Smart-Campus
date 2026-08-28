import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  LockKeyhole,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle2,
  Users,
  Fingerprint,
  Activity,
  ChevronRight,
  Sparkles,
  Globe2,
  ShieldAlert,
  KeyRound,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { BASE_URI } from "../config/api";
import { useAuth } from "../context/AuthContext";

const initialState = {
  name: "",
  email: "",
  password: "",
  captcha: "",
};

const sliderImages = [
  {
    image: "/media/collegePic/background_3.jpeg",
    title: "Smart Campus",
    description:
      "Experience a modern and intelligent campus management ecosystem.",
  },
  {
    image: "/media/collegePic/background_1.jpeg",
    title: "Secure Access",
    description:
      "Advanced security technologies keep your campus safe and connected.",
  },
  {
    image: "/media/collegePic/background_2.jpeg", 
    title: "Digital Management",
    description:
      "Manage students, faculty, attendance and campus activities digitally.",
  },
  {
    image: "/media/collegePic/background.jpeg",
    title: "Connected Community",
    description:
      "One platform for students, faculty, administration and campus security.",
  },
];

const features = [
  {
    icon: ShieldCheck,
    title: "Two Factor Authentication",
    description: "Extra layer of account security",
  },
  {
    icon: Fingerprint,
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
  const navigate = useNavigate();
  const { login } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState(initialState);
  const [captcha, setCaptcha] = useState({
    token: "",
    value: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorUserId, setTwoFactorUserId] = useState(null);
  const loadCaptcha = async () => {
    try {
      const response = await fetch(`${BASE_URI}/api/captcha`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load captcha");
      }

      setCaptcha({
        token: data.token,
        value: data.captcha,
      });

      setFormData((prev) => ({
        ...prev,
        captcha: "",
      }));
    } catch (error) {
      console.error("Captcha error:", error);

      toast.error(
        "Backend is not reachable. Please start the backend server."
      );
    }
  };

  // ============================================================
  // INITIAL CAPTCHA
  // ============================================================

  useEffect(() => {
    loadCaptcha();
  }, []);

  // ============================================================
  // IMAGE SLIDER
  // ============================================================

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(
        (prev) => (prev + 1) % sliderImages.length
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // ============================================================
  // HANDLE INPUT
  // ============================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ============================================================
  // LOGIN
  // ============================================================

  const handleLogin = async () => {
    const email = formData.email.trim();
    const password = formData.password;
    const captchaValue = formData.captcha.trim();

    if (!email || !password || !captchaValue) {
      toast.error(
        "Please fill email, password and captcha."
      );
      return;
    }

    if (!captcha.token) {
      toast.error("Captcha expired. Please refresh captcha.");
      await loadCaptcha();
      return;
    }

    const payload = {
      email,
      password,
      captcha: captchaValue,
      token: captcha.token,
    };

    try {
      setIsLoading(true);

      const response = await fetch(`${BASE_URI}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (
        response.ok &&
        data.requiresTwoFactor === true
      ) {
        setTwoFactorUserId(data.tempToken);
        setTwoFactorCode("");
        setShowTwoFactor(true);

        toast.success(
          "Enter your 2FA authentication code."
        );

        return;
      }

      // ========================================================
      // LOGIN ERROR
      // ========================================================

      if (!response.ok) {
        await loadCaptcha();

        toast.error(
          data.message || "Authentication failed."
        );

        return;
      }

      // ========================================================
      // NORMAL LOGIN SUCCESS
      // ========================================================

      if (!data.accessToken || !data.user) {
        toast.error("Invalid login response from server.");
        return;
      }
      toast.success(
        `Welcome ${data.user?.name || "User"}`
      );
      login(
        data.accessToken,
        data.user
      );
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);

      toast.error(
        "Server connection failed. Please start the backend server."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // VERIFY LOGIN 2FA
  // ============================================================

  const verifyTwoFactor = async () => {
    const code = twoFactorCode.trim();

    if (!code) {
      toast.error(
        "Please enter your authentication code."
      );
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      toast.error(
        "Authentication code must contain 6 digits."
      );
      return;
    }

    if (!twoFactorUserId) {
      toast.error(
        "Authentication session expired. Please login again."
      );

      backToLogin();
      return;
    }

    try {
      setIsLoading(true);

      // IMPORTANT:
      // Backend route:
      // POST /api/login/2fa

      const response = await fetch(
        `${BASE_URI}/api/login/2fa`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            tempToken: twoFactorUserId,
            code,
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        toast.error(
          data.message ||
            "Invalid authentication code."
        );

        setTwoFactorCode("");

        return;
      }

      if (!data.accessToken || !data.user) {
        toast.error(
          "Invalid authentication response from server."
        );
        return;
      }

      // ========================================================
      // 2FA SUCCESS
      // ========================================================

      toast.success(
        "Two-factor authentication successful."
      );

      login(
        data.accessToken,
        data.user
      );

      navigate("/dashboard");
    } catch (error) {
      console.error(
        "2FA verification error:",
        error
      );

      toast.error(
        "Unable to verify authentication code."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // REGISTER
  // ============================================================

  const handleRegister = async () => {
    const name = formData.name.trim();
    const email = formData.email.trim();
    const password = formData.password;
    const captchaValue = formData.captcha.trim();

    if (
      !name ||
      !email ||
      !password ||
      !captchaValue
    ) {
      toast.error(
        "Please fill all required fields including captcha."
      );
      return;
    }

    if (!captcha.token) {
      toast.error(
        "Captcha expired. Please refresh captcha."
      );

      await loadCaptcha();
      return;
    }

    if (password.length < 6) {
      toast.error(
        "Password must be at least 6 characters."
      );
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(
        `${BASE_URI}/api/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name,
            email,
            password,
            captcha: captchaValue,
            token: captcha.token,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        await loadCaptcha();

        toast.error(
          data.message || "Registration failed."
        );

        return;
      }

      toast.success(
        data.message ||
          "Account created successfully!"
      );

      // Switch to login
      setIsRegister(false);

      setFormData({
        ...initialState,
        email,
      });

      await loadCaptcha();
    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      toast.error(
        "Server connection failed."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isLoading) return;

    if (isRegister) {
      await handleRegister();
    } else {
      await handleLogin();
    }
  };

  // ============================================================
  // SWITCH LOGIN / REGISTER
  // ============================================================

  const toggleAuthMode = async () => {
    setIsRegister((prev) => !prev);

    setShowTwoFactor(false);
    setTwoFactorCode("");
    setTwoFactorUserId(null);

    setShowPassword(false);

    setFormData(initialState);

    await loadCaptcha();
  };

  // ============================================================
  // BACK FROM 2FA
  // ============================================================

  const backToLogin = async () => {
    setShowTwoFactor(false);
    setTwoFactorCode("");
    setTwoFactorUserId(null);

    setFormData((prev) => ({
      ...prev,
      password: "",
      captcha: "",
    }));

    await loadCaptcha();
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">

      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=2200&q=90')",
        }}
      />

      <div className="absolute inset-0 bg-slate-950/90" />

      <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/50 via-slate-950/80 to-blue-950/60" />

      <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-3xl" />

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="relative z-30 border-b border-white/10 bg-slate-950/60 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between px-5 sm:px-8 lg:px-12">

          <Link
            to="/"
            className="group flex items-center gap-3"
          >
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl shadow-lg">
              <img
                src="/media/collegePic/logo.jpeg"
                alt="SmartCampus Logo"
                className="h-full w-full object-cover"
              />
            </div>

            <div>
              <h1 className="text-xl font-black tracking-tight text-white sm:text-2xl">
                Smart
                <span className="text-cyan-400">
                  Campus
                </span>
              </h1>

              <p className="hidden text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400 sm:block">
                Intelligent Campus System
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3 sm:gap-6">

            <div className="hidden items-center gap-2 text-xs font-semibold text-slate-400 md:flex">
              <Globe2
                size={16}
                className="text-cyan-400"
              />
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

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="relative z-20 mx-auto flex min-h-[calc(100vh-80px)] max-w-[1600px] items-center px-4 py-8 sm:px-8 lg:px-12">

        <div className="grid w-full grid-cols-1 gap-8 xl:grid-cols-[1.3fr_0.7fr] xl:gap-12">

          {/* =================================================
              LEFT SLIDER
          ================================================== */}

          <section className="hidden min-h-[680px] overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/30 shadow-2xl backdrop-blur-sm xl:block">

            <div className="relative h-full min-h-[680px] overflow-hidden">

              {sliderImages.map(
                (slide, index) => (
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

                  </div>
                )
              )}

              {/* Slider Content */}

              <div className="absolute bottom-0 left-0 right-0 p-10 lg:p-14">

                <div className="mb-5 flex w-fit items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-cyan-300">

                  <Sparkles size={14} />

                  Next Generation Campus

                </div>

                <h2 className="max-w-2xl text-4xl font-black leading-tight text-white lg:text-5xl">
                  {sliderImages[currentSlide].title}
                </h2>

                <p className="mt-4 max-w-xl text-base font-medium leading-7 text-slate-300 lg:text-lg">
                  {
                    sliderImages[
                      currentSlide
                    ].description
                  }
                </p>

                {/* Features */}

                <div className="mt-8 grid max-w-3xl grid-cols-2 gap-3">

                  {features.map(
                    (feature) => {
                      const Icon =
                        feature.icon;

                      return (
                        <div
                          key={
                            feature.title
                          }
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
                              {
                                feature.title
                              }
                            </p>

                            <p className="text-[11px] text-slate-400">
                              {
                                feature.description
                              }
                            </p>

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

              </div>
            </div>
          </section>

          {/* =================================================
              RIGHT
          ================================================== */}

          <section className="flex items-center justify-center">

            <div className="w-full max-w-xl">

              {/* =================================================
                  AUTH CARD
              ================================================== */}

              <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/85 p-6 shadow-2xl shadow-black/50 backdrop-blur-2xl sm:p-8 lg:p-10">

                {/* =================================================
                    2FA SCREEN
                ================================================== */}

                {showTwoFactor ? (

                  <div>

                    {/* 2FA Header */}

                    <div className="mb-8 text-center">

                      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10">

                        <ShieldAlert
                          size={32}
                          className="text-cyan-400"
                        />

                      </div>

                      <h1 className="text-3xl font-black tracking-tight">
                        Two-Factor Authentication
                      </h1>

                      <p className="mt-3 text-sm leading-6 text-slate-400">
                        Enter the 6-digit authentication
                        code from your authenticator app.
                      </p>

                    </div>

                    <div className="space-y-6">

                      {/* OTP */}

                      <div>

                        <label
                          htmlFor="twoFactorCode"
                          className="mb-2 block text-sm font-bold text-slate-300"
                        >
                          Authentication Code
                        </label>

                        <div className="relative">

                          <KeyRound
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                          />

                          <input
                            id="twoFactorCode"
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            autoFocus
                            value={twoFactorCode}
                            onChange={(event) => {
                              const value =
                                event.target.value.replace(
                                  /\D/g,
                                  ""
                                );

                              setTwoFactorCode(
                                value.slice(0, 6)
                              );
                            }}
                            onKeyDown={(event) => {
                              if (
                                event.key ===
                                "Enter"
                              ) {
                                verifyTwoFactor();
                              }
                            }}
                            placeholder="000000"
                            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-4 pl-11 pr-4 text-center text-xl font-black tracking-[0.5em] text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                          />

                        </div>
                      </div>

                      {/* Security Information */}

                      <div className="rounded-xl border border-cyan-500/10 bg-cyan-500/5 p-4">

                        <div className="flex gap-3">

                          <ShieldCheck
                            size={20}
                            className="mt-0.5 shrink-0 text-cyan-400"
                          />

                          <p className="text-xs leading-5 text-slate-400">
                            Your account has two-factor
                            authentication enabled. Your
                            password alone is not enough
                            to complete the login.
                          </p>

                        </div>
                      </div>

                      {/* Verify */}

                      <button
                        type="button"
                        disabled={
                          isLoading ||
                          twoFactorCode.length !==
                            6
                        }
                        onClick={
                          verifyTwoFactor
                        }
                        className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-4 text-sm font-black text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
                      >

                        <span className="flex items-center justify-center gap-2">

                          {isLoading ? (
                            <>
                              <RefreshCw
                                size={18}
                                className="animate-spin"
                              />
                              Verifying...
                            </>
                          ) : (
                            <>
                              Verify & Login

                              <ChevronRight
                                size={18}
                              />
                            </>
                          )}

                        </span>

                      </button>

                      {/* Back */}

                      <button
                        type="button"
                        onClick={
                          backToLogin
                        }
                        disabled={isLoading}
                        className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-bold text-slate-300 transition hover:border-cyan-500 hover:text-cyan-400 disabled:opacity-50"
                      >
                        ← Back to Login
                      </button>

                    </div>
                  </div>

                ) : (

                  /* =================================================
                     LOGIN / REGISTER
                  ================================================== */

                  <>

                    {/* Header */}

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

                        {isRegister
                          ? "Create Account"
                          : "Welcome Back"}

                      </h1>

                      <p className="mt-2 text-sm font-medium leading-6 text-slate-400">

                        {isRegister
                          ? "Create your secure SmartCampus account."
                          : "Sign in securely to access your campus dashboard."}

                      </p>

                    </div>

                    {/* FORM */}

                    <form
                      onSubmit={
                        handleSubmit
                      }
                      className="space-y-5"
                    >

                      {/* =================================================
                          NAME
                      ================================================== */}

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
                              value={
                                formData.name
                              }
                              onChange={
                                handleChange
                              }
                              autoComplete="name"
                              className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-3.5 pl-11 pr-4 text-sm font-medium text-white outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                              placeholder="Enter your full name"
                            />

                          </div>

                        </div>
                      )}

                      {/* =================================================
                          EMAIL
                      ================================================== */}

                      <div>

                        <label
                          htmlFor="email"
                          className="mb-2 block text-sm font-bold text-slate-300"
                        >
                          Email Address
                        </label>

                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={
                            formData.email
                          }
                          onChange={
                            handleChange
                          }
                          autoComplete="email"
                          className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3.5 text-sm font-medium text-white outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                          placeholder="you@example.com"
                        />

                      </div>

                      {/* =================================================
                          PASSWORD
                      ================================================== */}

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
                              className="text-xs font-bold text-cyan-400 hover:underline"
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
                            type={
                              showPassword
                                ? "text"
                                : "password"
                            }
                            value={
                              formData.password
                            }
                            onChange={
                              handleChange
                            }
                            autoComplete={
                              isRegister
                                ? "new-password"
                                : "current-password"
                            }
                            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-3.5 pl-11 pr-12 text-sm font-medium text-white outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                            placeholder="Enter your password"
                          />

                          <button
                            type="button"
                            aria-label={
                              showPassword
                                ? "Hide password"
                                : "Show password"
                            }
                            onClick={() =>
                              setShowPassword(
                                (prev) =>
                                  !prev
                              )
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-500 transition hover:text-cyan-400"
                          >

                            {showPassword ? (
                              <EyeOff
                                size={18}
                              />
                            ) : (
                              <Eye
                                size={18}
                              />
                            )}

                          </button>

                        </div>

                      </div>

                      {/* =================================================
                          CAPTCHA
                      ================================================== */}

                      <div>

                        <label
                          htmlFor="captcha"
                          className="mb-2 block text-sm font-bold text-slate-300"
                        >
                          Security Verification
                        </label>

                        <div className="grid grid-cols-[auto_auto_1fr] gap-2">

                          {/* Captcha Value */}

                          <div className="flex min-w-[105px] items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3.5">

                            <span className="font-mono text-lg font-black tracking-[0.15em] text-cyan-300">
                              {captcha.value ||
                                "------"}
                            </span>

                          </div>

                          {/* Refresh */}

                          <button
                            type="button"
                            aria-label="Refresh captcha"
                            onClick={
                              loadCaptcha
                            }
                            disabled={
                              isLoading
                            }
                            className="flex min-h-[50px] w-12 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-cyan-400 transition hover:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <RefreshCw
                              size={18}
                              className={
                                isLoading
                                  ? "animate-spin"
                                  : ""
                              }
                            />
                          </button>

                          {/* Captcha Input */}

                          <input
                            id="captcha"
                            name="captcha"
                            type="text"
                            value={
                              formData.captcha
                            } 
                            onChange={
                              handleChange
                            }
                            autoComplete="off"
                            spellCheck="false"
                            className="min-w-0 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3.5 text-sm font-bold text-white outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                            placeholder="Enter code"
                          />

                        </div>

                      </div>

                      {/* =================================================
                          SECURITY INFO
                      ================================================== */}

                      <div className="flex items-center gap-3 rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-3">

                        <Fingerprint
                          size={20}
                          className="shrink-0 text-emerald-400"
                        />

                        <p className="text-xs leading-5 text-slate-400">
                          Your account is protected with
                          secure authentication and optional
                          two-factor verification.
                        </p>

                      </div>

                      {/* =================================================
                          SUBMIT
                      ================================================== */}

                      <button
                        type="submit"
                        disabled={
                          isLoading
                        }
                        className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-4 text-sm font-black text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
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
                              />
                            </>
                          )}

                        </span>

                      </button>

                    </form>

                    {/* =================================================
                        SWITCH AUTH
                    ================================================== */}

                    <div className="mt-7 border-t border-slate-800 pt-6 text-center">

                      <p className="text-sm font-medium text-slate-500">

                        {isRegister
                          ? "Already have an account?"
                          : "Don't have an account?"}

                        <button
                          type="button"
                          onClick={
                            toggleAuthMode
                          }
                          disabled={
                            isLoading
                          }
                          className="ml-2 font-black text-cyan-400 hover:underline disabled:opacity-50"
                        >

                          {isRegister
                            ? "Login here"
                            : "Create one"}

                        </button>

                      </p>

                    </div>

                  </>
                )}

                {/* =================================================
                    BACK HOME
                ================================================== */}

                <Link
                  to="/"
                  className="mt-5 flex items-center justify-center text-xs font-bold text-slate-500 transition hover:text-cyan-400"
                >
                  ← Back to Home
                </Link>

              </div>

              {/* =================================================
                  SECURITY BADGES
              ================================================== */}

              <div className="mt-5 grid grid-cols-3 gap-2">

                {/* Secure */}

                <div className="flex flex-col items-center justify-center rounded-xl border border-white/5 bg-slate-900/50 px-2 py-3 text-center">

                  <ShieldCheck
                    size={18}
                    className="mb-1 text-cyan-400"
                  />

                  <span className="text-[10px] font-bold text-slate-500">
                    SECURE
                  </span>

                </div>

                {/* Encrypted */}

                <div className="flex flex-col items-center justify-center rounded-xl border border-white/5 bg-slate-900/50 px-2 py-3 text-center">

                  <LockKeyhole
                    size={18}
                    className="mb-1 text-cyan-400"
                  />

                  <span className="text-[10px] font-bold text-slate-500">
                    ENCRYPTED
                  </span>

                </div>

                {/* Verified */}

                <div className="flex flex-col items-center justify-center rounded-xl border border-white/5 bg-slate-900/50 px-2 py-3 text-center">

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

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="relative z-20 border-t border-white/5 bg-slate-950/40 px-5 py-4 text-center">

        <p className="text-xs font-medium text-slate-600">
          © {new Date().getFullYear()} SmartCampus ·
          Intelligent Campus Management System
        </p>

      </footer>

    </div>
  );
};

export default LoginPage;