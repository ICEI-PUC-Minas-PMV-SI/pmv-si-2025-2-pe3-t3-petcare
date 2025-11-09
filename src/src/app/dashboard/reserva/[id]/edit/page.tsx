"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ReservationRepo,
  PetRepo,
  UserRepo,
  HotelRepo,
} from "utils/localstorage";
import { Reservation, ReservationStatus } from "utils/models";

const STATUS_META: Record<ReservationStatus, { label: string; badge: string }> =
  {
    PENDING: { label: "Pendente", badge: "bg-yellow-100 text-yellow-800" },
    APPROVED: { label: "Aprovada", badge: "bg-green-100 text-green-800" },
    REJECTED: { label: "Rejeitada", badge: "bg-red-100 text-red-800" },
    CHECKED_IN: { label: "Hospedado", badge: "bg-indigo-100 text-indigo-800" },
    COMPLETED: { label: "Concluída", badge: "bg-slate-100 text-slate-800" },
    CANCELLED: { label: "Cancelada", badge: "bg-rose-100 text-rose-800" },
  };

export default function ReservaPageClient() {
  const params = useParams() as { id?: string };
  const router = useRouter();
  const id = params?.id;

  const [loading, setLoading] = React.useState(true);
  const [reservation, setReservation] = React.useState<Reservation | null>(
    null,
  );
  const [petName, setPetName] = React.useState<string>("—");
  const [tutorName, setTutorName] = React.useState<string>("—");
  const [hotelName, setHotelName] = React.useState<string>("—");
  const [error, setError] = React.useState<string | null>(null);
  const [changing, setChanging] = React.useState(false);

  React.useEffect(() => {
    if (!id) {
      setError("ID da reserva não informado na rota.");
      setLoading(false);
      return;
    }

    try {
      const found = ReservationRepo.get(id);
      if (!found) {
        setError("Reserva não encontrada.");
        setLoading(false);
        return;
      }
      setReservation(found);

      const pet = PetRepo.get(found.petId);
      const tutor = UserRepo.get(found.userId);
      const hotel = HotelRepo.get(found.hotelId);
      setPetName(pet?.name ?? "—");
      setTutorName(tutor?.name ?? "—");
      setHotelName(hotel?.name ?? "—");
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar a reserva.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  function handleDelete() {
    if (!reservation) return;
    const ok = confirm(
      "Deseja remover esta reserva? Esta ação não pode ser desfeita.",
    );
    if (!ok) return;
    const removed = ReservationRepo.remove(reservation.id);
    if (removed) {
      // navegar de volta para a lista
      router.push("/dashboard");
    } else {
      alert("Não foi possível remover a reserva.");
    }
  }

  function handleChangeStatus(nextStatus: ReservationStatus) {
    if (!reservation) return;
    setChanging(true);
    try {
      ReservationRepo.changeStatus(reservation.id, nextStatus);
      const updated = ReservationRepo.get(reservation.id);
      setReservation(updated ?? null);
    } catch (err) {
      console.error(err);
      alert("Erro ao alterar status.");
    } finally {
      setChanging(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-sm text-slate-500">Carregando reserva...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="mb-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="px-3 py-1 rounded border text-sm hover:bg-slate-50"
          >
            ← Voltar
          </button>
        </div>
        <div className="rounded-lg border p-6 bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Erro</h2>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!reservation) return;
  // reservation existe
  const meta = STATUS_META[reservation.status];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Reserva</h1>
          <p className="text-sm text-slate-500">
            Visualizando reserva{" "}
            <span className="font-mono text-xs">{reservation.id}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/dashboard")}
            className="px-3 py-2 rounded-md border text-sm hover:bg-slate-50"
          >
            Voltar
          </button>
          <button
            onClick={handleDelete}
            className="px-3 py-2 rounded-md border text-sm text-rose-600 hover:bg-rose-50"
          >
            Excluir
          </button>
        </div>
      </div>
      <Card>
        <CardHeader className="px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-xl">{petName}</CardTitle>
              <CardDescription className="text-sm text-slate-500">
                Tutor:{" "}
                <span className="font-medium text-slate-700">{tutorName}</span>
              </CardDescription>
              <div className="mt-2 text-sm text-slate-500">
                Hotel:{" "}
                <span className="font-medium text-slate-700">{hotelName}</span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${meta.badge}`}
              >
                {meta.label}
              </span>
              <div className="text-xs text-slate-400">
                Criada em{" "}
                {reservation.createdAt
                  ? new Date(reservation.createdAt).toLocaleDateString("pt-BR")
                  : "—"}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-4 pt-1 text-sm text-slate-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-xs text-slate-400">Check-in</div>
              <div className="font-medium">{reservation.checkinDate}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Check-out</div>
              <div className="font-medium">{reservation.checkoutDate}</div>
            </div>
          </div>

          {reservation.notes ? (
            <div className="text-sm text-slate-600 border-t pt-3">
              <div className="text-xs text-slate-400">Observações</div>
              <div className="mt-1">{reservation.notes}</div>
            </div>
          ) : (
            <div className="text-sm text-slate-400 border-t pt-3">
              Sem observações.
            </div>
          )}
        </CardContent>

        <CardFooter className="px-6 py-3 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">ID: {reservation.id}</div>

          <div className="flex items-center gap-2">
            {reservation.status !== ReservationStatus.APPROVED && (
              <button
                onClick={() => handleChangeStatus(ReservationStatus.APPROVED)}
                disabled={changing}
                className="text-xs px-3 py-1 rounded-md border bg-white hover:bg-green-50"
              >
                Aprovar
              </button>
            )}
            {reservation.status !== ReservationStatus.CHECKED_IN && (
              <button
                onClick={() => handleChangeStatus(ReservationStatus.CHECKED_IN)}
                disabled={changing}
                className="text-xs px-3 py-1 rounded-md border bg-white hover:bg-indigo-50"
              >
                Marcar Hospedado
              </button>
            )}
            {reservation.status !== ReservationStatus.CANCELLED && (
              <button
                onClick={() => handleChangeStatus(ReservationStatus.CANCELLED)}
                disabled={changing}
                className="text-xs px-3 py-1 rounded-md border text-rose-600 hover:bg-rose-50"
              >
                Cancelar
              </button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
