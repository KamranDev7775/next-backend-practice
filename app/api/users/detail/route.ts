import { prisma } from "../../../../src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../../../src/lib/auth/middleware";

export async function GET(req: NextRequest) {
  try {
    const user = await verifyToken(req);
    
    const userDetail = await prisma.user.findUnique({
      where: { id: user.id },
      select: { 
        id: true, 
        name: true, 
        lastname: true,
        email: true, 
        role: true, 
        isLoggedIn: true,
        createdAt: true,
        updatedAt: true 
      }
    });

    return NextResponse.json({ user: userDetail });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function GET_BY_ID(req: NextRequest) {
  try {
    const currentUser = await verifyToken(req);
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');
    
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Only admin can view other users' details
    if (currentUser.role !== "ADMIN" && currentUser.id !== userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const userDetail = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        name: true, 
        lastname: true,
        email: true, 
        role: true, 
        isLoggedIn: true,
        createdAt: true,
        updatedAt: true 
      }
    });

    if (!userDetail) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: userDetail });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}