"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

import { ReservationRepo, PetRepo } from "utils/localstorage";

interface AdicionarReservaDialogProps {
  userId: string;
  hotelId: string;
  triggerLabel?: string;
  onSaved?: () => void;
}

export function AdicionarReservaDialog({
  userId,
  hotelId,
  triggerLabel = "Nova reserva",
  onSaved,
}: AdicionarReservaDialogProps) {
  const [open, setOpen] = useState(false);
  const [pets, setPets] = useState<{ id: string; name: string }[]>([]);
  const [petId, setPetId] = useState<string>("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Carrega pets quando userId muda ou quando o diálogo abre
  useEffect(() => {
    if (!userId) {
      setPets([]);
      setPetId("");
      return;
    }
    const list = PetRepo.list(userId ?? undefined) || [];
    const mapped = list.map((p: any) => ({ id: p.id, name: p.name }));
    setPets(mapped);
    setPetId(mapped[0]?.id ?? "");
  }, [userId, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!userId) {
      setError("userId é obrigatório.");
      return;
    }
    if (!hotelId) {
      setError("hotelId é obrigatório.");
      return;
    }
    if (!petId) {
      setError("Selecione um pet.");
      return;
    }
    if (!checkIn || !checkOut) {
      setError("Informe as datas de check-in e check-out.");
      return;
    }
    if (new Date(checkOut) <= new Date(checkIn)) {
      setError("A data de check-out deve ser posterior à data de check-in.");
      return;
    }

    try {
      setLoading(true);
      ReservationRepo.create({
        userId,
        hotelId,
        petId,
        checkinDate: checkIn,
        checkoutDate: checkOut,
        notes,
      });

      setLoading(false);
      setOpen(false);
      // reset form
      setCheckIn("");
      setCheckOut("");
      setNotes("");
      setPetId(pets[0]?.id ?? "");
      if (onSaved) onSaved();
    } catch (err: any) {
      setLoading(false);
      setError(err?.message ?? "Erro ao salvar reserva.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="bg-green-600 text-white hover:bg-green-700 text-xs px-3 py-1 rounded-md border"
        >
          {triggerLabel}
        </button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Reserva</DialogTitle>
          <DialogDescription>
            Crie uma reserva associada ao usuário e hotel informados.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="petSelect" className="block text-sm font-medium">
              Pet
            </label>
            <select
              id="petSelect"
              value={petId}
              onChange={(e) => setPetId(e.target.value)}
              className="mt-1 w-full border rounded-md p-2"
            >
              {pets.length === 0 ? (
                <option value="">— Nenhum pet cadastrado —</option>
              ) : (
                <>
                  <option value="">— Selecione um pet —</option>
                  {pets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          <div>
            <label htmlFor="checkIn" className="block text-sm font-medium">
              Data de Check-in
            </label>
            <input
              id="checkIn"
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              required
              className="mt-1 w-full border rounded-md p-2"
            />
          </div>

          <div>
            <label htmlFor="checkOut" className="block text-sm font-medium">
              Data de Check-out
            </label>
            <input
              id="checkOut"
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              required
              className="mt-1 w-full border rounded-md p-2"
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium">
              Observações
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-1 w-full border rounded-md p-2"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <DialogFooter className="flex gap-2 mt-4">
            <DialogClose asChild>
              <button
                type="button"
                className="px-4 py-1 text-xs rounded-md bg-gray-300 hover:bg-red-400 "
              >
                Cancelar
              </button>
            </DialogClose>
            <button
              type="submit"
              disabled={loading || pets.length === 0}
              className="px-4 py-1 text-xs rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
