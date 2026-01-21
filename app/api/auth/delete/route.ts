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

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ 
      message: SUCCESS_MESSAGES.USER_DELETED 
    }, { status: SUCCESS_STATUS.OK });
  } catch (error: any) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    if (error.code === 'P2025') {
      return NextResponse.json({ error: AUTH_ERRORS.USER_NOT_FOUND }, { status: 404 });
    }
    return NextResponse.json({ error: AUTH_ERRORS.SERVER_ERROR }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      throw new AuthError(AUTH_ERRORS.USER_ID_REQUIRED, 400);
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ 
      message: SUCCESS_MESSAGES.USER_DELETED 
    }, { status: SUCCESS_STATUS.OK });
  } catch (error: any) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    if (error.code === 'P2025') {
      return NextResponse.json({ error: AUTH_ERRORS.USER_NOT_FOUND }, { status: 404 });
    }
    return NextResponse.json({ error: AUTH_ERRORS.SERVER_ERROR }, { status: 500 });
  }
}