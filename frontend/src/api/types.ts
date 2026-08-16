export type Role = "CUSTOMER" | "PROVIDER" | "ADMIN";
export type Trade = "WATER" | "GAS" | "ELECTRICITY";
export type VerificationStatus = "PENDING" | "APPROVED" | "REJECTED";
export type JobRequestStatus = "OPEN" | "BOOKED" | "CANCELLED";
export type BookingStatus = "BOOKED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type Urgency = "URGENT" | "PLANNED";
export type QuoteStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED";
export type PaymentStatus = "PENDING" | "PAID";

export interface AuthUser {
  id: string;
  name: string;
  phone: string;
  role: Role;
  city: string;
}

export interface JobRequest {
  id: string;
  customerId: string;
  trade: Trade;
  description: string;
  photoUrl: string | null;
  address: string;
  latitude: number;
  longitude: number;
  urgency: Urgency;
  preferredStartAt: string | null;
  preferredEndAt: string | null;
  status: JobRequestStatus;
  createdAt: string;
  booking?: Booking | null;
  customer?: { name: string; phone: string };
}

export interface RankedProvider {
  id: string;
  providerName: string;
  trades: Trade[];
  ratingAvg: number | null;
  calloutFee: string;
  hourlyRate: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  estimatedArrivalMinutes: number;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: string;
  commissionAmount: string;
  method: "CARD_MOCK";
  status: PaymentStatus;
  createdAt: string;
  paidAt: string | null;
}

export interface Booking {
  id: string;
  jobRequestId: string;
  providerId: string;
  status: BookingStatus;
  scheduledAt: string | null;
  finalPrice: string | null;
  createdAt: string;
  completedAt: string | null;
  jobRequest?: JobRequest;
  provider?: { user: { name: string; phone: string } };
  payment?: Payment | null;
}

export interface ServiceProviderProfile {
  id: string;
  userId: string;
  trades: Trade[];
  calloutFee: string;
  hourlyRate: string;
  licenseDocumentUrl: string | null;
  verificationStatus: VerificationStatus;
  isAvailable: boolean;
  latitude: number;
  longitude: number;
  ratingAvg: number | null;
  createdAt: string;
  user?: { name: string; phone: string; city: string };
}

export interface IncomingJobRequest extends JobRequest {
  customer: { name: string; phone: string };
  distanceKm: number;
  estimatedArrivalMinutes: number;
}

export interface PlannedJobRequest extends JobRequest {
  customer: { name: string; phone: string };
  alreadyQuoted: boolean;
}

export interface Quote {
  id: string;
  jobRequestId: string;
  providerId: string;
  price: string;
  estimatedDurationMinutes: number;
  message: string | null;
  proposedStartAt: string | null;
  validUntil: string;
  status: QuoteStatus;
  createdAt: string;
  provider?: ServiceProviderProfile;
}

export interface Message {
  id: string;
  bookingId: string;
  senderId: string;
  text: string;
  createdAt: string;
  sender: { name: string; role: Role };
}
