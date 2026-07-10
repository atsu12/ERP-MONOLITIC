import { useEffect, useState } from "react";

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

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  
  const [hasLoggedBefore, setHasLoggedBefore] = useState(false);
  
  useEffect(() => {
    const remembered = localStorage.getItem("hasLoggedBefore");

    setHasLoggedBefore(remembered === "true");
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

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

        <div className="flex items-center justify-center p-8 lg:p-14 bg-gray-50">
          <div className="w-full max-w-md">
            <div className="mb-10">
              <h2 className="text-4xl font-black text-gray-900 mb-3">
  {hasLoggedBefore ? "Welcome Back" : "Welcome"}
</h2>

              <p className="text-gray-500">
                Sign in to access your inventory dashboard.
              </p>
            </div>

            {/* USERNAME */}

            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>

              <div className="relative">
                <User
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
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
    border-gray-300
    pl-14
    pr-4
    outline-none
    transition-all
    focus:border-black
    focus:ring-4
    focus:ring-gray-200
  "
                />
              </div>
            </div>

            {/* PASSWORD */}

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>

              <div className="relative">
                <Lock
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
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
  border-gray-300
  pl-14
  pr-14
  outline-none
  transition-all
  focus:border-black
  focus:ring-4
  focus:ring-gray-200
"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* LOGIN BUTTON */}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-4 text-lg bg-black text-white rounded-xl font-semibold hover:bg-gray-900 transition-all disabled:opacity-50"
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

            <div className="mt-10 text-center text-sm text-gray-400">
              Secure Inventory and Login Platform
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
