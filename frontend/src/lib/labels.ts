import type { BookingStatus, JobRequestStatus, Trade, VerificationStatus } from "../api/types";

export const TRADE_LABELS: Record<Trade, string> = {
  WATER: "Vízszerelés",
  GAS: "Gázszerelés",
  ELECTRICITY: "Villanyszerelés",
};

export const JOB_STATUS_LABELS: Record<JobRequestStatus, string> = {
  OPEN: "Keresünk szakembert",
  BOOKED: "Lefoglalva",
  CANCELLED: "Lemondva",
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  BOOKED: "Foglalva",
  IN_PROGRESS: "Folyamatban",
  COMPLETED: "Lezárva",
  CANCELLED: "Lemondva",
};

export const VERIFICATION_LABELS: Record<VerificationStatus, string> = {
  PENDING: "Elbírálás alatt",
  APPROVED: "Jóváhagyva",
  REJECTED: "Elutasítva",
};
