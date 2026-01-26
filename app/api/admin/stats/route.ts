import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { requireAdmin } from "@/src/lib/auth/middleware";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    
    const stats = await prisma.stats.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      message: "Stats retrieved successfully",
      data: stats
    });
  } catch (error) {
    console.error("Get stats error:", error);
    
    if (error instanceof Error) {
      if (error.message === "Token required" || error.message === "Invalid token") {
        return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
      }
      if (error.message === "You are not an admin") {
        return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 });
      }
      if (error.message === "Please login first") {
        return NextResponse.json({ success: false, message: "Please login first" }, { status: 401 });
      }
    }

    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}