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
  Rating,
  VaccinationRecord,
} from "./models";

/* ==========================================
   Repositórios simples (CRUD via localStorage)
   ========================================== */

const usersKey = "petcare:users";
const petsKey = "petcare:pets";
const hotelsKey = "petcare:hotels";
const reservationsKey = "petcare:reservations";
const updatesKey = "petcare:updates";
const ratingsKey = "petcare:ratings";
const vaccinationRecordsKey = "petcare:vaccination-records";

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
  create(
    data: Omit<
      Reservation,
      "id" | "createdAt" | "updatedAt" | "rejectionReason" | "status"
    > & {
      status?: ReservationStatus;
    }
  ): { success: boolean; reservation?: Reservation; message?: string } {
    const allReservations = this.list();
    const newStart = new Date(data.checkinDate);
    const newEnd = new Date(data.checkoutDate);

    // 1. Verificar se o pet já tem uma reserva no mesmo período
    const petReservations = allReservations.filter(
      (r) =>
        r.petId === data.petId &&
        [
          ReservationStatus.PENDING,
          ReservationStatus.APPROVED,
          ReservationStatus.CHECKED_IN,
        ].includes(r.status)
    );

    const hasPetConflict = petReservations.some((r) => {
      const existingStart = new Date(r.checkinDate);
      const existingEnd = new Date(r.checkoutDate);
      // Checa sobreposição: (StartA <= EndB) and (EndA >= StartB)
      return newStart <= existingEnd && newEnd >= existingStart;
    });

    if (hasPetConflict) {
      return {
        success: false,
        message: "Este pet já possui uma reserva para o período selecionado.",
      };
    }

    // 2. Verificar se o hotel tem capacidade
    const hotel = HotelRepo.get(data.hotelId);
    if (!hotel) {
      return { success: false, message: "Hotel não encontrado." };
    }

    const hotelReservations = allReservations.filter(
      (r) =>
        r.hotelId === data.hotelId &&
        [
          ReservationStatus.APPROVED,
          ReservationStatus.CHECKED_IN,
        ].includes(r.status)
    );

    // Conta as vagas ocupadas para cada dia no período da nova reserva
    for (let d = newStart; d <= newEnd; d.setDate(d.getDate() + 1)) {
      const occupiedSlots = hotelReservations.filter((r) => {
        const existingStart = new Date(r.checkinDate);
        const existingEnd = new Date(r.checkoutDate);
        return d >= existingStart && d <= existingEnd;
      }).length;

      if (occupiedSlots >= hotel.capacity) {
        return {
          success: false,
          message: `O hotel não tem vagas disponíveis para o dia ${d.toLocaleDateString("pt-BR")}.`,
        };
      }
    }

    // Se passou em todas as validações, cria a reserva
    const reservation: Reservation = {
      ...data,
      id: uuid(),
      status: data.status ?? ReservationStatus.PENDING,
      rejectionReason: null,
      updatedAt: null,
      createdAt: nowISO(),
    };

    allReservations.push(reservation);
    saveJSON(reservationsKey, allReservations);
    return { success: true, reservation };
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
  create(
    data: Omit<StayUpdate, "id" | "createdAt"> & { createdAt?: string }
  ): StayUpdate {
    const updates = this.list();
    const update: StayUpdate = {
      ...data,
      id: uuid(),
      createdAt: data.createdAt ?? nowISO(),
    };
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

/* ---------------------
   Rating Repository
   --------------------- */
export const RatingRepo = {
  list(hotelId?: UUID): Rating[] {
    const ratings = parseJSON<Rating>(ratingsKey);
    return hotelId ? ratings.filter((r) => r.hotelId === hotelId) : ratings;
  },
  get(id: UUID): Rating | undefined {
    return this.list().find((r) => r.id === id);
  },
  create(
    data: Omit<Rating, "id" | "createdAt"> & { createdAt?: string }
  ): Rating {
    const ratings = this.list();

    const rating: Rating = {
      ...data,
      id: uuid(),
      createdAt: data.createdAt ?? nowISO(),
    };

    ratings.push(rating);
    saveJSON(ratingsKey, ratings);
    return rating;
  },
  remove(id: UUID): boolean {
    const ratings = this.list();
    const next = ratings.filter((r) => r.id !== id);
    if (next.length === ratings.length) return false;
    saveJSON(ratingsKey, next);
    return true;
  },
};

/* ---------------------
   VaccinationRecord Repository
   --------------------- */
export const VaccinationRecordRepo = {
  list(petId?: UUID): VaccinationRecord[] {
    const records = parseJSON<VaccinationRecord>(vaccinationRecordsKey);
    return petId ? records.filter((r) => r.petId === petId) : records;
  },
  create(
    data: Omit<VaccinationRecord, "id" | "createdAt"> & { createdAt?: string }
  ): VaccinationRecord {
    const records = this.list();

    const record: VaccinationRecord = {
      ...data,
      id: uuid(),
      createdAt: data.createdAt ?? nowISO(),
    };

    records.push(record);
    saveJSON(vaccinationRecordsKey, records);
    return record;
  },
  remove(id: UUID): boolean {
    const records = this.list();
    const next = records.filter((r) => r.id !== id);
    if (next.length === records.length) return false;
    saveJSON(vaccinationRecordsKey, next);
    return true;
  },
};

/* ==========================================
   Função opcional de inicialização de dados
   ========================================== */
export function seedDemoData(): void {
  localStorage.clear();

  // --- 1. USERS ---

  // Hotel Users
  const hotelUser1 = UserRepo.create({
    name: "Hotel PetCare BH",
    email: "hotel1@e.com",
    phone: "31999990000",
    role: "hotel",
    password: "123",
  });

  const hotelUser2 = UserRepo.create({
    name: "Pousada Amigo Fiel",
    email: "hotel2@e.com",
    phone: "31988881111",
    role: "hotel",
    password: "123",
  });

  // Persona Users (Guardians)
  const ana = UserRepo.create({
    name: "Ana Martins",
    email: "ana@e.com",
    phone: "31987654321",
    role: "guardian",
    password: "123",
  });

  const joao = UserRepo.create({
    name: "João Silva",
    email: "joao@e.com",
    phone: "31998765432",
    role: "guardian",
    password: "123",
  });

  const carlos = UserRepo.create({
    name: "Carlos Menezes",
    email: "carlos@e.com",
    phone: "31912345678",
    role: "guardian",
    password: "123",
  });

  const clara = UserRepo.create({
    name: "Clara Rezende",
    email: "clara@e.com",
    phone: "31923456789",
    role: "guardian",
    password: "123",
  });

  const patricia = UserRepo.create({
    name: "Patrícia Oliveira",
    email: "patricia@e.com",
    phone: "31934567890",
    role: "guardian",
    password: "123",
  });

  const geraldo = UserRepo.create({
    name: "Geraldo Fontes",
    email: "geraldo@e.com",
    phone: "31945678901",
    role: "guardian",
    password: "123",
  });

  // --- 2. HOTELS ---
  const hotel1 = HotelRepo.create({
    userId: hotelUser1.id,
    name: "Hotel PetCare BH",
    address: "Av. Central, 100 - Belo Horizonte",
    capacity: 10,
    description: "O melhor cuidado para seu pet na capital mineira.",
    url: "https://images.unsplash.com/photo-1598133894008-61f7fdb8a8c3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    isVerified: true,
  });

  const hotel2 = HotelRepo.create({
    userId: hotelUser2.id,
    name: "Pousada Amigo Fiel",
    address: "Rua das Flores, 50 - Ouro Preto",
    capacity: 5,
    description: "Ambiente tranquilo e acolhedor para seu melhor amigo.",
    url: "https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=1924&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    isVerified: false,
  });

  // --- 3. PETS ---
  const max = PetRepo.create({
    userId: ana.id,
    name: "Max",
    species: "Cachorro",
    age: 3,
    obs: "Muito dócil, adora brincar com bolinhas.",
    url: "https://images.unsplash.com/photo-1543466835-00a7907e9dde?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  });

  const luna = PetRepo.create({
    userId: joao.id,
    name: "Luna",
    species: "Gato",
    age: 2,
    obs: "Calma, gosta de carinho e dormir no sol.",
    url: "https://images.unsplash.com/photo-1574144611937-097e1c9b2023?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  });

  const toby = PetRepo.create({
    userId: carlos.id,
    name: "Toby",
    species: "Cachorro",
    age: 5,
    obs: "Energético, precisa de passeios longos.",
    url: "https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=1924&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  });

  const bidu = PetRepo.create({
    userId: geraldo.id,
    name: "Bidu",
    species: "Beagle",
    age: 7,
    obs: "Companheiro e um pouco teimoso.",
    url: "https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=1924&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  });

  // --- 4. RESERVATIONS ---
  const res1 = ReservationRepo.create({
    petId: max.id,
    userId: ana.id,
    hotelId: hotel1.id,
    hotelName: hotel1.name,
    petName: max.name,
    checkinDate: "2025-12-01",
    checkoutDate: "2025-12-05",
    hasUpdates: false,
    status: ReservationStatus.CHECKED_IN,
    notes: "Max precisa de medicação às 8h e 20h.",
  });

  const res2 = ReservationRepo.create({
    petId: luna.id,
    userId: joao.id,
    hotelId: hotel2.id,
    hotelName: hotel2.name,
    petName: luna.name,
    checkinDate: "2025-11-15",
    checkoutDate: "2025-11-20",
    notes: "Luna é um pouco tímida no início.",
    hasUpdates: false,
    status: ReservationStatus.COMPLETED,
  });

  const res3 = ReservationRepo.create({
    petId: toby.id,
    userId: carlos.id,
    hotelId: hotel1.id,
    hotelName: hotel1.name,
    petName: toby.name,
    checkinDate: "2026-01-10",
    checkoutDate: "2026-01-15",
    notes: "Toby adora passear no parque.",
    hasUpdates: false,
    status: ReservationStatus.PENDING,
  });

  // --- 5. STAY UPDATES ---
  StayUpdateRepo.create({
    reservationId: res1.id,
    authorName: hotelUser1.name,
    text: "Max se adaptou super bem! Já fez novos amigos.",
    videoUrl: '',
    createdAt: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
  });
  StayUpdateRepo.create({
    reservationId: res1.id,
    authorName: hotelUser1.name,
    text: "Hora do passeio! Max está muito animado.",
    videoUrl: "https://assets.mixkit.co/videos/1494/1494-720.mp4",
    createdAt: new Date().toISOString(),
  });

  // --- 6. RATINGS ---
  RatingRepo.create({
    reservationId: res2.id,
    userId: joao.id,
    hotelId: hotel2.id,
    rating: 5,
    comment: "Pousada maravilhosa! Cuidaram muito bem da Luna.",
    createdAt: new Date().toISOString(),
  });

  // --- 7. VACCINATION RECORDS ---
  VaccinationRecordRepo.create({
    petId: max.id,
    vaccineName: "V10",
    dateAdministered: "2025-05-10",
    nextDueDate: "2026-05-10",
    createdAt: new Date().toISOString(),
  });
  VaccinationRecordRepo.create({
    petId: max.id,
    vaccineName: "Raiva",
    dateAdministered: "2025-06-20",
    nextDueDate: "2026-06-20",
    createdAt: new Date().toISOString(),
  });
  VaccinationRecordRepo.create({
    petId: luna.id,
    vaccineName: "V5 Felina",
    dateAdministered: "2025-03-01",
    nextDueDate: "2026-03-01",
    createdAt: new Date().toISOString(),
  });
}
