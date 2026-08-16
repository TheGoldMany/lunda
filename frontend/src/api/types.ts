export type Role = "CUSTOMER" | "PROVIDER" | "ADMIN";
export type Trade = "WATER" | "GAS" | "ELECTRICITY";
export type VerificationStatus = "PENDING" | "APPROVED" | "REJECTED";
export type JobRequestStatus = "OPEN" | "BOOKED" | "CANCELLED";
export type BookingStatus = "BOOKED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

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
  urgency: "URGENT" | "PLANNED";
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
  distanceKm: number;
  estimatedArrivalMinutes: number;
}

export interface Booking {
  id: string;
  jobRequestId: string;
  providerId: string;
  status: BookingStatus;
  finalPrice: string | null;
  createdAt: string;
  completedAt: string | null;
  jobRequest?: JobRequest;
  provider?: { user: { name: string; phone: string } };
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
