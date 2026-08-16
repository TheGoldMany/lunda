import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../lib/asyncHandler";
import { requireAuth, requireRole } from "../middleware/auth";
import { JobRequestStatus, QuoteStatus, Role, VerificationStatus } from "../generated/prisma/client";
import { paramId } from "../lib/params";

export const quotesRouter = Router();

const createSchema = z.object({
  jobRequestId: z.string().min(1),
  price: z.number().nonnegative(),
  estimatedDurationMinutes: z.number().int().positive(),
  message: z.string().optional(),
  proposedStartAt: z.coerce.date().optional(),
  validUntil: z.coerce.date(),
});

// Provider submits a Quote against a planned job request.
quotesRouter.post(
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
    if (!jobRequest || jobRequest.status !== JobRequestStatus.OPEN) {
      return res.status(404).json({ error: "Job request not found or no longer open" });
    }
    if (!provider.trades.includes(jobRequest.trade)) {
      return res.status(400).json({ error: "Trade mismatch" });
    }

    const existing = await prisma.quote.findUnique({
      where: { jobRequestId_providerId: { jobRequestId: jobRequest.id, providerId: provider.id } },
    });
    if (existing) return res.status(409).json({ error: "You already submitted a quote for this job" });

    const quote = await prisma.quote.create({
      data: {
        jobRequestId: jobRequest.id,
        providerId: provider.id,
        price: body.price,
        estimatedDurationMinutes: body.estimatedDurationMinutes,
        message: body.message,
        proposedStartAt: body.proposedStartAt,
        validUntil: body.validUntil,
      },
    });

    res.status(201).json(quote);
  })
);

// Customer accepts one quote -> Booking is created for the agreed time,
// the job request closes, and the other quotes are marked rejected.
quotesRouter.post(
  "/:id/accept",
  requireAuth,
  requireRole(Role.CUSTOMER),
  asyncHandler(async (req, res) => {
    const quoteId = paramId(req, "id");
    const quote = await prisma.quote.findUnique({ where: { id: quoteId }, include: { jobRequest: true } });
    if (!quote || quote.jobRequest.customerId !== req.auth!.userId) {
      return res.status(404).json({ error: "Quote not found" });
    }
    if (quote.status !== QuoteStatus.PENDING) {
      return res.status(409).json({ error: "This quote is no longer pending" });
    }

    try {
      const booking = await prisma.$transaction(async (tx) => {
        // Conditional update guards against accepting two quotes for the same job at once.
        const updated = await tx.jobRequest.updateMany({
          where: { id: quote.jobRequestId, status: JobRequestStatus.OPEN },
          data: { status: JobRequestStatus.BOOKED },
        });
        if (updated.count === 0) {
          throw new Error("ALREADY_BOOKED");
        }

        await tx.quote.update({ where: { id: quote.id }, data: { status: QuoteStatus.ACCEPTED } });
        await tx.quote.updateMany({
          where: { jobRequestId: quote.jobRequestId, id: { not: quote.id }, status: QuoteStatus.PENDING },
          data: { status: QuoteStatus.REJECTED },
        });

        return tx.booking.create({
          data: {
            jobRequestId: quote.jobRequestId,
            providerId: quote.providerId,
            scheduledAt: quote.proposedStartAt,
          },
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
