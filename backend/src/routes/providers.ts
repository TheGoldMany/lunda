import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../lib/asyncHandler";
import { requireAuth, requireRole } from "../middleware/auth";
import { Role, Trade, VerificationStatus } from "../generated/prisma/client";
import { paramId } from "../lib/params";

export const providersRouter = Router();

const profileSchema = z.object({
  trades: z.array(z.enum([Trade.WATER, Trade.GAS, Trade.ELECTRICITY])).min(1),
  calloutFee: z.number().nonnegative(),
  hourlyRate: z.number().nonnegative(),
  licenseDocumentUrl: z.string().url().optional(),
  latitude: z.number(),
  longitude: z.number(),
});

// Provider creates/updates their own onboarding profile. Stays PENDING until an admin approves it.
providersRouter.post(
  "/me",
  requireAuth,
  requireRole(Role.PROVIDER),
  asyncHandler(async (req, res) => {
    const body = profileSchema.parse(req.body);

    const provider = await prisma.serviceProvider.upsert({
      where: { userId: req.auth!.userId },
      create: {
        userId: req.auth!.userId,
        trades: body.trades,
        calloutFee: body.calloutFee,
        hourlyRate: body.hourlyRate,
        licenseDocumentUrl: body.licenseDocumentUrl,
        latitude: body.latitude,
        longitude: body.longitude,
      },
      update: {
        trades: body.trades,
        calloutFee: body.calloutFee,
        hourlyRate: body.hourlyRate,
        licenseDocumentUrl: body.licenseDocumentUrl,
        latitude: body.latitude,
        longitude: body.longitude,
        // Re-submitting a changed profile puts verification back into review.
        verificationStatus: VerificationStatus.PENDING,
      },
    });

    res.status(201).json(provider);
  })
);

providersRouter.get(
  "/me",
  requireAuth,
  requireRole(Role.PROVIDER),
  asyncHandler(async (req, res) => {
    const provider = await prisma.serviceProvider.findUnique({ where: { userId: req.auth!.userId } });
    if (!provider) return res.status(404).json({ error: "No provider profile yet" });
    res.json(provider);
  })
);

// Admin: verification queue.
providersRouter.get(
  "/pending",
  requireAuth,
  requireRole(Role.ADMIN),
  asyncHandler(async (_req, res) => {
    const pending = await prisma.serviceProvider.findMany({
      where: { verificationStatus: VerificationStatus.PENDING },
      include: { user: { select: { name: true, phone: true, city: true } } },
      orderBy: { createdAt: "asc" },
    });
    res.json(pending);
  })
);

const verifySchema = z.object({
  status: z.enum([VerificationStatus.APPROVED, VerificationStatus.REJECTED]),
});

providersRouter.patch(
  "/:id/verify",
  requireAuth,
  requireRole(Role.ADMIN),
  asyncHandler(async (req, res) => {
    const body = verifySchema.parse(req.body);
    const provider = await prisma.serviceProvider.update({
      where: { id: paramId(req, "id") },
      data: { verificationStatus: body.status },
    });
    res.json(provider);
  })
);
