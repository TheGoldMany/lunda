import { Router } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../lib/asyncHandler";
import { requireAuth, requireRole } from "../middleware/auth";
import { PaymentStatus, Role } from "../generated/prisma/client";
import { paramId } from "../lib/params";
import { notify } from "../lib/notifications";

export const paymentsRouter = Router();

// Mocked payment: no real gateway (Barion/Stripe) is wired up in this build.
// The customer "pays" and the payment immediately flips to PAID.
paymentsRouter.post(
  "/:id/pay",
  requireAuth,
  requireRole(Role.CUSTOMER),
  asyncHandler(async (req, res) => {
    const payment = await prisma.payment.findUnique({
      where: { id: paramId(req, "id") },
      include: { booking: { include: { jobRequest: true, provider: true } } },
    });
    if (!payment || payment.booking.jobRequest.customerId !== req.auth!.userId) {
      return res.status(404).json({ error: "Payment not found" });
    }
    if (payment.status === PaymentStatus.PAID) {
      return res.status(409).json({ error: "Already paid" });
    }

    const updated = await prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.PAID, paidAt: new Date() },
    });

    await notify({
      userId: payment.booking.provider.userId,
      type: "PAYMENT_RECEIVED",
      title: "Megérkezett a fizetés",
      body: `${payment.amount} Ft`,
      bookingId: payment.bookingId,
    });

    res.json(updated);
  })
);
