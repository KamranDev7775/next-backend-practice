import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { requireAdmin } from "@/src/lib/auth/middleware";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        message: "Stats ID is required"
      }, { status: 400 });
    }

    const stats = await prisma.stats.findUnique({
      where: { id }
    });

    if (!stats) {
      return NextResponse.json({
        success: false,
        message: "Stats not found"
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Stats retrieved successfully",
      data: stats
    });
  } catch (error) {
    console.error("Get stats detail error:", error);
    
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