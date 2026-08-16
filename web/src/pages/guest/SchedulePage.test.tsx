import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { startOfDay } from "date-fns";
import SchedulePage from "@/pages/guest/SchedulePage";

vi.mock("@/lib/api", () => ({
  listMeetings: vi.fn(),
}));

import { listMeetings } from "@/lib/api";
import type { Booking } from "@/lib/api";

const listMock = vi.mocked(listMeetings);

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <SchedulePage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function localISO(hour: number, dayOffset = 1) {
  const day = startOfDay(new Date());
  const base = new Date(
    day.getFullYear(),
    day.getMonth(),
    day.getDate() + dayOffset,
    hour,
    0,
    0,
  );
  return base.toISOString();
}

const meetings: Booking[] = [
  {
    id: "b1",
    eventTypeId: "intro",
    guestName: "Аня",
    startAt: localISO(10),
    endAt: localISO(10.5),
  },
  {
    id: "b2",
    eventTypeId: "consult",
    guestName: "Пётр",
    startAt: localISO(14),
    endAt: localISO(15),
  },
];

describe("SchedulePage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows meetings from the schedule", async () => {
    listMock.mockResolvedValue(meetings);
    renderPage();

    expect(await screen.findByText("Аня")).toBeInTheDocument();
    expect(screen.getByText("intro")).toBeInTheDocument();
    expect(screen.getByText("Пётр")).toBeInTheDocument();
    expect(screen.getByText("consult")).toBeInTheDocument();
  });

  it("shows empty state without meetings", async () => {
    listMock.mockResolvedValue([]);
    renderPage();
    expect(await screen.findByText("Ближайших встреч нет")).toBeInTheDocument();
  });

  it("shows error state on failure", async () => {
    listMock.mockRejectedValue(new Error("boom"));
    renderPage();
    expect(await screen.findByText("Ошибка сервера")).toBeInTheDocument();
  });
});
