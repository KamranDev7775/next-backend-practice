import { prisma } from "../../../../../src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireAdmin } from "../../../../../src/lib/auth/middleware";
import { validateEmail } from "../../../../../src/lib/auth/emailvalidation";
import { validatePassword } from "../../../../../src/lib/auth/authvalidation";
import { AUTH_ERRORS, AuthError } from "../../../../../src/lib/auth/autherrors";

export async function POST(req: NextRequest) {
  try {
    console.log("Headers:", req.headers.get("authorization"));
    console.log("Cookies:", req.cookies.get("accessToken"));
    
    const admin = await requireAdmin(req);
    console.log("Admin user:", admin);
    
    const { name, lastname, email, password, role = "USER" } = await req.json();
    
    if (!name || !lastname || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    if (!validatePassword(password)) {
      throw new AuthError(AUTH_ERRORS.WEAK_PASSWORD, 400);
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, lastname, email, password: hashedPassword, role },
      select: { id: true, name: true, lastname: true, email: true, role: true, createdAt: true }
    });

    return NextResponse.json({ message: "User created successfully", user }, { status: 201 });
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
    if (error.message === "You are not an admin") {
      return NextResponse.json({ error: "You are not an admin" }, { status: 403 });
    }
    if (error.message === AUTH_ERRORS.WEAK_PASSWORD) {
      return NextResponse.json({ error: AUTH_ERRORS.WEAK_PASSWORD }, { status: 400 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}