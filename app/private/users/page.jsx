"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Search,
  UserPlus,
  Edit2,
  Trash2,
  X,
  Save,
  LoaderCircle,
  ShieldCheck,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function UsersManagement() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState("user");
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("sic_user");
    if (!savedUser) {
      router.replace("/");
      return;
    }
    const user = JSON.parse(savedUser);
    setCurrentUser(user);

    if (user.role !== "superuser") {
      router.replace("/private");
      return;
    }

    fetchUsers();
  }, [router]);

  useEffect(() => {
    const handleScroll = () => {
      setIsStuck(window.scrollY > 60);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("fullname");
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.target);
    const userData = Object.fromEntries(formData.entries());

    try {
      const { error } = await supabase.from("users").upsert(
        {
          ...userData,
          photo: userData.photo || "/def-profile.jpg",
          role: userData.role || "user",
        },
        { onConflict: "nik" }
      );

      if (error) throw error;

      // If updating self, update localStorage
      if (currentUser && currentUser.nik === userData.nik) {
        const { data: updatedUser } = await supabase
          .from("users")
          .select("*")
          .eq("nik", userData.nik)
          .single();
        if (updatedUser) {
          localStorage.setItem("sic_user", JSON.stringify(updatedUser));
          setCurrentUser(updatedUser);
        }
      }

      setIsModalOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      alert("Error saving user: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("nik", confirmDelete.nik);
      if (error) throw error;
      setConfirmDelete(null);
      fetchUsers();
    } catch (err) {
      alert("Error deleting user: " + err.message);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.nik.includes(searchTerm)
  );

  return (
    <main className="mesh-gradient-container min-h-screen bg-slate-50 p-4 pb-24">
      <div className="max-w-2xl w-full mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/private")}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <button
            onClick={() => {
              setEditingUser(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 transition-all active:scale-95"
          >
            <UserPlus size={14} strokeWidth={2.5} />
            <span className="text-sm font-medium">Add User</span>
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/20 overflow-visible"
        >
          {/* STICKY SEARCH BAR */}
          <div
            className={`sticky top-0 z-30 -mt-px transition-all duration-300 ${
              isStuck
                ? "bg-white/95 backdrop-blur-md  border-slate-200 shadow-md"
                : "bg-transparent"
            }`}
          >
            <div
              className={`max-w-lg mx-auto px-4 transition-all duration-300 ${
                isStuck ? "rounded-none py-3" : "rounded-t-3xl pb-3 pt-6"
              }`}
            >
              <div className="relative group">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors"
                  size={14}
                />
                <input
                  type="text"
                  placeholder={`Search ${users.length} registered users...`}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-2xl text-sm font-semibold focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-inner"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full bg-slate-200/50 text-slate-500 hover:bg-slate-200"
                  >
                    <X size={10} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 bg-white rounded-b-3xl min-h-[400px]">
            <div className="space-y-3">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <LoaderCircle
                    size={40}
                    className="animate-spin mb-4 opacity-20"
                  />
                  <p className="text-xs font-bold uppercase tracking-widest">
                    Loading Users...
                  </p>
                </div>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user, idx) => (
                  <motion.div
                    key={user.nik}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group relative flex items-center gap-4 bg-white border border-slate-100 rounded-3xl p-3.5 shadow-sm hover:shadow-md transition-all hover:border-indigo-100"
                  >
                    <div className="relative h-14 w-14 shrink-0 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
                      <img
                        src={user.photo || "/def-profile.jpg"}
                        alt={user.fullname}
                        className="h-full w-full object-cover"
                        onError={(e) => (e.target.src = "/def-profile.jpg")}
                      />
                      {user.role === "superuser" && (
                        <div className="absolute top-1 right-1 bg-indigo-500 text-white rounded-full p-0.5 shadow-sm">
                          <ShieldCheck size={8} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-black text-slate-800 truncate mb-0.5">
                        {user.fullname}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                          NIK {user.nik}
                        </span>
                        <span
                          className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md ${user.role === "superuser" ? "bg-indigo-50 text-indigo-500" : "bg-slate-50 text-slate-400"}`}
                        >
                          {user.role}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setIsModalOpen(true);
                        }}
                        className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(user)}
                        className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-20 bg-white/50 border border-dashed border-slate-200 rounded-3xl">
                  <UserIcon size={40} className="mx-auto text-slate-200 mb-4" />
                  <p className="text-slate-400 text-sm">No users found</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modal User Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[32px] overflow-hidden shadow-2xl border border-white"
            >
              <form onSubmit={handleSave} className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">
                    {editingUser ? "Edit User" : "Add New User"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 rounded-xl text-slate-400 hover:bg-slate-100"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      NIK (Primary Key)
                    </label>
                    <input
                      name="nik"
                      defaultValue={editingUser?.nik}
                      readOnly={!!editingUser}
                      required
                      placeholder="e.g. 180375"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-400 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Full Name
                    </label>
                    <input
                      name="fullname"
                      defaultValue={editingUser?.fullname}
                      required
                      placeholder="e.g. John Doe"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-400 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Nickname
                      </label>
                      <input
                        name="nickname"
                        defaultValue={editingUser?.nickname}
                        required
                        placeholder="John"
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-400 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Role
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsRoleOpen(!isRoleOpen)}
                          className={`w-full flex items-center justify-between bg-slate-50 border rounded-2xl py-3 pl-4 pr-4 text-sm text-slate-800 transition-all ${isRoleOpen ? "border-indigo-400 ring-4 ring-indigo-500/5" : "border-slate-100"}`}
                        >
                          <span className="capitalize">
                            {editingUser?.role || selectedRole}
                          </span>
                          <ChevronDown
                            size={18}
                            className={`text-slate-400 transition-transform duration-300 ${isRoleOpen ? "rotate-180 text-indigo-500" : ""}`}
                          />
                        </button>

                        {/* Hidden Input for Form Submission */}
                        <input
                          type="hidden"
                          name="role"
                          value={editingUser?.role || selectedRole}
                        />

                        <AnimatePresence>
                          {isRoleOpen && (
                            <>
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-10"
                                onClick={() => setIsRoleOpen(false)}
                              />
                              <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 overflow-hidden py-1"
                              >
                                {["user", "superuser"].map((role) => (
                                  <button
                                    key={role}
                                    type="button"
                                    onClick={() => {
                                      if (editingUser) {
                                        setEditingUser({
                                          ...editingUser,
                                          role,
                                        });
                                      } else {
                                        setSelectedRole(role);
                                      }
                                      setIsRoleOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-2 px-4 py-3 text-sm transition-colors hover:bg-indigo-50 text-left ${
                                      editingUser?.role === role ||
                                      (!editingUser && selectedRole === role)
                                        ? "text-indigo-600 font-bold bg-indigo-50/50"
                                        : "text-slate-600"
                                    }`}
                                  >
                                    <div
                                      className={`h-1.5 w-1.5 rounded-full ${
                                        editingUser?.role === role ||
                                        (!editingUser && selectedRole === role)
                                          ? "bg-indigo-500"
                                          : "bg-transparent"
                                      }`}
                                    />
                                    <span className="capitalize">{role}</span>
                                  </button>
                                ))}
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Password
                    </label>
                    <input
                      name="password"
                      defaultValue={editingUser?.password || "1234"}
                      required
                      type="password"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-400 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full mt-8 flex items-center justify-center gap-2 py-4 rounded-2xl bg-indigo-500 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-600 transition-all active:scale-[0.98] disabled:opacity-70"
                >
                  {isSaving ? (
                    <LoaderCircle size={18} className="animate-spin" />
                  ) : (
                    <>
                      <Save size={18} />
                      Save User
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setConfirmDelete(null)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl border border-white"
            >
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={32} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 text-center mb-2">
                Delete User?
              </h3>
              <p className="text-sm text-slate-500 text-center mb-8">
                Are you sure you want to delete{" "}
                <span className="font-black text-slate-800">
                  @{confirmDelete.nickname}
                </span>
                ? This action cannot be undone.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleDelete}
                  className="w-full py-4 rounded-2xl bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-100 hover:bg-red-600 transition-all"
                >
                  Confirm Delete
                </button>
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="w-full py-4 rounded-2xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
