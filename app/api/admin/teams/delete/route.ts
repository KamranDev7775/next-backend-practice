import { prisma } from "../../../../../src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../../../../../src/lib/auth/middleware";

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin(req);
    
    const body = await req.json();
    const { id } = body;
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: "Team ID is required" 
      }, { status: 400 });
    }

    // Check if team exists
    const existingTeam = await prisma.team.findUnique({
      where: { id }
    });
    
    if (!existingTeam) {
      return NextResponse.json({ 
        success: false, 
        error: "Team member not found" 
      }, { status: 404 });
    }

    await prisma.team.delete({
      where: { id }
    });

    return NextResponse.json({ 
      success: true,
      message: "Team member deleted successfully"
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
    return NextResponse.json({ success: false, error: "Failed to delete team member" }, { status: 500 });
  }
}