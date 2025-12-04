"use client";

import React from "react";
import {
  ReservationRepo,
  PetRepo,
  HotelRepo,
  UserRepo,
} from "utils/localstorage";
import { Hotel, Reservation, ReservationStatus, User } from "utils/models";
import { useRouter } from "next/navigation";
import { AdicionarReservaDialog } from "@/components/modais/AdicionarReserva";
import { ConfirmationModal } from "@/components/modais/ConfirmationModal";
import styles from "./page.module.css";

/** Mapeamento de status para rótulos e classes de badge */
const STATUS_META: Record<ReservationStatus, { label: string; badge: string }> =
{
  PENDING: { label: "Pendente", badge: "bg-yellow-100 text-yellow-800" },
  APPROVED: { label: "Aprovada", badge: "bg-green-100 text-green-800" },
  REJECTED: { label: "Rejeitada", badge: "bg-red-100 text-red-800" },
  CHECKED_IN: { label: "Hospedado", badge: "bg-indigo-100 text-indigo-800" },
  COMPLETED: { label: "Concluída", badge: "bg-slate-100 text-slate-800" },
  CANCELLED: { label: "Cancelada", badge: "bg-rose-100 text-rose-800" },
};

type ReservationView = Reservation & {
  petName?: string;
  petSpecies?: string;
  userName?: string;
};

export default function Dashboard() {
  const [reservas, setReservas] = React.useState<ReservationView[]>([]);
  const [hotel, setHotel] = React.useState<Hotel | null>(null);
  const [query, setQuery] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState<
    ReservationStatus | "ALL"
  >("ALL");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [reservationToFinalize, setReservationToFinalize] = React.useState<string | null>(null);
  const Router = useRouter();

  const enrichReservationsFor = React.useCallback(
    (hotelId: string): ReservationView[] => {
      const allReservas = ReservationRepo.list().filter(
        (r) => r.hotelId === hotelId,
      );
      return allReservas.map((reserva) => {
        const pet = PetRepo.get(reserva.petId);
        const user = UserRepo.get(reserva.userId);
        return {
          ...reserva,
          petName: pet?.name ?? "—",
          petSpecies: pet?.species ?? "—",
          userName: user?.name ?? "—",
        };
      });
    },
    [],
  );

  const updateData = React.useCallback(() => {
    const authRaw = localStorage.getItem("auth") ?? "{}";
    const currentUser: User | null = JSON.parse(authRaw);

    if (!currentUser || currentUser.role !== "hotel") {
      setHotel(null);
      setReservas([]);
      return;
    }

    const hotelSelecionado = HotelRepo.list().find(
      (h) => h.userId === currentUser.id,
    );
    setHotel(hotelSelecionado ?? null);

    if (!hotelSelecionado) {
      setReservas([]);
      return;
    }

    const fullData = enrichReservationsFor(hotelSelecionado.id);
    setReservas(fullData);
  }, [enrichReservationsFor]);

  React.useEffect(() => {
    updateData();
  }, []);

  function handleFinalizeClick(reservationId: string) {
    setReservationToFinalize(reservationId);
    setIsModalOpen(true);
  }

  function confirmFinalize() {
    if (reservationToFinalize) {
      ReservationRepo.changeStatus(reservationToFinalize, ReservationStatus.COMPLETED);
      updateData();
    }
    setReservationToFinalize(null);
    setIsModalOpen(false);
  }

  // filtros simples (busca por pet/user e filtro por status)
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return reservas
      .filter((r) =>
        filterStatus === "ALL" ? true : r.status === filterStatus,
      )
      .filter((r) => {
        if (!q) return true;
        const fields = [
          r.petName,
          r.userName,
          r.notes,
          r.checkinDate,
          r.checkoutDate,
        ]
          .join(" ")
          .toLowerCase();
        return fields.includes(q);
      })
      .sort((a, b) => (a.checkinDate < b.checkinDate ? -1 : 1));
  }, [reservas, query, filterStatus]);

  const totals = React.useMemo(() => {
    return {
      total: reservas.length,
      pending: reservas.filter((r) => r.status === ReservationStatus.PENDING)
        .length,
      checkedIn: reservas.filter(
        (r) => r.status === ReservationStatus.CHECKED_IN,
      ).length,
    };
  }, [reservas]);

  return (
    <div className={styles.container}>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmFinalize}
        title="Finalizar Reserva"
        message="Tem certeza que deseja marcar esta reserva como concluída?"
      />
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <div>
            <h1 className={styles.headerTitle}>
              Reservas do seu hotel
            </h1>
            <p className={styles.headerSubtitle}>
              {hotel ? (
                <>
                  <span className={styles.hotelName}>{hotel.name}</span>
                  <span className={styles.hotelAddress}>•</span>
                  <span className={styles.hotelAddress}>
                    {hotel.address ?? "Endereço não informado"}
                  </span>
                </>
              ) : (
                "Carregando informações do hotel..."
              )}
            </p>
          </div>
        </div>

        <div className={styles.headerActions}>
          <div className={styles.statsContainer}>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>Total</div>
              <div className={styles.statValue}>{totals.total}</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>Pendentes</div>
              <div className={`${styles.statValue} ${styles.statValuePending}`}>
                {totals.pending}
              </div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>Hospedados</div>
              <div className={`${styles.statValue} ${styles.statValueCheckedIn}`}>
                {totals.checkedIn}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls: search + filter */}
      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <input
            aria-label="Buscar reservas"
            placeholder="Buscar por pet, usuário, notas ou data..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterContainer}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as "ALL")}
            className={styles.filterSelect}
          >
            <option value="ALL">Todos os status</option>
            {Object.keys(STATUS_META).map((k) => (
              <option key={k} value={k}>
                {STATUS_META[k as ReservationStatus].label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setFilterStatus("ALL");
            }}
            className={styles.clearButton}
          >
            Limpar
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <h3 className={styles.emptyStateTitle}>
            Nenhuma reserva encontrada
          </h3>
          <p className={styles.emptyStateText}>
            Tente alterar os filtros ou clique em “Adicionar Reserva” para criar
            a primeira.
          </p>
          <div className={styles.emptyStateAction}>
            <AdicionarReservaDialog
              hotelId={hotel?.id ?? ""}
              userId=""
              onSaved={updateData}
            />
          </div>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((r) => {
            const meta = STATUS_META[r.status];
            return (
              <div key={r.id} className="card">
                <div className="card-header">
                  <div>
                    <h3 className="card-title">
                      {r.petName}{" "}
                      <span className="species">
                        ({r.petSpecies})
                      </span>
                    </h3>
                    <p className="card-description">
                      Tutor:
                      <span className="tutor-name">
                        {r.userName}
                      </span>
                    </p>
                  </div>

                  <div className="card-status-container">
                    <span className={`card-status-badge ${meta.badge}`}>
                      {meta.label}
                    </span>
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
                    {r.status === ReservationStatus.CHECKED_IN && (
                      <button
                        className="card-button"
                        onClick={() => handleFinalizeClick(r.id)}
                      >
                        Finalizar
                      </button>
                    )}
                    <button
                      className="card-button"
                      onClick={() =>
                        Router.push(`dashboard/reserva/${r.id}/edit`)
                      }
                    >
                      Ver
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
