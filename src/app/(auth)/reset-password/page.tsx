"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import Link from "next/link";
import { Loader2, Mail, ShieldCheck, KeyRound } from "lucide-react";

export default function ResetPassword() {
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState("");

  const requestOtp = async () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("/api/auth/forgot-password", { email });
      if (res.data.otp) {
        setDevOtp(res.data.otp);
      }
      toast.success(res.data.message || "OTP sent");
      setStep("reset");
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to send OTP"
        : "Failed to send OTP";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!email || !otp || !newPassword) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("/api/auth/reset-password", {
        email,
        otp,
        newPassword,
      });
      toast.success(res.data.message || "Password reset successful");
      setStep("request");
      setOtp("");
      setNewPassword("");
      setDevOtp("");
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to reset password"
        : "Failed to reset password";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-100 p-6">
      <div className="w-full max-w-md rounded-[2rem] border border-gray-200 bg-white p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-black text-green-700">CoreInventory</h1>
          <p className="mt-2 text-sm font-medium text-gray-500">
            {step === "request"
              ? "Request an OTP to reset your password"
              : "Enter the OTP and choose a new password"}
          </p>
        </div>

        <div className="mb-6 flex rounded-2xl bg-gray-100 p-1">
          <button
            onClick={() => setStep("request")}
            className={`flex-1 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
              step === "request" ? "bg-white text-green-700 shadow-sm" : "text-gray-500"
            }`}
          >
            Request OTP
          </button>
          <button
            onClick={() => setStep("reset")}
            className={`flex-1 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
              step === "reset" ? "bg-white text-green-700 shadow-sm" : "text-gray-500"
            }`}
          >
            Reset Password
          </button>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-3 pl-10 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {step === "reset" && (
            <>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 p-3 pl-10 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 p-3 pl-10 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </>
          )}

          {devOtp && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
              Development OTP: <span className="font-black tracking-widest">{devOtp}</span>
            </div>
          )}

          <button
            onClick={step === "request" ? requestOtp : resetPassword}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 p-3 font-bold text-white transition hover:bg-green-700 disabled:opacity-70"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {step === "request" ? "Send OTP" : "Reset Password"}
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          Remember your password?{" "}
          <Link href="/login" className="font-medium text-green-600 hover:underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
