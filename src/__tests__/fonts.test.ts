import {
  DEFAULT_PERSIAN_FONT_ID,
  FONT_STORAGE_KEY,
  PERSIAN_FONTS,
  defaultFont,
  findFont,
  fontFamilyFor,
  isPersianFontId,
} from "@/lib/fonts";
import { LOCALES, translate } from "@/lib/i18n";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("../index.css", import.meta.url), "utf8");

describe("persian font registry", () => {
  it("gives every candidate a unique id", () => {
    const ids = PERSIAN_FONTS.map((font) => font.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("leads each stack with the quoted family name", () => {
    for (const font of PERSIAN_FONTS) {
      expect(font.stack.startsWith(`"${font.name}"`), font.id).toBe(true);
    }
  });

  it("falls back to a Persian-capable face before the generic keyword", () => {
    for (const font of PERSIAN_FONTS) {
      expect(font.stack, font.id).toContain("Noto Sans Arabic");
      expect(font.stack, font.id).toContain("Tahoma");
    }
  });

  it("keeps the shipping default in the list", () => {
    expect(findFont(DEFAULT_PERSIAN_FONT_ID)).toBeDefined();
    expect(defaultFont().id).toBe(DEFAULT_PERSIAN_FONT_ID);
  });

  it("resolves a stack for a known id", () => {
    for (const font of PERSIAN_FONTS) {
      expect(fontFamilyFor(font.id)).toBe(font.stack);
    }
  });

  it("falls back to the default stack for an unknown id", () => {
    for (const bad of [undefined, null, "", "comic-sans", "Vazir"]) {
      expect(fontFamilyFor(bad)).toBe(defaultFont().stack);
    }
  });

  it("rejects ids that are not in the registry", () => {
    expect(isPersianFontId(DEFAULT_PERSIAN_FONT_ID)).toBe(true);
    expect(isPersianFontId("comic-sans")).toBe(false);
    expect(isPersianFontId(null)).toBe(false);
    expect(isPersianFontId(7)).toBe(false);
  });

  it("namespaces its storage key", () => {
    expect(FONT_STORAGE_KEY).toMatch(/^intake\./);
  });
});

describe("persian font copy", () => {
  it("describes every candidate in both languages", () => {
    for (const font of PERSIAN_FONTS) {
      for (const locale of LOCALES) {
        const note = translate(locale, font.noteKey);
        const tag = translate(locale, font.tagKey);
        expect(note, `${font.id} note (${locale})`).not.toBe(font.noteKey);
        expect(tag, `${font.id} tag (${locale})`).not.toBe(font.tagKey);
      }
    }
  });
});

describe("index.css font wiring", () => {
  it("imports every registered candidate", () => {
    for (const font of PERSIAN_FONTS) {
      const encoded = font.name.replace(/ /g, "+");
      expect(css, `${font.name} missing from the @import`).toContain(
        `family=${encoded}:`,
      );
    }
  });

  it("routes both stacks through the swappable variable", () => {
    expect(css).toContain("--font-sans: \"Inter\", var(--font-persian)");
    expect(css).toContain("var(--font-persian), monospace");
  });

  it("defines a default for the variable so the first paint is correct", () => {
    const declaration = css.match(/--font-persian:\s*([^;]+);/);
    expect(declaration, "--font-persian is never declared").not.toBeNull();
    // The fallback declaration must name the shipping default, not a candidate
    // that only exists for comparison.
    expect(declaration?.[1]).toContain(`"${defaultFont().name}"`);
  });
});
