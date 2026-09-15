import {
  DEFAULT_LOCALE,
  LOCALES,
  dictionaries,
  dirFor,
  dictionaryFor,
  formatMinutes,
  isLocale,
  timeAgo,
  translate,
  type MessageKey,
} from "@/lib/i18n";
import {
  PRIORITY_LABEL_KEY,
  PRIORITY_ORDER,
  STATUS_LABEL_KEY,
  STATUS_ORDER,
} from "@/lib/tickets";
import { describe, expect, it } from "vitest";

/** Flatten a dictionary into dotted key paths so shapes can be compared. */
function keyPaths(node: unknown, prefix = ""): string[] {
  if (typeof node !== "object" || node === null) return [prefix];
  return Object.entries(node as Record<string, unknown>).flatMap(
    ([key, value]) => keyPaths(value, prefix ? `${prefix}.${key}` : key),
  );
}

function leaves(node: unknown): string[] {
  if (typeof node === "string") return [node];
  if (typeof node !== "object" || node === null) return [];
  return Object.values(node as Record<string, unknown>).flatMap(leaves);
}

describe("locales", () => {
  it("ships Persian as the default locale", () => {
    expect(DEFAULT_LOCALE).toBe("fa");
    expect(LOCALES).toEqual(["fa", "en"]);
  });

  it("maps each locale to a writing direction", () => {
    expect(dirFor("fa")).toBe("rtl");
    expect(dirFor("en")).toBe("ltr");
  });

  it("accepts only known locale identifiers", () => {
    expect(isLocale("fa")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("fr")).toBe(false);
    expect(isLocale(null)).toBe(false);
  });
});

describe("dictionaries", () => {
  it("keeps every locale on the same key shape", () => {
    const reference = keyPaths(dictionaries.fa).sort();
    for (const locale of LOCALES) {
      expect(keyPaths(dictionaries[locale]).sort()).toEqual(reference);
    }
  });

  it("has no empty strings", () => {
    for (const locale of LOCALES) {
      for (const value of leaves(dictionaries[locale])) {
        expect(value.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("keeps the same placeholders in both languages", () => {
    const placeholders = (value: string) =>
      (value.match(/\{(\w+)\}/g) ?? []).sort().join(",");

    const walk = (faValue: unknown, enValue: unknown, path: string) => {
      if (typeof faValue === "string" && typeof enValue === "string") {
        expect(placeholders(faValue), path).toBe(placeholders(enValue));
        return;
      }
      if (typeof faValue === "object" && faValue !== null) {
        for (const [key, child] of Object.entries(
          faValue as Record<string, unknown>,
        )) {
          walk(
            child,
            (enValue as Record<string, unknown>)[key],
            path ? `${path}.${key}` : key,
          );
        }
      }
    };

    walk(dictionaries.fa, dictionaries.en, "");
  });

  it("returns the matching dictionary", () => {
    expect(dictionaryFor("fa")).toBe(dictionaries.fa);
    expect(dictionaryFor("en")).toBe(dictionaries.en);
  });
});

describe("translate", () => {
  it("reads a nested key", () => {
    expect(translate("en", "nav.dashboard")).toBe("Dashboard");
    expect(translate("fa", "nav.dashboard")).toBe("داشبورد");
  });

  it("fills placeholders from params", () => {
    expect(translate("en", "catalog.loggedBy", { name: "Maya" })).toBe(
      "logged by Maya",
    );
    expect(translate("fa", "common.ticketsCount", { count: 4 })).toBe("4 تیکت");
  });

  it("leaves unknown placeholders untouched so the gap is visible", () => {
    expect(translate("en", "toasts.ticketCreated", {})).toBe(
      "Ticket {reference} created",
    );
  });

  it("resolves every status and priority key in both locales", () => {
    for (const locale of LOCALES) {
      for (const status of STATUS_ORDER) {
        const label = translate(locale, STATUS_LABEL_KEY[status]);
        expect(label).not.toContain(".");
      }
      for (const priority of PRIORITY_ORDER) {
        const label = translate(locale, PRIORITY_LABEL_KEY[priority]);
        expect(label).not.toContain(".");
      }
    }
  });

  it("produces Persian copy that is not just the English string", () => {
    const keys: MessageKey[] = [
      "nav.catalog",
      "nav.dashboard",
      "nav.admin",
      "brand.tagline",
    ];
    for (const key of keys) {
      expect(translate("fa", key)).not.toBe(translate("en", key));
    }
  });
});

describe("formatters", () => {
  const now = Date.now();

  it("describes relative time in each language", () => {
    expect(timeAgo(now - 5 * 60_000, "en")).toBe("5m ago");
    expect(timeAgo(now - 5 * 60_000, "fa")).toBe("5 دقیقه پیش");
  });

  it("falls back to an absolute date past a month", () => {
    const old = now - 60 * 24 * 60 * 60_000;
    expect(timeAgo(old, "en")).not.toMatch(/ago$/);
    expect(timeAgo(old, "fa")).not.toContain("پیش");
  });

  it("formats a duration for each language", () => {
    expect(formatMinutes(45, "en")).toBe("45m");
    expect(formatMinutes(45, "fa")).toBe("45 دقیقه");
    expect(formatMinutes(90, "en")).toBe("1h 30m");
    expect(formatMinutes(90, "fa")).toBe("1 ساعت و 30 دقیقه");
    expect(formatMinutes(null, "fa")).toBe("—");
  });
});
