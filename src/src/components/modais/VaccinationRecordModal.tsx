"use client";

import React, { useState, useEffect } from "react";
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
import { VaccinationRecordRepo } from "utils/localstorage";
import { Pet, VaccinationRecord } from "@/utils/models";
import { Trash2 } from "lucide-react";

interface VaccinationRecordModalProps {
  pet: Pet;
  trigger: React.ReactNode;
}

export function VaccinationRecordModal({
  pet,
  trigger,
}: VaccinationRecordModalProps) {
  const [open, setOpen] = useState(false);
  const [records, setRecords] = useState<VaccinationRecord[]>([]);
  const [vaccineName, setVaccineName] = useState("");
  const [dateAdministered, setDateAdministered] = useState("");
  const [nextDueDate, setNextDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setRecords(VaccinationRecordRepo.list(pet.id));
    }
  }, [open, pet.id]);

  function refreshRecords() {
    setRecords(VaccinationRecordRepo.list(pet.id));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!vaccineName || !dateAdministered) {
      setError("Nome da vacina e data de aplicação são obrigatórios.");
      return;
    }

    try {
      setLoading(true);
      VaccinationRecordRepo.create({
        petId: pet.id,
        vaccineName,
        dateAdministered,
        nextDueDate: nextDueDate || null,
      });

      // Reset form and refresh list
      setVaccineName("");
      setDateAdministered("");
      setNextDueDate("");
      refreshRecords();
    } catch (err: any) {
      setError(err?.message ?? "Erro ao salvar registro.");
    } finally {
      setLoading(false);
    }
  }

  function handleDelete(recordId: string) {
    if (confirm("Tem certeza que deseja excluir este registro?")) {
      VaccinationRecordRepo.remove(recordId);
      refreshRecords();
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Registros de Vacinação de {pet.name}</DialogTitle>
          <DialogDescription>
            Visualize e adicione os registros de vacinação do seu pet.
          </DialogDescription>
        </DialogHeader>

        {/* List of existing records */}
        <div className="flex-grow overflow-y-auto pr-2 space-y-3">
          {records.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">
              Nenhum registro de vacinação encontrado.
            </p>
          ) : (
            records.map((record) => (
              <div
                key={record.id}
                className="flex justify-between items-center p-3 bg-slate-50 rounded-md"
              >
                <div>
                  <p className="font-semibold">{record.vaccineName}</p>
                  <p className="text-sm text-slate-600">
                    Aplicada em: {record.dateAdministered}
                  </p>
                  {record.nextDueDate && (
                    <p className="text-xs text-slate-500">
                      Próxima dose: {record.nextDueDate}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(record.id)}
                  className="p-2 text-red-500 hover:bg-red-100 rounded-full"
                  aria-label="Excluir registro"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Form to add new record */}
        <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
          <h4 className="font-semibold">Adicionar Novo Registro</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="vaccineName"
                className="block text-sm font-medium"
              >
                Nome da Vacina
              </label>
              <input
                id="vaccineName"
                type="text"
                value={vaccineName}
                onChange={(e) => setVaccineName(e.target.value)}
                className="mt-1 w-full border rounded-md p-2"
                required
              />
            </div>
            <div>
              <label
                htmlFor="dateAdministered"
                className="block text-sm font-medium"
              >
                Data de Aplicação
              </label>
              <input
                id="dateAdministered"
                type="date"
                value={dateAdministered}
                onChange={(e) => setDateAdministered(e.target.value)}
                className="mt-1 w-full border rounded-md p-2"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="nextDueDate" className="block text-sm font-medium">
              Próxima Dose (opcional)
            </label>
            <input
              id="nextDueDate"
              type="date"
              value={nextDueDate}
              onChange={(e) => setNextDueDate(e.target.value)}
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
                className="px-4 py-1 text-xs rounded-md bg-gray-300 hover:bg-red-400"
              >
                Fechar
              </button>
            </DialogClose>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1 text-xs rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Salvando..." : "Salvar Registro"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
