import jwt from "jsonwebtoken";
import { Role } from "../generated/prisma/client";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET env var is required");
}
const JWT_SECRET: string = process.env.JWT_SECRET;

export interface AuthTokenPayload {
  userId: string;
  role: Role;
}

export function signToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): AuthTokenPayload {
  return jwt.verify(token, JWT_SECRET) as unknown as AuthTokenPayload;
}
