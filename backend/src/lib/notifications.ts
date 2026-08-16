import { prisma } from "./prisma";
import { NotificationType } from "../generated/prisma/client";

export async function notify(params: {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  jobRequestId?: string;
  bookingId?: string;
}) {
  await prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      jobRequestId: params.jobRequestId,
      bookingId: params.bookingId,
    },
  });
}
