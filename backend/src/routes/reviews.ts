import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../lib/asyncHandler";
import { requireAuth } from "../middleware/auth";
import { BookingStatus } from "../generated/prisma/client";

export const reviewsRouter = Router();

const createSchema = z.object({
  bookingId: z.string().min(1),
  score: z.number().int().min(1).max(5),
  text: z.string().optional(),
});

// Mutual review: whichever side (customer or provider) calls this rates the other.
reviewsRouter.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = createSchema.parse(req.body);

    const booking = await prisma.booking.findUnique({
      where: { id: body.bookingId },
      include: { jobRequest: true, provider: true },
    });
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (booking.status !== BookingStatus.COMPLETED) {
      return res.status(400).json({ error: "Booking is not completed yet" });
    }

    const userId = req.auth!.userId;
    const customerId = booking.jobRequest.customerId;
    const providerUserId = booking.provider.userId;

    let revieweeId: string;
    if (userId === customerId) {
      revieweeId = providerUserId;
    } else if (userId === providerUserId) {
      revieweeId = customerId;
    } else {
      return res.status(403).json({ error: "Not a participant in this booking" });
    }

    const existing = await prisma.review.findUnique({
      where: { bookingId_reviewerId: { bookingId: booking.id, reviewerId: userId } },
    });
    if (existing) return res.status(409).json({ error: "You already reviewed this booking" });

    const review = await prisma.review.create({
      data: { bookingId: booking.id, reviewerId: userId, revieweeId, score: body.score, text: body.text },
    });

    // Recompute the reviewee's provider rating average, if they're a provider.
    const revieweeProvider = await prisma.serviceProvider.findUnique({ where: { userId: revieweeId } });
    if (revieweeProvider) {
      const agg = await prisma.review.aggregate({
        where: { revieweeId },
        _avg: { score: true },
      });
      await prisma.serviceProvider.update({
        where: { id: revieweeProvider.id },
        data: { ratingAvg: agg._avg.score ?? undefined },
      });
    }

    res.status(201).json(review);
  })
);
