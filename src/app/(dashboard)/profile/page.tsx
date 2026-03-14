"use client";

import { useEffect } from "react";
import { useProfileStore } from "@/store/profile.store";
import { Loader2, Mail, ShieldCheck, User2, Save } from "lucide-react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, loading, saving, error, fetchProfile, updateProfile } = useProfileStore();

  useEffect(() => {
    if (!user) {
      void fetchProfile();
    }
  }, [fetchProfile, user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget as HTMLFormElement);
    const name = String(formData.get("name") || "");
    const email = String(formData.get("email") || "");

    try {
      await updateProfile({ name, email });
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  if (loading && !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">My Profile</h1>
        <p className="mt-2 text-sm font-medium text-gray-500">
          Manage your account details and role information.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
        <form onSubmit={handleSubmit} className="rounded-[2rem] border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-lg font-bold text-gray-900">Account Details</h2>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                <User2 className="h-4 w-4 text-gray-400" />
                Full Name
              </label>
              <input
                name="name"
                defaultValue={user?.name}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition-all focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
                placeholder="Your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                <Mail className="h-4 w-4 text-gray-400" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                defaultValue={user?.email}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition-all focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
                placeholder="you@company.com"
                required
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-bold text-white transition-all hover:bg-green-700 disabled:opacity-70"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </button>
          </div>
        </form>

        <div className="rounded-[2rem] border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-lg font-bold text-gray-900">Access Summary</h2>

          <div className="space-y-5">
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Role</p>
              <p className="mt-2 flex items-center gap-2 text-base font-bold text-gray-900">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                {user?.role || "staff"}
              </p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Member Since</p>
              <p className="mt-2 text-base font-bold text-gray-900">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
              </p>
            </div>

            <div className="rounded-2xl bg-green-50 p-4 text-sm font-medium text-green-800">
              Your session is now managed with a secure server cookie, so profile and protected pages stay linked to the logged-in user.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
