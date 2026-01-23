import { prisma } from "../../../../src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../../../src/lib/auth/middleware";

export async function GET(req: NextRequest) {
  try {
    const currentUser = await verifyToken(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const userDetail = await prisma.user.findUnique({
      where: { id },
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

    // Check if requested user is logged in and token belongs to same user
    if (!userDetail.isLoggedIn || currentUser.id !== id) {
      return NextResponse.json({ error: "User not logged in or invalid token" }, { status: 403 });
    }

    return NextResponse.json({ user: userDetail });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}