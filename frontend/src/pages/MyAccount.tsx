import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { useAuthStore } from "../store/authStore";

import { changePassword } from "../services/authService";

import toast from "react-hot-toast";

import { UserCog, Shield, Eye, EyeOff } from "lucide-react";

import PageHeader from "../components/PageHeader";

function MyAccount() {
  const [currentPassword, setCurrentPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const user = useAuthStore((state) => state.user);

  const logout = useAuthStore((state) => state.logout);

  const navigate = useNavigate();

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All fields are required");

      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");

      return;
    }

    try {
      setLoading(true);

      const response = await changePassword(currentPassword, newPassword);

      console.log("PASSWORD RESPONSE:", response);

      toast.success("Password updated successfully");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      if (response?.requireRelogin) {
        setTimeout(() => {
          logout();

          navigate("/login");
        }, 1000);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update password",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        icon={<UserCog size={32} className="text-gray-800" />}
        title="My Account"
        description="Manage your account information and security settings."
      />

      {/* ACCOUNT INFO */}

      <div className="erp-card erp-section mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
            <Shield size={24} className="text-gray-700" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Account Information
            </h2>

            <p className="text-gray-500">Your current account details.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-2">Username</p>

            <div className="bg-gray-50 rounded-2xl p-4 font-semibold">
              {user?.username}
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-2">Role</p>

            <div className="bg-gray-50 rounded-2xl p-4 font-semibold">
              {user?.role}
            </div>
          </div>
        </div>
      </div>

      {/* CHANGE PASSWORD */}

      <div className="erp-card erp-section">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Change Password
        </h2>

        <p className="text-gray-500 mb-6">Update your account password.</p>

        <div className="grid gap-5">
          <div className="relative">
            <input
              type={showCurrentPassword ? "text" : "password"}
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="erp-input pr-14"
            />

            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="erp-input pr-14"
            />

            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="erp-input pr-14"
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            onClick={handleChangePassword}
            disabled={loading}
            className="erp-button-primary disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MyAccount;
