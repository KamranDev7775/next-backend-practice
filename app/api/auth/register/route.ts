import { prisma } from "../../../../src/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AuthError, AUTH_ERRORS } from "../../../../src/lib/auth/autherrors";
import { validatePassword } from "../../../../src/lib/auth/authvalidation";
import { validateEmail } from "../../../../src/lib/auth/emailvalidation";
import { SUCCESS_MESSAGES, SUCCESS_STATUS } from "../../../../src/lib/auth/authsuccess";

export async function POST(req: Request) {
  try {
    const { name, lastname, email, password, confirmPassword } = await req.json();

    if (!name || !lastname || !email || !password || !confirmPassword) {
      throw new AuthError(AUTH_ERRORS.MISSING_FIELDS, 400);
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
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
      data: { name, lastname, email, password: hashedPassword, role: "USER" },
      select: { id: true, name: true, lastname: true, email: true, role: true, createdAt: true }
    });

    const now = Math.floor(Date.now() / 1000);
    const accessToken = jwt.sign({ userId: user.id, iat: now, exp: now + 86400 }, process.env.JWT_SECRET || "secret");
    const refreshToken = jwt.sign({ userId: user.id, iat: now, exp: now + 86400 }, process.env.JWT_REFRESH_SECRET || "refresh-secret");

    const response = NextResponse.json({ 
      message: SUCCESS_MESSAGES.USER_CREATED, 
      user,
      accessToken,
      refreshToken
    }, { status: SUCCESS_STATUS.CREATED });
    
    response.cookies.set("accessToken", accessToken, { httpOnly: true, maxAge: 24 * 60 * 60  });
    response.cookies.set("refreshToken", refreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 });
    
    return response;
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: AUTH_ERRORS.SERVER_ERROR }, { status: 500 });
  }
}