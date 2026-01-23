import { prisma } from "../../../../../src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../../../../../src/lib/auth/middleware";
import { validateTeamData } from "../../../../../src/lib/validation/teamValidation";
import cloudinary from "../../../../../src/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    
    const formData = await req.formData();
    
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phonenumber = formData.get('phonenumber') as string;
    const description = formData.get('description') as string;
    const currentsalary = formData.get('currentsalary') as string;
    const cnic = formData.get('cnic') as string;
    const address = formData.get('address') as string;
    const status = formData.get('status') as string;
    
    const imageFile = formData.get('image') as File;
    const documentFile = formData.get('uploaddocument') as File;

    const body = {
      name,
      email,
      phonenumber,
      description,
      currentsalary: parseFloat(currentsalary),
      cnic,
      address,
      status: (status as "ENABLE" | "DISABLE") || "ENABLE"
    };
    
    const { isValid, errors } = validateTeamData(body);
    
    if (!isValid) {
      return NextResponse.json({ 
        success: false, 
        error: "Validation failed", 
        details: errors 
      }, { status: 400 });
    }

    // Check if email already exists
    const existingEmail = await prisma.team.findUnique({
      where: { email: body.email }
    });
    
    if (existingEmail) {
      return NextResponse.json({ 
        success: false, 
        error: "Email already exists" 
      }, { status: 409 });
    }

    // Check if CNIC already exists
    const existingCnic = await prisma.team.findUnique({
      where: { cnic: body.cnic }
    });
    
    if (existingCnic) {
      return NextResponse.json({ 
        success: false, 
        error: "CNIC already exists" 
      }, { status: 409 });
    }

    let imagePath = null;
    let documentPath = null;

    // Handle image upload to Cloudinary
    if (imageFile && imageFile.size > 0) {
      const imageBuffer = await imageFile.arrayBuffer();
      const base64 = Buffer.from(imageBuffer).toString('base64');
      const dataURI = `data:${imageFile.type};base64,${base64}`;
      
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'team-images',
        resource_type: 'image'
      });
      imagePath = result.secure_url;
    }

    // Handle document upload to Cloudinary
    if (documentFile && documentFile.size > 0) {
      const docBuffer = await documentFile.arrayBuffer();
      const base64 = Buffer.from(docBuffer).toString('base64');
      const dataURI = `data:${documentFile.type};base64,${base64}`;
      
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'team-documents',
        resource_type: 'raw'
      });
      documentPath = result.secure_url;
    }

    const team = await prisma.team.create({
      data: {
        name: body.name,
        email: body.email,
        phonenumber: body.phonenumber,
        description: body.description,
        currentsalary: body.currentsalary,
        cnic: body.cnic,
        address: body.address,
        status: (body.status as "ENABLE" | "DISABLE") || "ENABLE",
        image: imagePath,
        uploaddocument: documentPath
      }
    });

    return NextResponse.json({ 
      success: true,
      message: "Team member created successfully",
      data: team 
    }, { status: 201 });

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
    return NextResponse.json({ success: false, error: "Failed to create team member" }, { status: 500 });
  }
}