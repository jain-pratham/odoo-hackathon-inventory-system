import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;
export const SESSION_COOKIE_NAME = "coreinventory_session";

type JwtPayload = { userId: string };

function getTokenFromRequest(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  return req.cookies.get(SESSION_COOKIE_NAME)?.value;
}

export function getUserFromToken(req: NextRequest) {
  const token = getTokenFromRequest(req);

  if (!token) {
    throw new Error("No token provided");
  }

  const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

  return decoded.userId;
}

export function verifySessionToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
