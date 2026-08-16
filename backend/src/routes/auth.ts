import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { signToken } from "../lib/jwt";
import { asyncHandler } from "../lib/asyncHandler";
import { Role } from "../generated/prisma/client";

export const authRouter = Router();

const registerSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(3),
  email: z.string().email().optional(),
  password: z.string().min(8),
  role: z.enum([Role.CUSTOMER, Role.PROVIDER]),
  city: z.string().min(1),
});

authRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    const body = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { phone: body.phone } });
    if (existing) {
      return res.status(409).json({ error: "Phone number already registered" });
    }

    const passwordHash = await bcrypt.hash(body.password, 10);
    const user = await prisma.user.create({
      data: {
        name: body.name,
        phone: body.phone,
        email: body.email,
        passwordHash,
        role: body.role,
        city: body.city,
      },
    });

    const token = signToken({ userId: user.id, role: user.role });
    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, phone: user.phone, role: user.role, city: user.city },
    });
  })
);

const loginSchema = z.object({
  phone: z.string().min(3),
  password: z.string().min(1),
});

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const body = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { phone: body.phone } });
    if (!user) {
      return res.status(401).json({ error: "Invalid phone or password" });
    }

    const valid = await bcrypt.compare(body.password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid phone or password" });
    }

    const token = signToken({ userId: user.id, role: user.role });
    res.json({
      token,
      user: { id: user.id, name: user.name, phone: user.phone, role: user.role, city: user.city },
    });
  })
);
