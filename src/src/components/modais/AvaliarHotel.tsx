"use client";

import React, { useState } from "react";
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
import { RatingRepo } from "utils/localstorage";
import { Reservation } from "@/utils/models";
import { Star } from "lucide-react";

interface AvaliarHotelDialogProps {
  reservation: Reservation;
  trigger: React.ReactNode;
  onSubmitted?: () => void;
}

export function AvaliarHotelDialog({
  reservation,
  trigger,
  onSubmitted,
}: AvaliarHotelDialogProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (rating === 0) {
      setError("Por favor, selecione uma avaliação de 1 a 5 estrelas.");
      return;
    }

    try {
      setLoading(true);
      RatingRepo.create({
        userId: reservation.userId,
        hotelId: reservation.hotelId,
        reservationId: reservation.id,
        rating,
        comment,
      });

      setLoading(false);
      setOpen(false);
      // reset form
      setRating(0);
      setComment("");
      if (onSubmitted) onSubmitted();
    } catch (err: any) {
      setLoading(false);
      setError(err?.message ?? "Erro ao salvar avaliação.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Avaliar Estadia</DialogTitle>
          <DialogDescription>
            Deixe sua avaliação para o hotel {reservation.hotelName}. Sua
            opinião é importante!
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Sua Avaliação
            </label>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, index) => {
                const starValue = index + 1;
                return (
                  <button
                    type="button"
                    key={starValue}
                    onClick={() => setRating(starValue)}
                    onMouseEnter={() => setHover(starValue)}
                    onMouseLeave={() => setHover(0)}
                    className="p-1"
                  >
                    <Star
                      size={24}
                      fill={
                        starValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"
                      }
                      color={
                        starValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"
                      }
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="comment" className="block text-sm font-medium">
              Comentário (opcional)
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="mt-1 w-full border rounded-md p-2"
              placeholder="Descreva sua experiência..."
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
                Cancelar
              </button>
            </DialogClose>
            <button
              type="submit"
              disabled={loading || rating === 0}
              className="px-4 py-1 text-xs rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Enviar Avaliação"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
