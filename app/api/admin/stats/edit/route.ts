import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { requireAdmin } from "@/src/lib/auth/middleware";
import { validateUpdateStatsData } from "@/src/lib/validation/statsValidation";

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin(req);
    
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        message: "Stats ID is required"
      }, { status: 400 });
    }

    const { isValid, errors } = validateUpdateStatsData(updateData);

    if (!isValid) {
      return NextResponse.json({
        success: false,
        message: "Validation failed",
        errors
      }, { status: 400 });
    }

    const existingStats = await prisma.stats.findUnique({
      where: { id }
    });

    if (!existingStats) {
      return NextResponse.json({
        success: false,
        message: "Stats not found"
      }, { status: 404 });
    }

    const cleanData: any = {};
    if (updateData.title !== undefined) cleanData.title = updateData.title.trim();
    if (updateData.description !== undefined) cleanData.description = updateData.description?.trim() || null;
    if (updateData.value !== undefined) cleanData.value = updateData.value.trim();

    const updatedStats = await prisma.stats.update({
      where: { id },
      data: cleanData
    });

    return NextResponse.json({
      success: true,
      message: "Stats updated successfully",
      data: updatedStats
    });
  } catch (error) {
    console.error("Update stats error:", error);
    
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