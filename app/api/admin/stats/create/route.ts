import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { requireAdmin } from "@/src/lib/auth/middleware";
import { validateStatsData } from "@/src/lib/validation/statsValidation";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    
    const body = await req.json();
    const { isValid, errors } = validateStatsData(body);

    if (!isValid) {
      return NextResponse.json({
        success: false,
        message: "Validation failed",
        errors
      }, { status: 400 });
    }

    const stats = await prisma.stats.create({
      data: {
        title: body.title.trim(),
        description: body.description?.trim() || null,
        value: body.value.trim()
      }
    });

    return NextResponse.json({
      success: true,
      message: "Stats created successfully",
      data: stats
    }, { status: 201 });
  } catch (error) {
    console.error("Create stats error:", error);
    
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