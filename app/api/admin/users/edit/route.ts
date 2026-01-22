import { prisma } from "../../../../../src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireAdmin } from "../../../../../src/lib/auth/middleware";

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin(req);
    
    const { id, name, lastname, email, password, role } = await req.json();
    
    if (!id) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (lastname) updateData.lastname = lastname;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (password) updateData.password = await bcrypt.hash(password, 12);

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, lastname: true, email: true, role: true, updatedAt: true }
    });

    return NextResponse.json({ message: "User updated successfully", user });
  } catch (error: any) {
    if (error.message === "Token required") {
      return NextResponse.json({ error: "Token required" }, { status: 401 });
    }
    if (error.message === "Invalid token") {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    if (error.message === "You are not an admin") {
      return NextResponse.json({ error: "You are not an admin" }, { status: 403 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}