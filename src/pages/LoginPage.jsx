import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";
import { BASE_URI } from "../config/api";
import { useAuth } from "../context/AuthContext";

const initialState = {
  name: "",
  email: "",
  password: "",
  captcha: "",
};

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
  const [isLoading, setIsLoading] = useState(false);

  // 2FA
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorUserId, setTwoFactorUserId] = useState(null);

  // ==============================
  // LOAD CAPTCHA
  // ==============================
  const loadCaptcha = async () => {
    try {
      const response = await fetch(`${BASE_URI}/api/captcha`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Unable to load captcha");
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
      toast.error(
        error?.message || "Unable to load captcha. Please try again."
      );

      setCaptcha({
        token: "",
        value: "",
      });
    }
  };

  // Load captcha once
  useEffect(() => {
    loadCaptcha();
  }, []);

  // ==============================
  // INPUT CHANGE
  // ==============================
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==============================
  // LOGIN
  // ==============================
  const handleLogin = async () => {
    const email = formData.email.trim();
    const password = formData.password;
    const captchaValue = formData.captcha.trim();

    if (!email || !password || !captchaValue) {
      toast.error("Please fill email, password and captcha.");
      return;
    }

    if (!captcha.token) {
      toast.error("Captcha expired. Please refresh captcha.");
      await loadCaptcha();
      return;
    }
    try {
      setIsLoading(true);

      const response = await fetch(`${BASE_URI}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
          captcha: captchaValue,
          token: captcha.token,
        }),
      });

      const data = await response.json();

      // 2FA required
      if (response.ok && data.requiresTwoFactor === true) {
        setTwoFactorUserId(data.tempToken);
        setTwoFactorCode("");
        setShowTwoFactor(true);

        toast.success("Enter your 2FA authentication code.");
        return;
      }

      // Login error
      if (!response.ok) {
        await loadCaptcha();
        toast.error(data.message || "Authentication failed.");
        return;
      }

      // Successful login
      if (!data.accessToken || !data.user) {
        toast.error("Invalid login response from server.");
        return;
      }

      toast.success(`Welcome ${data.user?.name || "User"}`);

      login(data.accessToken, data.user);
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

  // ==============================
  // VERIFY 2FA
  // ==============================
  const verifyTwoFactor = async () => {
    const code = twoFactorCode.trim();

    if (!code) {
      toast.error("Please enter your authentication code.");
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      toast.error("Authentication code must contain 6 digits.");
      return;
    }

    if (!twoFactorUserId) {
      toast.error("Authentication session expired. Please login again.");
      backToLogin();
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`${BASE_URI}/api/login/2fa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          tempToken: twoFactorUserId,
          code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Invalid authentication code.");
        setTwoFactorCode("");
        return;
      }

      if (!data.accessToken || !data.user) {
        toast.error("Invalid authentication response from server.");
        return;
      }

      toast.success("Two-factor authentication successful.");

      login(data.accessToken, data.user);

      navigate("/dashboard");
    } catch (error) {
      console.error("2FA verification error:", error);

      toast.error("Unable to verify authentication code.");
    } finally {
      setIsLoading(false);
    }
  };

  // ==============================
  // REGISTER
  // ==============================
  const handleRegister = async () => {
    const name = formData.name.trim();
    const email = formData.email.trim();
    const password = formData.password;
    const captchaValue = formData.captcha.trim();

    if (!name || !email || !password || !captchaValue) {
      toast.error("Please fill all required fields including captcha.");
      return;
    }

    if (!captcha.token) {
      toast.error("Captcha expired. Please refresh captcha.");
      await loadCaptcha();
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`${BASE_URI}/api/register`, {
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
      });

      const data = await response.json();

      if (!response.ok) {
        await loadCaptcha();

        toast.error(data.message || "Registration failed.");
        return;
      }

      toast.success(
        data.message || "Account created successfully!"
      );

      setIsRegister(false);

      setFormData({
        ...initialState,
        email,
      });

      await loadCaptcha();
    } catch (error) {
      console.error("Registration error:", error);

      toast.error("Server connection failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // ==============================
  // FORM SUBMIT
  // ==============================
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isLoading) return;

    if (isRegister) {
      await handleRegister();
    } else {
      await handleLogin();
    }
  };

  // ==============================
  // SWITCH LOGIN / REGISTER
  // ==============================
  const toggleAuthMode = async () => {
    setIsRegister((prev) => !prev);

    setShowTwoFactor(false);
    setTwoFactorCode("");
    setTwoFactorUserId(null);

    setShowPassword(false);

    setFormData(initialState);

    await loadCaptcha();
  };

  // ==============================
  // BACK FROM 2FA
  // ==============================
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

  // ==============================
  // UI
  // ==============================
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">

      <div className="w-full max-w-md">

        {/* LOGO / TITLE */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">
            Smart<span className="text-cyan-400">Campus</span>
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            {showTwoFactor
              ? "Two-factor authentication"
              : isRegister
              ? "Create your account"
              : "Login to your account"}
          </p>
        </div>

        {/* CARD */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">

          {/* =========================
              2FA
          ========================== */}
          {showTwoFactor ? (
            <div className="space-y-5">

              <div>
                <h2 className="text-xl font-semibold text-white">
                  Verify Authentication
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  Enter the 6-digit authentication code.
                </p>
              </div>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={twoFactorCode}
                onChange={(e) =>
                  setTwoFactorCode(
                    e.target.value.replace(/\D/g, "")
                  )
                }
                placeholder="Enter 6-digit code"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-center text-lg tracking-[0.3em] text-white outline-none focus:border-cyan-500"
              />

              <button
                type="button"
                onClick={verifyTwoFactor}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading && (
                  <RefreshCw
                    size={18}
                    className="animate-spin"
                  />
                )}

                {isLoading ? "Verifying..." : "Verify Code"}
              </button>

              <button
                type="button"
                onClick={backToLogin}
                disabled={isLoading}
                className="w-full text-sm text-slate-400 hover:text-cyan-400"
              >
                ← Back to Login
              </button>
            </div>
          ) : (
            <>
              {/* =========================
                  FORM
              ========================== */}
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* NAME */}
                {isRegister && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Name
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      autoComplete="name"
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
                    />
                  </div>
                )}

                {/* EMAIL */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-slate-300"
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
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
                  />
                </div>

                {/* PASSWORD */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="text-sm font-medium text-slate-300"
                    >
                      Password
                    </label>

                    {!isRegister && (
                      <Link
                        to="/forgetpassword"
                        className="text-xs text-cyan-400 hover:underline"
                      >
                        Forgot Password?
                      </Link>
                    )}
                  </div>

                  <div className="relative">
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
                      placeholder="Enter your password"
                      autoComplete={
                        isRegister
                          ? "new-password"
                          : "current-password"
                      }
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 pr-11 text-sm text-white outline-none focus:border-cyan-500"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (prev) => !prev
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400"
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
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    CAPTCHA
                  </label>

                  <div className="grid grid-cols-[100px_44px_1fr] gap-2">

                    <div className="flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800 px-2 font-mono font-bold tracking-widest text-cyan-400">
                      {captcha.value || "------"}
                    </div>

                    <button
                      type="button"
                      onClick={loadCaptcha}
                      disabled={isLoading}
                      className="flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-cyan-400 hover:border-cyan-500"
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

                    <input
                      id="captcha"
                      name="captcha"
                      type="text"
                      value={formData.captcha}
                      onChange={handleChange}
                      placeholder="Enter code"
                      autoComplete="off"
                      className="min-w-0 rounded-lg border border-slate-700 bg-slate-800 px-3 py-3 text-sm font-medium text-white outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* SUBMIT */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading && (
                    <RefreshCw
                      size={18}
                      className="animate-spin"
                    />
                  )}

                  {isLoading
                    ? "Processing..."
                    : isRegister
                    ? "Create Account"
                    : "Login"}
                </button>
                
              </form>

              {/* SWITCH */}
              <div className="mt-6 border-t border-slate-800 pt-5 text-center">
                <span className="text-sm text-slate-400">
                  {isRegister
                    ? "Already have an account?"
                    : "Don't have an account?"}
                </span>

                <button
                  type="button"
                  onClick={toggleAuthMode}
                  disabled={isLoading}
                  className="ml-2 text-sm font-semibold text-cyan-400 hover:underline"
                >
                  {isRegister
                    ? "Login"
                    : "Create Account"}
                </button>
                
              </div>              {/* SWITCH */}
              <div className="mt-6 border-t border-slate-800 pt-5 text-center">
                <span className="text-sm text-slate-400">
                  Go To ?    
                </span>

             <Link
              to="/student/login"
              className="text-sm text-cyan-400 hover:text-cyan-300"
            >
                Student Portal
              </Link>
                
              </div>
            </>
          )}
        </div>

        {/* HOME */}
        {!showTwoFactor && (
          <div className="mt-5 text-center">
            <Link
              to="/"
              className="text-sm text-slate-500 hover:text-cyan-400"
            >
              ← Back to Home
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};

export default LoginPage;