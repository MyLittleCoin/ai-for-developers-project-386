import { describe, expect, it } from "vitest";
import { formatStripDay, formatTime, formatDateTime, dayWindow } from "./dates";

describe("dates", () => {
  it("dayWindow returns 14 days starting from local midnight", () => {
    const now = new Date(2026, 7, 15, 13, 30);
    const { days, fromISO, toISO } = dayWindow(now, 14);
    expect(days).toHaveLength(14);
    expect(days[0].getHours()).toBe(0);
    expect(days[0].getMinutes()).toBe(0);
    const anchor = new Date(2026, 7, 15);
    expect(days[0].getTime()).toBe(anchor.getTime());
    const expectedTo = new Date(2026, 7, 29);
    expect(new Date(fromISO).getTime()).toBe(anchor.getTime());
    expect(new Date(toISO).getTime()).toBe(expectedTo.getTime());
  });

  it("formats time and datetime from ISO", () => {
    const iso = new Date(2026, 7, 16, 10, 0).toISOString();
    expect(formatTime(iso)).toBe("10:00");
    expect(formatDateTime(iso)).toBe("16.08.2026 10:00");
  });

  it("formatStripDay zero-pads day and month", () => {
    expect(formatStripDay(new Date(2026, 7, 5))).toBe("05.08");
    expect(formatStripDay(new Date(2026, 11, 30))).toBe("30.12");
  });
});
