import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { generateOTP } from "@/lib/otp";
import { sendOTPEmail } from "@/lib/mail";
import { connectDB } from "@/lib/db";
import User from "@/models/user.model";
import PasswordResetOTP from "@/models/otp.model";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json({
        message: "If an account exists for that email, an OTP has been sent.",
      });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await PasswordResetOTP.findOneAndUpdate(
      { email: normalizedEmail },
      { otp, expiresAt },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    try {
      await redis.set(`otp:${normalizedEmail}`, otp, "EX", 300);
    } catch (error) {
      console.error("Redis OTP cache failed:", error);
    }

    let emailSent = false;
    try {
      await sendOTPEmail(normalizedEmail, otp);
      emailSent = true;
    } catch (error) {
      console.error("OTP email failed:", error);
    }

    return NextResponse.json({
      message: emailSent
        ? "OTP sent to your email"
        : "OTP generated. Email delivery is not configured, so use the OTP shown below in local development.",
      ...(process.env.NODE_ENV !== "production" ? { otp } : {}),
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "Failed to process forgot password request" },
      { status: 500 }
    );
  }
}
