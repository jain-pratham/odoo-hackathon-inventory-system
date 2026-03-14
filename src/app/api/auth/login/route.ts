import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/user.model";
import { comparePassword } from "@/lib/hash";
import { generateToken } from "@/lib/jwt";
import { SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    const user = await User.findOne({ email });

    if (!user) {
      
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = generateToken(user._id.toString());
    const response = NextResponse.json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Server Error in Login:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
