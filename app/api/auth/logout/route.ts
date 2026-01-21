import { prisma } from "../../../../src/lib/prisma";
import { NextResponse } from "next/server";
import { AuthError, AUTH_ERRORS } from "../../../../src/lib/auth/autherrors";
import { SUCCESS_MESSAGES, SUCCESS_STATUS } from "../../../../src/lib/auth/authsuccess";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();
    
    if (!id) {
      throw new AuthError(AUTH_ERRORS.USER_ID_REQUIRED, 400);
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new AuthError(AUTH_ERRORS.USER_NOT_FOUND, 404);
    }

    if (!user.isLoggedIn) {
      throw new AuthError(AUTH_ERRORS.USER_NOT_LOGGED_IN, 400);
    }

    await prisma.user.update({ where: { id }, data: { isLoggedIn: false } });

    const response = NextResponse.json({ 
      message: SUCCESS_MESSAGES.LOGOUT_SUCCESS 
    }, { status: SUCCESS_STATUS.OK });
    
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    return response;
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: AUTH_ERRORS.SERVER_ERROR }, { status: 500 });
  }
}