"use client";

import React from "react";
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
  HotelRepo,
  UserRepo,
} from "utils/localstorage";
import { Hotel, Reservation, ReservationStatus } from "utils/models";
import { useRouter } from "next/navigation";
import { AdicionarReservaDialog } from "@/components/modais/AdicionarReserva";

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
  userName?: string;
};

export default function Dashboard() {
  const [reservas, setReservas] = React.useState<ReservationView[]>([]);
  const [hotel, setHotel] = React.useState<Hotel | null>(null);
  const [query, setQuery] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState<
    ReservationStatus | "ALL"
  >("ALL");
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
          userName: user?.name ?? "—",
        };
      });
    },
    [],
  );

  const updateData = React.useCallback(() => {
    const hotels = HotelRepo.list();
    const hotelSelecionado = hotels[0] ?? null;
    setHotel(hotelSelecionado);

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
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-start gap-4">
          <div className="flex flex-col">
            <h1 className="text-3xl font-semibold leading-tight">
              Reservas do seu hotel
            </h1>
            <p className="text-sm text-slate-500">
              {hotel ? (
                <>
                  <span className="font-medium">{hotel.name}</span>
                  <span className="mx-2">•</span>
                  <span className="text-xs text-slate-400">
                    {hotel.address ?? "Endereço não informado"}
                  </span>
                </>
              ) : (
                "Carregando informações do hotel..."
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex gap-4 bg-white border rounded-lg px-3 py-2 shadow-sm">
            <div className="text-sm">
              <div className="text-xs text-slate-400">Total</div>
              <div className="font-medium">{totals.total}</div>
            </div>
            <div className="text-sm">
              <div className="text-xs text-slate-400">Pendentes</div>
              <div className="font-medium text-yellow-600">
                {totals.pending}
              </div>
            </div>
            <div className="text-sm">
              <div className="text-xs text-slate-400">Hospedados</div>
              <div className="font-medium text-indigo-600">
                {totals.checkedIn}
              </div>
            </div>
          </div>

          <AdicionarReservaDialog
            hotelId={hotel?.id ?? ""}
            userId=""
            onSaved={updateData}
          />
        </div>
      </div>

      {/* Controls: search + filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div className="flex items-center gap-3 w-full md:w-1/2">
          <input
            aria-label="Buscar reservas"
            placeholder="Buscar por pet, usuário, notas ou data..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as string)}
            className="rounded-md border px-3 py-2 text-sm"
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
            className="text-sm px-3 py-2 rounded-md border hover:bg-slate-50"
          >
            Limpar
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border-dashed border-2 border-slate-100 p-12 text-center">
          <h3 className="text-lg font-semibold mb-2">
            Nenhuma reserva encontrada
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            Tente alterar os filtros ou clique em “Adicionar Reserva” para criar
            a primeira.
          </p>
          <div className="flex items-center justify-center">
            <AdicionarReservaDialog
              hotelId={hotel?.id ?? ""}
              userId=""
              onSaved={updateData}
            />
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => {
            const meta = STATUS_META[r.status];
            return (
              <Card key={r.id} className="pb-0">
                <CardHeader className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg">{r.petName}</CardTitle>
                      <CardDescription className="text-xs text-slate-500">
                        Usuário:{" "}
                        <span className="font-medium text-slate-700">
                          {r.userName}
                        </span>
                      </CardDescription>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${meta.badge}`}
                      >
                        {meta.label}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="px-5 pb-4 pt-1 text-sm text-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-xs text-slate-400">Check-in</div>
                      <div className="font-medium">{r.checkinDate}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Check-out</div>
                      <div className="font-medium">{r.checkoutDate}</div>
                    </div>
                  </div>

                  {r.notes ? (
                    <div className="text-sm text-slate-600 border-t pt-3">
                      <div className="text-xs text-slate-400">Observações</div>
                      <div className="mt-1">{r.notes}</div>
                    </div>
                  ) : (
                    <div className="text-sm text-slate-400 border-t pt-3">
                      Sem observações.
                    </div>
                  )}
                </CardContent>

                <CardFooter className="px-5 py-3 bg-slate-50 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    ID: {r.id.slice(0, 6)}...
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="text-xs px-3 py-1 rounded-md border hover:bg-white/50"
                      onClick={() =>
                        Router.push(`dashboard/reserva/${r.id}/view`)
                      }
                    >
                      Ver
                    </button>
                    <button
                      className="text-xs px-3 py-1 rounded-md border hover:bg-white/50"
                      onClick={() =>
                        Router.push(`dashboard/reserva/${r.id}/edit`)
                      }
                    >
                      Editar
                    </button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
