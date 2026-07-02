import { useEffect, useState } from "react";

import toast from "react-hot-toast";

import { Users, Trash2, Shield, UserPlus, Loader2, Pencil } from "lucide-react";

import PageHeader from "../components/PageHeader";

import PageLoader from "../components/PageLoader";

import EmptyState from "../components/EmptyState";

import ConfirmModal from "../components/ConfirmModal";

import { apiRequest } from "../services/api";

interface User {
  id: number;

  username: string;

  email: string;

  role: string;

  created_at: string;
}

function UsersPage() {
  /* =========================
     STATE
  ========================= */

  const [users, setUsers] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);

  const [creating, setCreating] = useState(false);

  const [updating, setUpdating] = useState(false);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [form, setForm] = useState({
    username: "",

    email: "",

    password: "",

    role: "STAFF",
  });

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  /* =========================
     LOAD USERS
  ========================= */

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const data = await apiRequest("/users", {
        auth: true,
      });

      setUsers(data.users || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* =========================
     CREATE USER
  ========================= */

  const createUser = async () => {
    try {
      setCreating(true);

      await apiRequest("/users", {
        method: "POST",

        auth: true,

        body: JSON.stringify(form),
      });

      toast.success("User created successfully");

      setForm({
        username: "",

        email: "",

        password: "",

        role: "STAFF",
      });

      await fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  const updateUser = async () => {
    if (!editingUser) {
      return;
    }

    try {
      setUpdating(true);

      await apiRequest(`/users/${editingUser.id}`, {
        method: "PUT",

        auth: true,

        body: JSON.stringify({
          username: form.username,

          email: form.email,

          role: form.role,
        }),
      });

      toast.success("User updated successfully");

      setEditingUser(null);

      setForm({
        username: "",

        email: "",

        password: "",

        role: "STAFF",
      });

      await fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to update user");
    } finally {
      setUpdating(false);
    }
  };

  /* =========================
     DELETE USER
  ========================= */

  const deleteUser = async () => {
    if (!selectedUser) {
      return;
    }

    try {
      setDeletingId(selectedUser.id);

      await apiRequest(`/users/${selectedUser.id}`, {
        method: "DELETE",

        auth: true,
      });

      toast.success("User deleted successfully");

      setUsers((prev) => prev.filter((user) => user.id !== selectedUser.id));
    } catch (error) {
      toast.error("Failed to delete user");
    } finally {
      setDeletingId(null);

      setConfirmOpen(false);

      setSelectedUser(null);
    }
  };

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return <PageLoader text="Loading users..." />;
  }

  return (
    <div>
      {/* HEADER */}

      <PageHeader
        icon={<Users size={32} className="text-gray-800" />}
        title="Users"
        description="Manage ERP users, permissions, and operational roles."
      />

      {/* CREATE USER */}

      <div className="erp-card erp-section mb-8">
        <div className="flex items-center gap-3 mb-6">
          <UserPlus size={24} className="text-gray-700" />

          <h2 className="text-2xl font-bold text-gray-900">
            {editingUser ? "Edit User" : "Create User"}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <input
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={(e) =>
              setForm({
                ...form,
                username: e.target.value,
              })
            }
            className="erp-input"
          />

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
            className="erp-input"
          />

          {!editingUser && (
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value,
                })
              }
              className="erp-input"
            />
          )}

          <select
            value={form.role}
            onChange={(e) =>
              setForm({
                ...form,
                role: e.target.value,
              })
            }
            className="erp-select"
          >
            <option value="STAFF">STAFF</option>

            {currentUser.role === "ADMIN" && (
              <>
                <option value="MANAGER">MANAGER</option>

                <option value="ADMIN">ADMIN</option>
              </>
            )}
          </select>
        </div>

        <div className="mt-6 flex gap-3">
          {editingUser && (
            <button
              onClick={() => {
                setEditingUser(null);

                setForm({
                  username: "",
                  email: "",
                  password: "",
                  role: "STAFF",
                });
              }}
              className="erp-button-secondary"
            >
              Cancel
            </button>
          )}

          <button
            onClick={editingUser ? updateUser : createUser}
            disabled={creating || updating}
            className="erp-button-primary inline-flex items-center gap-2"
          >
            {creating || updating ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <UserPlus size={18} />
            )}

            {editingUser ? "Update User" : "Create User"}
          </button>
        </div>
      </div>

      {/* USERS TABLE */}

      <div className="erp-table-container">
        <div className="erp-table-scroll">
          <table className="erp-table">
            <thead>
              <tr>
                <th>User</th>

                <th>Email</th>

                <th>Role</th>

                <th>Created</th>

                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      title="No users found"
                      description="ERP users will appear here."
                    />
                  </td>
                </tr>
              )}

              {users.map((user) => (
                <tr key={user.id}>
                  <td className="font-semibold text-gray-900">
                    {user.username}
                  </td>

                  <td>{user.email}</td>

                  <td>
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === "ADMIN"
                          ? "bg-red-100 text-red-700"
                          : user.role === "MANAGER"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      <Shield size={14} />

                      {user.role}
                    </span>
                  </td>

                  <td>{new Date(user.created_at).toLocaleString("en-GB")}</td>

                  <td>
                    {currentUser.role === "ADMIN" && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingUser(user);

                            setForm({
                              username: user.username,

                              email: user.email,

                              password: "",

                              role: user.role,
                            });
                          }}
                          className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center"
                        >
                          <Pencil size={18} className="text-gray-700" />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedUser(user);

                            setConfirmOpen(true);
                          }}
                          className="w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 transition flex items-center justify-center"
                        >
                          <Trash2 size={18} className="text-red-600" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DELETE CONFIRMATION */}

      <ConfirmModal
        open={confirmOpen}
        title="Delete User"
        message={`Delete "${selectedUser?.username}" permanently?`}
        confirmText="Delete User"
        loading={deletingId !== null}
        onCancel={() => {
          setConfirmOpen(false);

          setSelectedUser(null);
        }}
        onConfirm={deleteUser}
      />
    </div>
  );
}

export default UsersPage;
