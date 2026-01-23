import { prisma } from "../../../../src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { verifyToken } from "../../../../src/lib/auth/middleware";
import { validatePassword } from "../../../../src/lib/auth/authvalidation";

export async function POST(req: NextRequest) {
  try {
    const tokenUser = await verifyToken(req);
    
    // Get user with password from database
    const user = await prisma.user.findUnique({
      where: { id: tokenUser.id }
    });
    
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }
    
    // Check if user is logged in (this ensures only fresh login tokens work)
    if (!user.isLoggedIn) {
      return NextResponse.json({ success: false, error: "Please login first" }, { status: 401 });
    }
    
    const body = await req.json();
    const { oldPassword, newPassword } = body;

    console.log("Change password request:", { userId: user.id, hasOldPassword: !!oldPassword, hasNewPassword: !!newPassword });

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ success: false, error: "Old password and new password are required" }, { status: 400 });
    }

    if (oldPassword === newPassword) {
      return NextResponse.json({ success: false, error: "New password must be different from old password" }, { status: 400 });
    }

    if (!validatePassword(newPassword)) {
      return NextResponse.json({ success: false, error: "Password must be at least 8 characters with uppercase, lowercase, number and symbol" }, { status: 400 });
    }

    const isValidOldPassword = await bcrypt.compare(oldPassword, user.password);
    console.log("Password comparison:", { 
      isValid: isValidOldPassword, 
      oldPasswordLength: oldPassword.length,
      hashedPasswordLength: user.password.length,
      hashedPasswordPrefix: user.password.substring(0, 10)
    });
    
    if (!isValidOldPassword) {
      return NextResponse.json({ success: false, error: "Old password is incorrect" }, { status: 400 });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        password: hashedNewPassword,
        isLoggedIn: false  // Logout user after password change
      }
    });

    return NextResponse.json({ 
      success: true,
      message: "Password changed successfully. Please login again with new password."
    });
  } catch (error: any) {
    console.error("Change password error:", error.message);
    if (error.message === "Token required") {
      return NextResponse.json({ success: false, error: "Token required" }, { status: 401 });
    }
    if (error.message === "Invalid token") {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
    }
    if (error.message === "Please login first") {
      return NextResponse.json({ success: false, error: "Please login first" }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: "Failed to change password" }, { status: 500 });
  }
}