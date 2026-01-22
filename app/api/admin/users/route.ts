import { prisma } from "../../../../src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../../../../src/lib/auth/middleware";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    
    const users = await prisma.user.findMany({
      select: { 
        id: true, 
        name: true, 
        lastname: true,
        email: true, 
        role: true, 
        isLoggedIn: true,
        createdAt: true,
        updatedAt: true 
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ users });
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