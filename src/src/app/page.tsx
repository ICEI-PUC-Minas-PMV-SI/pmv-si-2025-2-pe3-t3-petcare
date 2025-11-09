"use client";

import React from "react";
import { Header } from "@/components/header/page";
import styles from "./page.module.css";

import {
  UserRepo,
  PetRepo,
  HotelRepo,
  ReservationRepo,
  seedDemoData,
} from "utils/localstorage";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import { useRouter } from "next/navigation";
import { Hotel, Pet, Reservation } from "@/utils/models";
import { AdicionarReservaDialog } from "@/components/modais/AdicionarReserva";

export default function HomePage() {
  const [userId, setUserId] = React.useState<string | null>(null);
  const [reservas, setReservas] = React.useState<Reservation[]>([]);
  const [hotels, setHotels] = React.useState<Hotel[]>([]);
  const [pets, setPets] = React.useState<Pet[]>([]);
  const Router = useRouter();

  const carouselRef = React.useRef<HTMLDivElement | null>(null);

  function updateReservas(finalUserId: string) {
    if (finalUserId) {
      const my = ReservationRepo.list().filter((r) => r.userId === finalUserId);
      const enriched = my.map((r) => {
        const pet = PetRepo.get(r.petId);
        const hotel = HotelRepo.get(r.hotelId);
        return {
          ...r,
          petName: pet?.name ?? "—",
          hotelName: hotel?.name ?? "—",
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
    setPets(PetRepo.list(finalUserId ?? undefined));

    updateReservas(finalUserId);
  }, []);

  return (
    <div className="page">
      <Header />

      <div className={styles.container}>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-start gap-4">
              <div className="flex flex-col">
                <h1 className="text-3xl font-semibold leading-tight">
                  Bem vindo!
                </h1>
                <p className="text-sm text-slate-500"></p>
              </div>
            </div>
          </div>

          {/* Carousel */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-medium">Suas reservas</h2>
            </div>

            <div
              ref={carouselRef}
              className="flex gap-4 overflow-x-auto no-scrollbar py-2"
              style={{ scrollSnapType: "x mandatory", paddingBottom: 6 }}
            >
              {reservas.length === 0 ? (
                <div className="min-w-[320px]">
                  <Card>
                    <CardHeader>
                      <CardTitle>Nenhuma reserva</CardTitle>
                      <CardDescription>
                        Você não possui reservas no momento.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        Consulte hotéis para criar sua primeira reserva.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                reservas.map((r) => (
                  <div
                    key={r.id}
                    className="min-w-[320px] flex-shrink-0"
                    style={{ scrollSnapAlign: "start" }}
                  >
                    <Card key={r.id} className="pb-0">
                      <CardHeader className="px-5 py-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <CardTitle className="text-lg">
                              Pet:
                              <span> {r.petName}</span>
                            </CardTitle>
                            <CardDescription className="text-xs text-slate-500">
                              Hotel:
                              <span className="font-medium text-slate-700">
                                {r.hotelName}
                              </span>
                            </CardDescription>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <span className="text-xs text-slate-400">
                              {new Date(r.createdAt).toLocaleDateString(
                                "pt-BR",
                              )}
                            </span>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="px-5 pb-4 pt-1 text-sm text-slate-700">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="text-xs text-slate-400">
                              Check-in
                            </div>
                            <div className="font-medium">{r.checkinDate}</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-400">
                              Check-out
                            </div>
                            <div className="font-medium">{r.checkoutDate}</div>
                          </div>
                        </div>

                        {r.notes ? (
                          <div className="text-sm text-slate-600 border-t pt-3">
                            <div className="text-xs text-slate-400">
                              Observações
                            </div>
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
                        </div>
                      </CardFooter>
                    </Card>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Lista de hotéis para permitir reservas (call-to-action visual) */}
          <section>
            <h2 className="text-lg font-medium mb-4">Hotéis disponíveis</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {hotels.map((h) => (
                <Card key={h.id} className="pb-0">
                  <CardHeader className="px-5 py-4">
                    <div className="flex justify-between items-center">
                      <CardTitle>{h.name}</CardTitle>
                    </div>
                    <CardDescription>
                      {h.address ?? "Endereço não informado"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-5 pb-4 pt-1 text-sm text-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="text-xs text-slate-400">Capacidade</div>
                        <div className="font-medium">{h.capacity}</div>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="px-5 py-3  bg-slate-50 flex items-center justify-end">
                    <div className="flex items-center gap-2">
                      <AdicionarReservaDialog
                        hotelId={h.id}
                        userId={userId ?? ""}
                        onSaved={() => updateReservas(userId ?? "")}
                        triggerLabel="Fazer Reserva"
                      />
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
