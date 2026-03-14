import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/user.model";
import { comparePassword } from "@/lib/hash";
import { generateToken } from "@/lib/jwt";

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

    console.log("Success! Token generated."); // 👈 Log 5

    return NextResponse.json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("Server Error in Login:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}