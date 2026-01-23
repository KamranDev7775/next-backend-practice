import { prisma } from "../../../../../src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../../../../../src/lib/auth/middleware";
import { validateUpdateTeamData } from "../../../../../src/lib/validation/teamValidation";

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin(req);
    
    const body = await req.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: "Team ID is required" 
      }, { status: 400 });
    }

    const { isValid, errors } = validateUpdateTeamData(updateData);
    
    if (!isValid) {
      return NextResponse.json({ 
        success: false, 
        error: "Validation failed", 
        details: errors 
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

    // Check email uniqueness if email is being updated
    if (updateData.email && updateData.email !== existingTeam.email) {
      const emailExists = await prisma.team.findUnique({
        where: { email: updateData.email }
      });
      
      if (emailExists) {
        return NextResponse.json({ 
          success: false, 
          error: "Email already exists" 
        }, { status: 409 });
      }
    }

    // Check CNIC uniqueness if CNIC is being updated
    if (updateData.cnic && updateData.cnic !== existingTeam.cnic) {
      const cnicExists = await prisma.team.findUnique({
        where: { cnic: updateData.cnic }
      });
      
      if (cnicExists) {
        return NextResponse.json({ 
          success: false, 
          error: "CNIC already exists" 
        }, { status: 409 });
      }
    }

    // Prepare update data
    const dataToUpdate: any = {};
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        if (key === 'currentsalary') {
          dataToUpdate[key] = parseFloat(updateData[key]);
        } else {
          dataToUpdate[key] = updateData[key];
        }
      }
    });

    const updatedTeam = await prisma.team.update({
      where: { id },
      data: dataToUpdate
    });

    return NextResponse.json({ 
      success: true,
      message: "Team member updated successfully",
      data: updatedTeam 
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
    return NextResponse.json({ success: false, error: "Failed to update team member" }, { status: 500 });
  }
}