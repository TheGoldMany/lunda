import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../lib/asyncHandler";
import { requireAuth, requireRole } from "../middleware/auth";
import { BookingStatus, JobRequestStatus, Role, VerificationStatus } from "../generated/prisma/client";
import { distanceKm, estimatedArrivalMinutes } from "../lib/geo";
import { paramId } from "../lib/params";

export const bookingsRouter = Router();

// Provider's incoming queue: open job requests matching their trade(s),
// nearest first. Any matching verified provider can see and accept these —
// there's no separate "invite a specific provider" step in this MVP slice.
bookingsRouter.get(
  "/incoming",
  requireAuth,
  requireRole(Role.PROVIDER),
  asyncHandler(async (req, res) => {
    const provider = await prisma.serviceProvider.findUnique({ where: { userId: req.auth!.userId } });
    if (!provider) return res.status(404).json({ error: "No provider profile yet" });
    if (provider.verificationStatus !== VerificationStatus.APPROVED) {
      return res.json([]);
    }

    const openRequests = await prisma.jobRequest.findMany({
      where: { status: JobRequestStatus.OPEN, trade: { in: provider.trades } },
      include: { customer: { select: { name: true, phone: true } } },
      orderBy: { createdAt: "asc" },
    });

    const ranked = openRequests
      .map((jr) => {
        const distance = distanceKm(provider.latitude, provider.longitude, jr.latitude, jr.longitude);
        return {
          ...jr,
          distanceKm: Math.round(distance * 10) / 10,
          estimatedArrivalMinutes: estimatedArrivalMinutes(distance),
        };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);

    res.json(ranked);
  })
);

const createSchema = z.object({
  jobRequestId: z.string().min(1),
});

// Provider accepts a job request -> Booking is created immediately.
bookingsRouter.post(
  "/",
  requireAuth,
  requireRole(Role.PROVIDER),
  asyncHandler(async (req, res) => {
    const body = createSchema.parse(req.body);

    const provider = await prisma.serviceProvider.findUnique({ where: { userId: req.auth!.userId } });
    if (!provider || provider.verificationStatus !== VerificationStatus.APPROVED) {
      return res.status(403).json({ error: "Provider not verified" });
    }

    const jobRequest = await prisma.jobRequest.findUnique({ where: { id: body.jobRequestId } });
    if (!jobRequest) return res.status(404).json({ error: "Job request not found" });
    if (!provider.trades.includes(jobRequest.trade)) {
      return res.status(400).json({ error: "Trade mismatch" });
    }

    try {
      const booking = await prisma.$transaction(async (tx) => {
        // Conditional update guards against two providers accepting the same
        // request at once: only one write can match status: OPEN.
        const updated = await tx.jobRequest.updateMany({
          where: { id: jobRequest.id, status: JobRequestStatus.OPEN },
          data: { status: JobRequestStatus.BOOKED },
        });
        if (updated.count === 0) {
          throw new Error("ALREADY_BOOKED");
        }
        return tx.booking.create({
          data: { jobRequestId: jobRequest.id, providerId: provider.id },
        });
      });

      res.status(201).json(booking);
    } catch (err) {
      if (err instanceof Error && err.message === "ALREADY_BOOKED") {
        return res.status(409).json({ error: "This job request was already booked" });
      }
      throw err;
    }
  })
);

bookingsRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (req.auth!.role === Role.PROVIDER) {
      const provider = await prisma.serviceProvider.findUnique({ where: { userId: req.auth!.userId } });
      if (!provider) return res.json([]);
      const bookings = await prisma.booking.findMany({
        where: { providerId: provider.id },
        include: { jobRequest: { include: { customer: { select: { name: true, phone: true } } } } },
        orderBy: { createdAt: "desc" },
      });
      return res.json(bookings);
    }

    const bookings = await prisma.booking.findMany({
      where: { jobRequest: { customerId: req.auth!.userId } },
      include: { jobRequest: true, provider: { include: { user: { select: { name: true, phone: true } } } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(bookings);
  })
);

const completeSchema = z.object({
  finalPrice: z.number().nonnegative(),
});

// Provider records the final price once the on-site work is done.
bookingsRouter.patch(
  "/:id/complete",
  requireAuth,
  requireRole(Role.PROVIDER),
  asyncHandler(async (req, res) => {
    const body = completeSchema.parse(req.body);

    const provider = await prisma.serviceProvider.findUnique({ where: { userId: req.auth!.userId } });
    const booking = await prisma.booking.findUnique({ where: { id: paramId(req, "id") } });
    if (!booking || !provider || booking.providerId !== provider.id) {
      return res.status(404).json({ error: "Booking not found" });
    }
    if (booking.status === BookingStatus.COMPLETED) {
      return res.status(409).json({ error: "Booking already completed" });
    }

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: { status: BookingStatus.COMPLETED, finalPrice: body.finalPrice, completedAt: new Date() },
    });

    res.json(updated);
  })
);
