"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function ResetPassword(){

  const [email,setEmail] = useState("");

  const resetPassword = () => {

    if(email){
      toast.success("Reset link sent 📩");
    }else{
      toast.error("Please enter your email");
    }

  };

  return(

    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-blue-100">

      <div className="w-[420px] bg-white p-10 rounded-2xl shadow-xl border border-gray-200">

        <h1 className="text-4xl font-bold text-center text-green-600 mb-2">
          CoreInventory
        </h1>

        <p className="text-center text-gray-600 mb-8">
          Reset your password
        </p>

        <div className="space-y-5">

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 placeholder-gray-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
          />

          <button
            onClick={resetPassword}
            className="w-full bg-green-500 text-white font-semibold p-3 rounded-lg hover:bg-green-600 transition"
          >
            Send Reset Link
          </button>

        </div>

        <div className="text-center mt-6 text-gray-600 text-sm">

          Remember your password?{" "}
          <a href="/login" className="text-green-600 font-medium hover:underline">
            Login
          </a>

        </div>

      </div>

    </div>

  );
}