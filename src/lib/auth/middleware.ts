import jwt from "jsonwebtoken";
import { prisma } from "../prisma";
import { NextRequest } from "next/server";

export async function verifyToken(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  // const cookieToken = req.cookies.get("accessToken")?.value; // Disable cookie for testing
  const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
  
  console.log("Token check:", { authHeader, token });
  
  if (!token) {
    console.log("No token found, throwing error");
    throw new Error("Token required");
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as { userId: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    
    if (!user) throw new Error("Invalid token");
    if (!user.isLoggedIn) throw new Error("Please login first");
    return user;
  } catch (error) {
    if (error instanceof Error && error.message === "Please login first") {
      throw error;
    }
    throw new Error("Invalid token");
  }
}

export async function requireAdmin(req: NextRequest) {
  const user = await verifyToken(req);
  if (user.role !== "ADMIN") throw new Error("You are not an admin");
  return user;
}