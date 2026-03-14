import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { connectDB } from "@/lib/db";
import User from "@/models/user.model";
import { hashPassword } from "@/lib/hash";
import PasswordResetOTP from "@/models/otp.model";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { message: "Email, OTP, and new password are required" },
        { status: 400 }
      );
    }

    if (String(newPassword).length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    let storedOTP: string | null = null;

    try {
      storedOTP = await redis.get(`otp:${normalizedEmail}`);
    } catch (error) {
      console.error("Redis OTP read failed:", error);
    }

    if (!storedOTP) {
      const otpRecord = await PasswordResetOTP.findOne({
        email: normalizedEmail,
        expiresAt: { $gt: new Date() },
      });
      storedOTP = otpRecord?.otp || null;
    }

    if (!storedOTP || storedOTP !== String(otp).trim()) {
      return NextResponse.json(
        { message: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    const hashed = await hashPassword(String(newPassword));

    const updatedUser = await User.findOneAndUpdate(
      { email: normalizedEmail },
      { password: hashed }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    try {
      await redis.del(`otp:${normalizedEmail}`);
    } catch (error) {
      console.error("Redis OTP cleanup failed:", error);
    }
    await PasswordResetOTP.deleteOne({ email: normalizedEmail });

    return NextResponse.json({
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { message: "Failed to reset password" },
      { status: 500 }
    );
  }
}
