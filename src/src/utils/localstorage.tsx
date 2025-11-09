// Esse arquivo é uma abstração para usarmos localStorage de uma maneira simplificada em nosso projeto

import { saveJSON, parseJSON, nowISO, uuid } from "@/lib/utils";
import {
  User,
  UUID,
  Hotel,
  Reservation,
  Pet,
  StayUpdate,
  ReservationStatus,
} from "./models";

/* ==========================================
   Repositórios simples (CRUD via localStorage)
   ========================================== */

const usersKey = "petcare:users";
const petsKey = "petcare:pets";
const hotelsKey = "petcare:hotels";
const reservationsKey = "petcare:reservations";
const updatesKey = "petcare:updates";

/* ---------------------
   User Repository
   --------------------- */
export const UserRepo = {
  list(): User[] {
    return parseJSON<User>(usersKey);
  },
  get(id: UUID): User | undefined {
    return this.list().find((t) => t.id === id);
  },
  create(data: Omit<User, "id" | "createdAt">): User {
    const users = this.list();
    const user: User = { ...data, id: uuid(), createdAt: nowISO() };
    users.push(user);
    saveJSON(usersKey, users);
    return user;
  },
  update(id: UUID, patch: Partial<User>): User | undefined {
    const users = this.list();
    const index = users.findIndex((t) => t.id === id);
    if (index === -1) return undefined;
    users[index] = { ...users[index], ...patch, updatedAt: nowISO() };
    saveJSON(usersKey, users);
    return users[index];
  },
  remove(id: UUID): boolean {
    const users = this.list();
    const next = users.filter((t) => t.id !== id);
    if (next.length === users.length) return false;
    saveJSON(usersKey, next);
    return true;
  },
};

/* ---------------------
   Pet Repository
   --------------------- */
export const PetRepo = {
  list(userId?: UUID): Pet[] {
    const pets = parseJSON<Pet>(petsKey);
    return userId ? pets.filter((p) => p.userId === userId) : pets;
  },
  get(id: UUID): Pet | undefined {
    return this.list().find((p) => p.id === id);
  },
  create(data: Omit<Pet, "id" | "createdAt">): Pet {
    const pets = this.list();
    const pet: Pet = { ...data, id: uuid(), createdAt: nowISO() };
    pets.push(pet);
    saveJSON(petsKey, pets);
    return pet;
  },
  update(id: UUID, patch: Partial<Pet>): Pet | undefined {
    const pets = this.list();
    const index = pets.findIndex((p) => p.id === id);
    if (index === -1) return undefined;
    pets[index] = { ...pets[index], ...patch, updatedAt: nowISO() };
    saveJSON(petsKey, pets);
    return pets[index];
  },
  remove(id: UUID): boolean {
    const pets = this.list();
    const next = pets.filter((p) => p.id !== id);
    if (next.length === pets.length) return false;
    saveJSON(petsKey, next);
    return true;
  },
};

/* ---------------------
   Hotel Repository
   --------------------- */
export const HotelRepo = {
  list(): Hotel[] {
    return parseJSON<Hotel>(hotelsKey);
  },
  get(id: UUID): Hotel | undefined {
    return this.list().find((h) => h.id === id);
  },
  create(data: Omit<Hotel, "id" | "createdAt">): Hotel {
    const hotels = this.list();
    const hotel: Hotel = { ...data, id: uuid(), createdAt: nowISO() };
    hotels.push(hotel);
    saveJSON(hotelsKey, hotels);
    return hotel;
  },
  update(id: UUID, patch: Partial<Hotel>): Hotel | undefined {
    const hotels = this.list();
    const index = hotels.findIndex((h) => h.id === id);
    if (index === -1) return undefined;
    hotels[index] = { ...hotels[index], ...patch, updatedAt: nowISO() };
    saveJSON(hotelsKey, hotels);
    return hotels[index];
  },
  remove(id: UUID): boolean {
    const hotels = this.list();
    const next = hotels.filter((h) => h.id !== id);
    if (next.length === hotels.length) return false;
    saveJSON(hotelsKey, next);
    return true;
  },
};

