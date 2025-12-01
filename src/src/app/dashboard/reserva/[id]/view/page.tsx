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
  StayUpdateRepo,
  VaccinationRecordRepo,
} from "utils/localstorage";
import {
  Reservation,
  ReservationStatus,
  StayUpdate,
  VaccinationRecord,
} from "utils/models";

/** Meta visual para status */
const STATUS_META: Record<ReservationStatus, { label: string; badge: string }> =
{
  PENDING: { label: "Pendente", badge: "bg-yellow-100 text-yellow-800" },
  APPROVED: { label: "Aprovada", badge: "bg-green-100 text-green-800" },
  REJECTED: { label: "Rejeitada", badge: "bg-red-100 text-red-800" },
  CHECKED_IN: { label: "Hospedado", badge: "bg-indigo-100 text-indigo-800" },
  COMPLETED: { label: "Concluída", badge: "bg-slate-100 text-slate-800" },
  CANCELLED: { label: "Cancelada", badge: "bg-rose-100 text-rose-800" },
};

export default function ReservaPageViewOnly() {
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
  const [stayUpdates, setStayUpdates] = React.useState<StayUpdate[]>([]);
  const [vaccinationRecords, setVaccinationRecords] = React.useState<
    VaccinationRecord[]
  >([]);

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

      setStayUpdates(StayUpdateRepo.list(id));
      if (pet) {
        setVaccinationRecords(VaccinationRecordRepo.list(pet.id));
      }
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar a reserva.");
    } finally {
      setLoading(false);
    }
  }, [id]);

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
            onClick={() => router.push("/")}
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

        <div>
          <button
            onClick={() => router.back()}
            className="px-3 py-2 rounded-md border text-sm hover:bg-slate-50"
          >
            Voltar
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
          <div className="text-xs text-slate-400">Status: {meta.label}</div>
        </CardFooter>
      </Card>

      {/* Vaccination Records Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">
          Registros de Vacinação do Pet
        </h2>
        {vaccinationRecords.length === 0 ? (
          <div className="text-sm text-slate-500">
            Nenhum registro de vacinação encontrado para este pet.
          </div>
        ) : (
          <div className="space-y-4">
            {vaccinationRecords.map((record) => (
              <Card key={record.id} className="p-4">
                <p className="font-semibold">{record.vaccineName}</p>
                <p className="text-sm text-slate-600">
                  Aplicada em: {record.dateAdministered}
                </p>
                {record.nextDueDate && (
                  <p className="text-xs text-slate-500">
                    Próxima dose: {record.nextDueDate}
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Stay Updates Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Atualizações da Estadia</h2>
        {stayUpdates.length === 0 ? (
          <div className="text-sm text-slate-500">
            Nenhuma atualização para esta estadia.
          </div>
        ) : (
          <div className="space-y-4">
            {stayUpdates.map((update) => (
              <Card key={update.id} className="p-4">
                <p className="text-sm text-slate-700">{update.text}</p>
                {update.videoUrl && (
                  <div className="mt-2">
                    <video
                      controls
                      className="w-full max-h-64 object-cover rounded-md"
                    >
                      <source src={update.videoUrl} type="video/mp4" />
                      Seu navegador não suporta a tag de vídeo.
                    </video>
                  </div>
                )}
                <p className="text-xs text-slate-400 mt-2">
                  Por {update.authorName} em{" "}
                  {new Date(update.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
