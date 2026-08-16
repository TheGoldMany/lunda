import { Router } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../lib/asyncHandler";
import { requireAuth } from "../middleware/auth";
import { paramId } from "../lib/params";

export const notificationsRouter = Router();

notificationsRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.auth!.userId },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
    res.json(notifications);
  })
);

notificationsRouter.patch(
  "/:id/read",
  requireAuth,
  asyncHandler(async (req, res) => {
    const notification = await prisma.notification.findUnique({ where: { id: paramId(req, "id") } });
    if (!notification || notification.userId !== req.auth!.userId) {
      return res.status(404).json({ error: "Notification not found" });
    }
    const updated = await prisma.notification.update({ where: { id: notification.id }, data: { read: true } });
    res.json(updated);
  })
);

notificationsRouter.patch(
  "/read-all",
  requireAuth,
  asyncHandler(async (req, res) => {
    await prisma.notification.updateMany({
      where: { userId: req.auth!.userId, read: false },
      data: { read: true },
    });
    res.json({ ok: true });
  })
);