/* ---------------------
   Reservation Repository
   --------------------- */
export const ReservationRepo = {
  list(): Reservation[] {
    return parseJSON<Reservation>(reservationsKey);
  },
  get(id: UUID): Reservation | undefined {
    return this.list().find((r) => r.id === id);
  },
  create(data: Omit<Reservation, "id" | "createdAt" | "status">): Reservation {
    const reservations = this.list();
    const reservation: Reservation = {
      ...data,
      id: uuid(),
      status: ReservationStatus.PENDING,
      createdAt: nowISO(),
    };
    reservations.push(reservation);
    saveJSON(reservationsKey, reservations);
    return reservation;
  },
  update(id: UUID, patch: Partial<Reservation>): Reservation | undefined {
    const reservations = this.list();
    const index = reservations.findIndex((r) => r.id === id);
    if (index === -1) return undefined;
    reservations[index] = {
      ...reservations[index],
      ...patch,
      updatedAt: nowISO(),
    };
    saveJSON(reservationsKey, reservations);
    return reservations[index];
  },
  changeStatus(
    id: UUID,
    status: ReservationStatus,
    reason?: string,
  ): Reservation | undefined {
    const reservations = this.list();
    const index = reservations.findIndex((r) => r.id === id);
    if (index === -1) return undefined;
    reservations[index].status = status;
    if (reason) reservations[index].rejectionReason = reason;
    reservations[index].updatedAt = nowISO();
    saveJSON(reservationsKey, reservations);
    return reservations[index];
  },
  remove(id: UUID): boolean {
    const reservations = this.list();
    const next = reservations.filter((r) => r.id !== id);
    if (next.length === reservations.length) return false;
    saveJSON(reservationsKey, next);
    return true;
  },
};

/* ---------------------
   StayUpdate Repository
   --------------------- */
export const StayUpdateRepo = {
  list(reservationId?: UUID): StayUpdate[] {
    const updates = parseJSON<StayUpdate>(updatesKey);
    return reservationId
      ? updates.filter((u) => u.reservationId === reservationId)
      : updates;
  },
  create(data: Omit<StayUpdate, "id" | "createdAt">): StayUpdate {
    const updates = this.list();
    const update: StayUpdate = { ...data, id: uuid(), createdAt: nowISO() };
    updates.push(update);
    saveJSON(updatesKey, updates);
    return update;
  },
  remove(id: UUID): boolean {
    const updates = this.list();
    const next = updates.filter((u) => u.id !== id);
    if (next.length === updates.length) return false;
    saveJSON(updatesKey, next);
    return true;
  },
};

/* ==========================================
   Função opcional de inicialização de dados
   ========================================== */
export function seedDemoData(): void {
  localStorage.clear();

  const userHotel = UserRepo.create({
    name: "Ana Martins",
    email: "hotel@e.com",
    phone: "31999990000",
    role: "hotel",
    password: "123456",
  });

  const userTutor = UserRepo.create({
    name: "Marcio",
    email: "tutor@e.com",
    phone: "31999990000",
    role: "guardian",
    password: "123456",
  });

  const pet = PetRepo.create({
    userId: userTutor.id,
    name: "Max",
    species: "Cachorro",
    age: 3,
    obs: "Muito dócil",
    url: "",
  });

  PetRepo.create({
    userId: userTutor.id,
    name: "Rogério",
    species: "Gato",
    age: 3,
    obs: "Muito dócil",
    url: "",
  });

  const hotel = HotelRepo.create({
    name: "Hotel PetCare BH",
    address: "Av. Central, 100 - Belo Horizonte",
    capacity: 5,
    description: "",
    url: "",
  });

  ReservationRepo.create({
    petId: pet.id,
    userId: userTutor.id,
    hotelId: hotel.id,
    checkinDate: "2025-11-10",
    checkoutDate: "2025-11-12",
    notes: "Reserva de demonstração",
  });
}
