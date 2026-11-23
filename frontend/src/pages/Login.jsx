import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Eye, EyeOff, Lock, Mail, AlertCircle, Loader2 } from "lucide-react";

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  // Query param alert if redirected from expired session
  const searchParams = new URLSearchParams(location.search);
  const isSessionExpired = searchParams.get("expired") === "true";

  const validate = () => {
    const errors = {};
    if (!formData.email.trim()) {
      errors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

    if (!formData.password) {
      errors.password = "Password is required.";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    setLoading(true);
    try {
      await login(formData.email.trim(), formData.password);
      navigate("/", { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Unable to authenticate. Please check your credentials and try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.1fr_1fr] bg-white">
      {/* Brand panel (desktop) */}
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-ink-950 p-12 text-white">
        <div className="pointer-events-none absolute -top-40 -left-40 w-[32rem] h-[32rem] rounded-full bg-zinth-500/25 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          }}
        />

        <div className="relative flex items-center gap-3">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-zinth-400 to-zinth-600 font-extrabold text-xl shadow-glow">
            Z
          </div>
          <div className="leading-tight">
            <span className="block text-base font-bold">Zinth Labs</span>
            <span className="block text-xs text-slate-400">Registry Admin</span>
          </div>
        </div>

        <div className="relative max-w-md">
          <h1 className="text-4xl font-bold tracking-tight leading-[1.15]">
            Every customer, deployment and subscription,{" "}
            <span className="text-zinth-400">in one place.</span>
          </h1>
          <p className="mt-4 text-base text-slate-400">
            Track licenses, approve plan requests and keep renewals on schedule from a single control center.
          </p>
        </div>

        <p className="relative text-xs text-slate-500">
          © {new Date().getFullYear()} Zinth Labs. Internal use only.
        </p>
      </aside>

      {/* Form */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 bg-slate-50 lg:bg-white">
        <div className="w-full max-w-sm mx-auto">
          {/* Brand (mobile) */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-zinth-400 to-zinth-600 text-white font-extrabold text-xl shadow-glow">
              Z
            </div>
            <div className="leading-tight">
              <span className="block text-base font-bold text-slate-900">Zinth Labs</span>
              <span className="block text-xs text-slate-500">Registry Admin</span>
            </div>
          </div>

        <div>
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Welcome back
            </h2>
            <p className="text-sm text-slate-500 mt-1.5">
              Sign in with your admin account to continue.
            </p>
          </div>

          {isSessionExpired && !error && (
            <div className="mb-6 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Your previous session has expired. Please sign in again.</span>
            </div>
          )}

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (validationErrors.email) {
                      setValidationErrors({ ...validationErrors, email: "" });
                    }
                  }}
                  placeholder="admin@zinthlabs.com"
                  className={`w-full pl-10 pr-3.5 py-3 text-sm bg-white border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none transition-colors ${
                    validationErrors.email
                      ? "border-rose-400 focus:ring-4 focus:ring-rose-100"
                      : "border-slate-200 focus:ring-4 focus:ring-zinth-500/20 focus:border-zinth-500"
                  }`}
                />
              </div>
              {validationErrors.email && (
                <p className="mt-1 text-xs text-rose-600 font-medium">
                  {validationErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (validationErrors.password) {
                      setValidationErrors({ ...validationErrors, password: "" });
                    }
                  }}
                  placeholder="••••••••••••"
                  className={`w-full pl-10 pr-10 py-3 text-sm bg-white border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none transition-colors ${
                    validationErrors.password
                      ? "border-rose-400 focus:ring-4 focus:ring-rose-100"
                      : "border-slate-200 focus:ring-4 focus:ring-zinth-500/20 focus:border-zinth-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {validationErrors.password && (
                <p className="mt-1 text-xs text-rose-600 font-medium">
                  {validationErrors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-zinth-500 hover:bg-zinth-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinth-500 shadow-glow transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>

          <p className="mt-8 text-xs text-slate-400">
            Restricted system for authorized Zinth Labs staff only.
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

