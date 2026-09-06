import { describe, expect, it } from "vitest";
import { formatOffBlockRange } from "../offDayUtils";

describe("formatOffBlockRange", () => {
  it("formats single day off", () => {
    expect(
      formatOffBlockRange({ startDate: "2026-09-08", endDate: "2026-09-08", days: 1 }),
    ).toBe("9월 8일");
  });

  it("formats consecutive off range", () => {
    expect(
      formatOffBlockRange({ startDate: "2026-09-08", endDate: "2026-09-09", days: 2 }),
    ).toBe("9월 8일 ~ 9월 9일");
  });
});
