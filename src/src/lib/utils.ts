import { UUID } from "@/utils/models";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ==========================================
   Utilitários e funções auxiliares
   ========================================== */

export function uuid(): UUID {
  return Math.random().toString(36).substring(2, 11);
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function parseJSON<T>(key: string): T[] {
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function saveJSON<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}
