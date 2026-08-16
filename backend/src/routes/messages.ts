import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../lib/asyncHandler";
import { requireAuth } from "../middleware/auth";
import { Role } from "../generated/prisma/client";
import { paramId } from "../lib/params";

export const messagesRouter = Router();

async function assertParticipant(bookingId: string, userId: string, role: Role) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { jobRequest: true, provider: true },
  });
  if (!booking) return null;
  const isCustomer = role !== Role.PROVIDER && booking.jobRequest.customerId === userId;
  const isProvider = role !== Role.CUSTOMER && booking.provider.userId === userId;
  if (!isCustomer && !isProvider) return null;
  return booking;
}

messagesRouter.get(
  "/:bookingId/messages",
  requireAuth,
  asyncHandler(async (req, res) => {
    const bookingId = paramId(req, "bookingId");
    const booking = await assertParticipant(bookingId, req.auth!.userId, req.auth!.role);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    const messages = await prisma.message.findMany({
      where: { bookingId },
      include: { sender: { select: { name: true, role: true } } },
      orderBy: { createdAt: "asc" },
    });
    res.json(messages);
  })
);

const createSchema = z.object({ text: z.string().min(1).max(2000) });

messagesRouter.post(
  "/:bookingId/messages",
  requireAuth,
  asyncHandler(async (req, res) => {
    const bookingId = paramId(req, "bookingId");
    const booking = await assertParticipant(bookingId, req.auth!.userId, req.auth!.role);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    const body = createSchema.parse(req.body);
    const message = await prisma.message.create({
      data: { bookingId, senderId: req.auth!.userId, text: body.text },
      include: { sender: { select: { name: true, role: true } } },
    });
    res.status(201).json(message);
  })
);
