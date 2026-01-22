import { prisma } from "../../../../src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../../../src/lib/auth/middleware";
import { AuthError, AUTH_ERRORS } from "../../../../src/lib/auth/autherrors";
import { SUCCESS_MESSAGES, SUCCESS_STATUS } from "../../../../src/lib/auth/authsuccess";

export async function POST(req: NextRequest) {
  try {
    const user = await verifyToken(req);
    
    await prisma.user.delete({ where: { id: user.id } });
    return NextResponse.json({ 
      message: SUCCESS_MESSAGES.USER_DELETED 
    }, { status: SUCCESS_STATUS.OK });
  } catch (error: any) {
    if (error.message === "Token required") {
      return NextResponse.json({ error: "Token required" }, { status: 401 });
    }
    if (error.message === "Invalid token") {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    if (error.message === "Please login first") {
      return NextResponse.json({ error: "Please login first" }, { status: 401 });
    }
    if (error.code === 'P2025') {
      return NextResponse.json({ error: AUTH_ERRORS.USER_NOT_FOUND }, { status: 404 });
    }
    return NextResponse.json({ error: AUTH_ERRORS.SERVER_ERROR }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  return POST(req);
}