import { useEffect, useState } from "react";

import { apiRequest } from "../services/api";

import { useAuthStore } from "../store/authStore";

import { useNavigate } from "react-router-dom";

import logo from "../assets/logo.png";

import { Lock, User, Eye, EyeOff, ShieldCheck } from "lucide-react";

import toast from "react-hot-toast";

function Login() {
  const navigate = useNavigate();

  const login = useAuthStore((state) => state.login);

  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  const [telephone, setTelephone] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [initialized, setInitialized] = useState(true);

  const [checkingSetup, setCheckingSetup] = useState(true);

  const [hasLoggedBefore, setHasLoggedBefore] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        const remembered = localStorage.getItem("hasLoggedBefore");

        setHasLoggedBefore(remembered === "true");

        const data = await apiRequest("/setup/status");

        setInitialized(data.initialized);
      } catch (error) {
        console.error("Failed to check setup status:", error);
      } finally {
        setCheckingSetup(false);
      }
    };

    initialize();
  }, []);

  const handleLogin = async () => {
    setLoading(true);

    const toastId = toast.loading("Signing in...");

    try {
      await login(username, password);

      localStorage.setItem("hasLoggedBefore", "true");

      toast.dismiss(toastId);

      toast.success("Login successful");

      navigate("/dashboard");
    } catch (err) {
      toast.dismiss(toastId);

      toast.error(err instanceof Error ? err.message : "Login failed");

      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    setLoading(true);

    const toastId = toast.loading("Creating administrator...");

    try {
      await apiRequest("/setup/admin", {
        method: "POST",
        body: JSON.stringify({
          username,
          telephone,
          password,
        }),
      });

      toast.dismiss(toastId);

      toast.success("Administrator created successfully");

      localStorage.setItem("hasLoggedBefore", "true");

      window.location.reload();
    } catch (err) {
      toast.dismiss(toastId);

      toast.error(
        err instanceof Error ? err.message : "Failed to create administrator",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  if (checkingSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-600 text-lg">Loading...</p>
      </div>
    );
  }

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 px-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center mb-2">
            Create Administrator Account
          </h1>

          <p className="text-center text-slate-500 mb-4">
            No administrator account exists yet.
          </p>

          <div className="mb-8 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
            Please keep these credentials safe. You will use this username,
            telephone number, and password to sign in to the system from now on.
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Username
              </label>

              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="
                w-full
                h-12
                px-4
                rounded-xl
                border
                border-slate-200
              "
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Telephone
              </label>

              <input
                type="text"
                inputMode="numeric"
                placeholder="Enter telephone number"
                value={telephone}
                onChange={(e) =>
                  setTelephone(e.target.value.replace(/\D/g, ""))
                }
                className="
    w-full
    h-12
    px-4
    rounded-xl
    border
    border-slate-200
  "
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="
                w-full
                h-12
                px-4
                rounded-xl
                border
                border-slate-200
              "
              />
            </div>

            <button
              onClick={handleCreateAdmin}
              disabled={loading}
              className="
              w-full
              h-12
              rounded-xl
              bg-black
              text-white
              font-semibold
              disabled:opacity-50 disabled:cursor-not-allowed
            "
            >
              {loading ? "Creating..." : "Create Administrator"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 overflow-hidden rounded-3xl shadow-2xl bg-white/95 backdrop-blur-xl border border-white/20">
        {/* LEFT PANEL */}

        <div className="hidden lg:flex flex-col justify-center bg-black text-white p-14 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute w-96 h-96 bg-white rounded-full -top-20 -left-20"></div>

            <div className="absolute w-72 h-72 bg-gray-400 rounded-full bottom-0 right-0"></div>
          </div>

          <div className="relative z-10">
            <div className="mb-8">
              <img
                src={logo}
                alt="ZICO Business ERP"
                className="h-24 w-auto object-contain"
              />
            </div>

            <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <ShieldCheck size={16} />
              Secure Access
            </div>

            <p className="text-gray-300 text-lg leading-relaxed">
              Smart inventory and serialized stock management platform for
              enterprise warehouse operations.
            </p>

            <div className="mt-12 space-y-4">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                Real-time serialized inventory tracking
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                Operational movement monitoring
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                Enterprise-grade warehouse workflows
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}

        <div className="flex items-center justify-center p-8 lg:p-14 bg-slate-50">
          <div className="w-full max-w-md">
            <div className="mb-10">
              <h2 className="text-4xl font-black text-slate-900 mb-3">
                {hasLoggedBefore ? "Welcome Back" : "Welcome"}
              </h2>

              <p className="text-slate-500">
                Sign in to access your inventory dashboard.
              </p>
            </div>

            {/* USERNAME */}

            <div className="mb-5">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Username
              </label>

              <div className="relative">
                <User
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="
    w-full
    h-14
    rounded-xl
    border
    border-slate-200
    pl-14
    pr-4
    outline-none
    transition-all
    focus:border-black
    focus:ring-4
    focus:ring-slate-200
  "
                />
              </div>
            </div>

            {/* PASSWORD */}

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>

              <div className="relative">
                <Lock
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="
  w-full
  h-14
  rounded-xl
  border
  border-slate-200
  pl-14
  pr-14
  outline-none
  transition-all
  focus:border-black
  focus:ring-4
  focus:ring-slate-200
"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-black transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* LOGIN BUTTON */}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-4 text-lg bg-black text-white rounded-xl font-semibold hover:bg-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing In...
                </span>
              ) : (
                "Login"
              )}
            </button>

            {/* FOOTER */}

            <div className="mt-10 text-center text-sm text-slate-400">
              Secure Inventory and Login Platform
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
