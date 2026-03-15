"use client";

import { Suspense, useState } from "react";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Package2, Eye, EyeOff, Loader2 } from "lucide-react";
import axios from "axios";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Changed loginId to email to match your backend logic!
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post("/api/auth/login", {
        email,
        password,
      });

      toast.success(res.data.message || "Welcome back! 🎉");

      const nextRoute = searchParams.get("next") || "/dashboard";

      setTimeout(() => {
        router.push(nextRoute);
      }, 1000);

    } catch (error: unknown) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "Invalid credentials"
        : "Invalid credentials";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-white to-green-50/50 font-sans">
      
      {/* Left Panel - Deep Green Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-green-950 items-center justify-center overflow-hidden">
        {/* Glowing abstract background shapes */}
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-green-500 blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full bg-emerald-400 blur-3xl"></div>
        </div>
        
        <div className="relative z-10 text-center px-12 text-white">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl shadow-green-900/50">
            <Package2 className="text-white h-10 w-10" />
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-6 leading-tight text-white">
            Welcome back to <br />
            <span className="text-green-400">CoreInventory.</span>
          </h1>
          <p className="text-lg text-green-200/80 max-w-md mx-auto font-medium">
            Log in to access your dashboard, monitor stock levels, and manage your supply chain operations.
          </p>
        </div>
      </div>

      {/* Right Panel - Form (Green Tinted) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 relative">
        <div className="w-full max-w-md space-y-8 relative z-10">
          
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-10">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-700 shadow-sm border border-green-200">
              <Package2 className="h-7 w-7" />
            </div>
            <h2 className="text-3xl font-bold text-green-950">CoreInventory</h2>
          </div>

          <div className="text-left">
            <h2 className="text-3xl font-bold text-green-950 mb-2">Log in to your account</h2>
            <p className="text-green-800/70 font-medium">Enter your credentials to continue.</p>
          </div>

          <form onSubmit={login} className="space-y-6 mt-8">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-green-900">Email Address</label>
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-green-200 bg-green-50/50 px-4 py-3 text-green-950 placeholder-green-700/40 transition-all focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/20 outline-none"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-green-900">Password</label>
                <Link
                  href="/reset-password"
                  className="text-sm font-semibold text-green-700 hover:text-green-800 transition-colors hover:underline underline-offset-4"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-green-200 bg-green-50/50 px-4 py-3 pr-12 text-green-950 placeholder-green-700/40 transition-all focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/20 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600/50 hover:text-green-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-600 py-3.5 text-white font-semibold shadow-lg shadow-green-600/30 transition-all hover:bg-green-700 hover:shadow-green-700/40 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70 mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-green-800/80 mt-8">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-bold text-green-700 hover:text-green-800 transition-colors hover:underline underline-offset-4">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-green-50/50">
          <div className="text-sm font-semibold text-green-700">
            Loading...
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
