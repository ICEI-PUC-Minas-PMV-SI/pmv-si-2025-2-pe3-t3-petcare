// Interfaces do nosso projeto basedo no que esta no documento.

export type UUID = string;

export enum ReservationStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CHECKED_IN = "CHECKED_IN",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export type UserRole = 'admin' | 'guardian' | 'hotel';

export interface User {
  id: UUID;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  password: string;
  createdAt: string;
  updatedAt?: string | null;
}

export interface Pet {
  id: UUID;
  userId: UUID;
  name: string;
  species: string;
  age?: number | null;
  obs?: string | null;
  url: string;
  createdAt: string;
  updatedAt?: string | null;
}

export interface Hotel {
  id: UUID;
  userId: UUID;
  name: string;
  address?: string | null;
  capacity?: number | null;
  description: string;
  url: string;
  isVerified?: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface Reservation {
  id: UUID;
  petId: UUID;
  petName: string;
  userId: UUID;
  hotelId: UUID;
  hotelName: string;
  checkinDate: string; // YYYY-MM-DD
  checkoutDate: string; // YYYY-MM-DD
  status: ReservationStatus;
  hasUpdates: boolean;
  notes?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface StayUpdate {
  id: UUID;
  reservationId: UUID;
  authorName?: string | null;
  text?: string | null;
  videoUrl?: string | null;
  createdAt: string;
}

export interface Rating {
  id: UUID;
  reservationId: UUID;
  userId: UUID;
  hotelId: UUID;
  rating: number; // 1-5
  comment?: string | null;
  createdAt: string;
}

export interface VaccinationRecord {
  id: UUID;
  petId: UUID;
  vaccineName: string;
  dateAdministered: string; // YYYY-MM-DD
  nextDueDate?: string | null; // YYYY-MM-DD
  createdAt: string;
}
