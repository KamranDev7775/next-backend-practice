import { prisma } from "../../../../src/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AuthError, AUTH_ERRORS } from "../../../../src/lib/auth/autherrors";
import { validateEmail } from "../../../../src/lib/auth/emailvalidation";
import { SUCCESS_MESSAGES, SUCCESS_STATUS } from "../../../../src/lib/auth/authsuccess";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      throw new AuthError(AUTH_ERRORS.MISSING_FIELDS, 400);
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AuthError(AUTH_ERRORS.INVALID_CREDENTIALS, 401);
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new AuthError(AUTH_ERRORS.INVALID_CREDENTIALS, 401);
    }

    await prisma.user.update({ where: { id: user.id }, data: { isLoggedIn: true } });

    const now = Math.floor(Date.now() / 1000);
    const accessToken = jwt.sign({ userId: user.id, iat: now, exp: now + 86400 }, process.env.JWT_SECRET || "secret");
    const refreshToken = jwt.sign({ userId: user.id, iat: now, exp: now + 86400 }, process.env.JWT_REFRESH_SECRET || "refresh-secret");
    
    const response = NextResponse.json({ 
      message: SUCCESS_MESSAGES.LOGIN_SUCCESS, 
      user: { id: user.id, name: user.name, lastname: user.lastname, email: user.email, role: user.role },
      accessToken,
      refreshToken
    }, { status: SUCCESS_STATUS.OK });
    
    response.cookies.set("accessToken", accessToken, { httpOnly: true, maxAge: 24 * 60 * 60 });
    response.cookies.set("refreshToken", refreshToken, { httpOnly: true, maxAge: 24 * 60 * 60  });
    
    return response;
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: AUTH_ERRORS.SERVER_ERROR }, { status: 500 });
  }
}