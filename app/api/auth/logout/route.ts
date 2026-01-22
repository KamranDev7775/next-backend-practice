import { prisma } from "../../../../src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../../../src/lib/auth/middleware";
import { AuthError, AUTH_ERRORS } from "../../../../src/lib/auth/autherrors";
import { SUCCESS_MESSAGES, SUCCESS_STATUS } from "../../../../src/lib/auth/authsuccess";

export async function POST(req: NextRequest) {
  try {
    const user = await verifyToken(req);

    await prisma.user.update({ where: { id: user.id }, data: { isLoggedIn: false } });

    const response = NextResponse.json({ 
      message: SUCCESS_MESSAGES.LOGOUT_SUCCESS 
    }, { status: SUCCESS_STATUS.OK });
    
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    return response;
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
    return NextResponse.json({ error: AUTH_ERRORS.SERVER_ERROR }, { status: 500 });
  }
}