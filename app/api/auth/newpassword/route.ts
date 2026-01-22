import { prisma } from "../../../../src/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { validateEmail } from "../../../../src/lib/auth/emailvalidation";
import { validatePassword } from "../../../../src/lib/auth/authvalidation";

export async function POST(req: Request) {
  try {
    const { email, otp, password, confirmPassword } = await req.json();

    if (!email || !otp || !password || !confirmPassword) {
      return NextResponse.json({ error: "Email, OTP, password and confirm password are required" }, { status: 400 });
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }

    if (!validatePassword(password)) {
      return NextResponse.json({ error: "Password must be at least 8 characters with uppercase, lowercase, number and symbol" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.otp || !user.otpExpiry) {
      return NextResponse.json({ error: "No OTP found. Please request a new one" }, { status: 400 });
    }

    if (new Date() > user.otpExpiry) {
      return NextResponse.json({ error: "OTP has expired" }, { status: 400 });
    }

    if (user.otp !== otp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { email },
      data: { 
        password: hashedPassword,
        otp: null,
        otpExpiry: null
      }
    });

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}