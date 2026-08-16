import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../lib/asyncHandler";
import { requireAuth, requireRole } from "../middleware/auth";
import { Role, Trade, Urgency, VerificationStatus } from "../generated/prisma/client";
import { distanceKm, estimatedArrivalMinutes } from "../lib/geo";
import { paramId } from "../lib/params";

export const jobRequestsRouter = Router();

const createSchema = z.object({
  trade: z.enum([Trade.WATER, Trade.GAS, Trade.ELECTRICITY]),
  description: z.string().min(1),
  photoUrl: z.string().url().optional(),
  address: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
});

// 4.1 Sürgős munka: customer picks a trade and describes the problem.
jobRequestsRouter.post(
  "/",
  requireAuth,
  requireRole(Role.CUSTOMER),
  asyncHandler(async (req, res) => {
    const body = createSchema.parse(req.body);

    const jobRequest = await prisma.jobRequest.create({
      data: {
        customerId: req.auth!.userId,
        trade: body.trade,
        description: body.description,
        photoUrl: body.photoUrl,
        address: body.address,
        latitude: body.latitude,
        longitude: body.longitude,
        urgency: Urgency.URGENT,
      },
    });

    res.status(201).json(jobRequest);
  })
);

jobRequestsRouter.get(
  "/me",
  requireAuth,
  requireRole(Role.CUSTOMER),
  asyncHandler(async (req, res) => {
    const jobRequests = await prisma.jobRequest.findMany({
      where: { customerId: req.auth!.userId },
      include: { booking: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(jobRequests);
  })
);

// The system lists the nearest, available, verified providers with estimated
// arrival time and a ballpark price (callout fee).
jobRequestsRouter.get(
  "/:id/providers",
  requireAuth,
  requireRole(Role.CUSTOMER),
  asyncHandler(async (req, res) => {
    const jobRequest = await prisma.jobRequest.findUnique({ where: { id: paramId(req, "id") } });
    if (!jobRequest || jobRequest.customerId !== req.auth!.userId) {
      return res.status(404).json({ error: "Job request not found" });
    }

    const candidates = await prisma.serviceProvider.findMany({
      where: {
        trades: { has: jobRequest.trade },
        verificationStatus: VerificationStatus.APPROVED,
        isAvailable: true,
      },
      include: { user: { select: { name: true } } },
    });

    const ranked = candidates
      .map((provider) => {
        const distance = distanceKm(
          jobRequest.latitude,
          jobRequest.longitude,
          provider.latitude,
          provider.longitude
        );
        return {
          id: provider.id,
          providerName: provider.user.name,
          trades: provider.trades,
          ratingAvg: provider.ratingAvg,
          calloutFee: provider.calloutFee,
          hourlyRate: provider.hourlyRate,
          distanceKm: Math.round(distance * 10) / 10,
          estimatedArrivalMinutes: estimatedArrivalMinutes(distance),
        };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);

    res.json(ranked);
  })
);

jobRequestsRouter.get(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const jobRequest = await prisma.jobRequest.findUnique({
      where: { id: paramId(req, "id") },
      include: { booking: true },
    });
    if (!jobRequest) return res.status(404).json({ error: "Job request not found" });
    if (jobRequest.customerId !== req.auth!.userId && req.auth!.role !== Role.ADMIN) {
      return res.status(403).json({ error: "Forbidden" });
    }
    res.json(jobRequest);
  })
);
