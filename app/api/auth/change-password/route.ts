import { prisma } from "../../../../src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { verifyToken } from "../../../../src/lib/auth/middleware";
import { validatePassword } from "../../../../src/lib/auth/authvalidation";

export async function POST(req: NextRequest) {
  try {
    const user = await verifyToken(req);
    
    const { oldPassword, newPassword } = await req.json();

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ error: "Old password and new password are required" }, { status: 400 });
    }

    if (!validatePassword(newPassword)) {
      return NextResponse.json({ error: "Password must be at least 8 characters with uppercase, lowercase, number and symbol" }, { status: 400 });
    }

    const isValidOldPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isValidOldPassword) {
      return NextResponse.json({ error: "Old password is incorrect" }, { status: 400 });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword }
    });

    return NextResponse.json({ message: "Password changed successfully" });
  } catch (error: any) {
    if (error.message === "Token required") {
      return NextResponse.json({ error: "Token required" }, { status: 401 });
    }
    if (error.message === "Invalid token") {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    if (error.message === "Please login first") {
      return NextResponse.json({ error: "Please login first" }, { status: 401 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}