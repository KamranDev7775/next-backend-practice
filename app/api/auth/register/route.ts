import { prisma } from "../../../../src/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AuthError, AUTH_ERRORS } from "../../../../src/lib/auth/autherrors";
import { validatePassword } from "../../../../src/lib/auth/authvalidation";
import { SUCCESS_MESSAGES, SUCCESS_STATUS } from "../../../../src/lib/auth/authsuccess";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      throw new AuthError(AUTH_ERRORS.MISSING_FIELDS, 400);
    }

    if (!validatePassword(password)) {
      throw new AuthError(AUTH_ERRORS.WEAK_PASSWORD, 400);
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AuthError(AUTH_ERRORS.USER_EXISTS, 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: { id: true, name: true, email: true, createdAt: true }
    });

    const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || "secret", { expiresIn: "15m" });
    const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET || "refresh-secret", { expiresIn: "7d" });

    const response = NextResponse.json({ 
      message: SUCCESS_MESSAGES.USER_CREATED, 
      user,
      accessToken,
      refreshToken
    }, { status: SUCCESS_STATUS.CREATED });
    
    response.cookies.set("accessToken", accessToken, { httpOnly: true, maxAge: 15 * 60 * 1000 });
    response.cookies.set("refreshToken", refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    
    return response;
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: AUTH_ERRORS.SERVER_ERROR }, { status: 500 });
  }
}