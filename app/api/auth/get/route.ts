import { prisma } from "../../../../src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../../../src/lib/auth/middleware";

export async function GET(req: NextRequest) {
  try {
    const user = await verifyToken(req);
    
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, name: true, lastname: true, email: true, role: true, createdAt: true }
    });
    
    return NextResponse.json({ user: userData });
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