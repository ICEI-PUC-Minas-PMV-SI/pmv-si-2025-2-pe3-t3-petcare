"use client";

import React from "react";
import { Header } from "@/components/header/page";
import styles from "./page.module.css";

import {
  UserRepo,
  PetRepo,
  HotelRepo,
  ReservationRepo,
  StayUpdateRepo,
  RatingRepo,
} from "utils/localstorage";

import { useRouter } from "next/navigation";
import { Hotel, Pet, Reservation } from "@/utils/models";
import { AdicionarReservaDialog } from "@/components/modais/AdicionarReserva";
import { AvaliarHotelDialog } from "@/components/modais/AvaliarHotel";
import { ReservationStatus } from "@/utils/models";
import { BadgeCheck } from "lucide-react";

export default function HomePage() {
  const [userId, setUserId] = React.useState<string | null>(null);
  const [reservas, setReservas] = React.useState<Reservation[]>([]);
  const [hotels, setHotels] = React.useState<Hotel[]>([]);
  const Router = useRouter();

  const carouselRef = React.useRef<HTMLDivElement | null>(null);

  function updateReservas(finalUserId: string) {
    if (finalUserId) {
      const my = ReservationRepo.list().filter((r) => r.userId === finalUserId);
      const allRatings = RatingRepo.list(); // Carrega todas as avaliações uma vez

      const enriched = my.map((r) => {
        const pet = PetRepo.get(r.petId);
        const hotel = HotelRepo.get(r.hotelId);
        const updates = StayUpdateRepo.list(r.id);
        const isRated = allRatings.some(rating => rating.reservationId === r.id); // Verifica se já foi avaliado

        return {
          ...r,
          petName: pet?.name ?? "—",
          petSpecies: pet?.species ?? "—",
          hotelName: hotel?.name ?? "—",
          hasUpdates: updates.length > 0,
          isRated: isRated, // Adiciona a flag
        };
      });
      setReservas(enriched);
    } else {
      setReservas([]);
    }
  }

  // inicialização
  React.useEffect(() => {
    const authRaw = localStorage.getItem("auth") ?? "{}";

    const authObj = JSON.parse(authRaw);
    const candidateId: string | undefined =
      authObj?.id || authObj?.userId || authObj?.uid || authObj?.user?.id;

    // se o auth não trouxe id, pega o primeiro user como fallback
    const finalUserId = candidateId ?? UserRepo.list()[0]?.id ?? null;
    setUserId(finalUserId);

    // carregar listas auxiliares
    setHotels(HotelRepo.list());
    updateReservas(finalUserId);
  }, []);

  return (
    <div className="page">
      <Header />

      <div className={styles.pageWrapper}>
        {/* Header */}
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.title}>
              Bem vindo!
            </h1>
            <p className={styles.subtitle}></p>
          </div>
        </div>

        {/* Carousel */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Suas reservas</h2>

          <div ref={carouselRef} className={styles.carousel}>
            {reservas.length === 0 ? (
              <div className={styles.carouselItem}>
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Nenhuma reserva</h3>
                  </div>
                  <div className="card-content">
                    <p>
                      Você não possui reservas no momento. Consulte hotéis para criar sua primeira reserva.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              reservas.map((r) => (
                <div key={r.id} className={styles.carouselItem}>
                  <div className="card">
                    <div className="card-header">
                      <div>
                        <h3 className="card-title">
                          Pet: <span>{r.petName}</span>
                        </h3>
                        <p className="card-description">
                          Hotel:
                          <span className="font-medium text-slate-700">
                            {r.hotelName}
                          </span>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="card-date">
                          {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>

                    <div className="card-content">
                      <div className="card-checkin-out">
                        <div>
                          <div className="card-checkin-out-label">Check-in</div>
                          <div className="card-checkin-out-value">{r.checkinDate}</div>
                        </div>
                        <div>
                          <div className="card-checkin-out-label">Check-out</div>
                          <div className="card-checkin-out-value">{r.checkoutDate}</div>
                        </div>
                      </div>

                      {r.notes ? (
                        <div className="card-notes">
                          <div className="card-notes-label">Observações</div>
                          <div className="card-notes-text">{r.notes}</div>
                        </div>
                      ) : (
                        <div className="card-notes-empty">
                          Sem observações.
                        </div>
                      )}
                    </div>

                    <div className="card-footer card-footer-between">
                      <div className="card-id">
                        ID: {r.id.slice(0, 6)}...
                      </div>
                      <div className="card-actions">
                        <button
                          className="card-button"
                          onClick={() =>
                            Router.push(`dashboard/reserva/${r.id}/view`)
                          }
                        >
                          Ver
                        </button>
                        {r.status === ReservationStatus.COMPLETED && (
                          r.isRated ? (
                            <button className="card-button" disabled>
                              Avaliado
                            </button>
                          ) : (
                            <AvaliarHotelDialog
                              reservation={r}
                              trigger={
                                <button className="card-button">
                                  Avaliar
                                </button>
                              }
                              onSubmitted={() => updateReservas(userId ?? "")}
                            />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Hotel List */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Hotéis disponíveis</h2>
          <div className={styles.grid}>
            {hotels.map((h) => (
              <div key={h.id} className="card">
                <div className="card-header">
                  <h3 className="card-title flex items-center gap-2">
                    {h.isVerified && (
                      <BadgeCheck className="text-blue-500" size={18} />
                    )}
                    {h.name}
                  </h3>
                </div>
                <div className="card-content">
                  <p className="card-description">
                    {h.address ?? "Endereço não informado"}
                  </p>
                  <div className="mt-2">
                    <div className="card-checkin-out-label">Capacidade</div>
                    <div className="card-checkin-out-value">{h.capacity}</div>
                  </div>
                </div>
                <div className="card-footer card-footer-end">
                  <AdicionarReservaDialog
                    hotelId={h.id}
                    userId={userId ?? ""}
                    onSaved={() => updateReservas(userId ?? "")}
                    triggerLabel="Fazer Reserva"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
