import type { APIRequestContext } from "@playwright/test";

export const BACKEND_URL = "http://localhost:4011";
export const STEP_MS = 30 * 60_000;

export interface SlotPlan {
  iso: string;
  label: string;
}

function utcLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });
}

export function slotTime(gap = 1): SlotPlan {
  const now = new Date();
  const dayStartUtc = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  const iso = new Date(dayStartUtc + 8 * 3600_000 + gap * STEP_MS).toISOString();
  return { iso, label: utcLabel(iso) };
}

export function dayButtonLabel(dayOffset = 1): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + dayOffset);
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

export async function seedEventType(
  request: APIRequestContext,
  name: string,
  description = "Описание",
  durationMinutes = 30,
): Promise<{ id: string; name: string }> {
  const res = await request.post(`${BACKEND_URL}/api/v1/admin/event-types`, {
    data: { name, description, durationMinutes },
  });
  if (!res.ok()) throw new Error(`seedEventType failed: ${res.status()} ${await res.text()}`);
  return (await res.json()) as { id: string; name: string };
}

export async function bookSlot(
  request: APIRequestContext,
  eventTypeId: string,
  guestName: string,
  startAt: string,
): Promise<{ id: string }> {
  const res = await request.post(`${BACKEND_URL}/api/v1/bookings`, {
    data: { eventTypeId, guestName, startAt },
  });
  if (!res.ok()) throw new Error(`bookSlot failed: ${res.status()} ${await res.text()}`);
  return (await res.json()) as { id: string };
}

export async function listBookings(request: APIRequestContext): Promise<unknown[]> {
  const res = await request.get(
    `${BACKEND_URL}/api/v1/admin/bookings?from=2000-01-01T00:00:00.000Z`,
  );
  if (!res.ok()) throw new Error(`listBookings failed: ${res.status()}`);
  return (await res.json()) as unknown[];
}
