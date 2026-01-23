import { prisma } from "../../../../src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../../../../src/lib/auth/middleware";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    
    const teams = await prisma.team.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ 
      success: true,
      message: "Teams retrieved successfully",
      data: teams 
    });
  } catch (error: any) {
    if (error.message === "Token required") {
      return NextResponse.json({ success: false, error: "Token required" }, { status: 401 });
    }
    if (error.message === "Invalid token") {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
    }
    if (error.message === "You are not an admin") {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });
    }
    return NextResponse.json({ success: false, error: "Failed to retrieve teams" }, { status: 500 });
  }
}