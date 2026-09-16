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
import type { PersianFont } from "@/lib/fonts";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("../index.css", import.meta.url), "utf8");

/**
 * Compiles src/index.css through the real Tailwind pipeline — the same one the
 * app builds with — and returns the stylesheet the browser actually receives.
 * This is the layer where an import is either inlined with its @font-face rules
 * or silently lost, so it is the honest thing to assert on.
 */
async function compileAppCss(): Promise<string> {
  const { compile } = await import("@tailwindcss/node");
  const compiler = await compile(css, {
    // From src/__tests__/, one level up is src/ — the project root is two.
    base: new URL("../..", import.meta.url).pathname,
    onDependency() {},
  });
  return compiler.build([]);
}

const FONT_SOURCE_WEIGHTS = [400, 500, 600, 700];

function expectedWeightCssFiles(font: PersianFont) {
  // Tajawal ships no 600 weight (500 → 700), so the registry skips it there.
  return FONT_SOURCE_WEIGHTS.filter((weight) =>
    weight === 600 ? font.id !== "tajawal" : true,
  ).map((weight) => `@fontsource/${font.id}/${weight}.css`);
}

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
  it("self-hosts every registered candidate through Fontsource", () => {
    for (const font of PERSIAN_FONTS) {
      const pkg = `@fontsource/${font.id}`;
      expect(css, `${pkg} is not imported`).toContain(`@import "${pkg}/`);
    }
  });

  it("loads Inter and JetBrains Mono self-hosted as well", () => {
    expect(css).toContain('@import "@fontsource/inter/400.css"');
    expect(css).toContain('@import "@fontsource/jetbrains-mono/400.css"');
  });

  it("never pulls fonts from a remote CDN", () => {
    expect(css).not.toContain("fonts.googleapis.com");
    expect(css).not.toContain("fonts.gstatic.com");
    expect(css).not.toContain('@import url("http');
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

  it("keeps every @import at the top, before any rule-producing code", () => {
    // A stylesheet is imported as one concatenated stylesheet, so an @import
    // that follows any other rule is invalid per the CSS spec and silently
    // ignored by browsers. That is exactly how the old Google Fonts import was
    // lost after Tailwind hoisted it past its @layer/@property rules. The
    // Fontsource imports carry the same risk once the bundler inlines their
    // @font-face rules, so guard against it here.
    const lastImport = css.lastIndexOf("@import ");
    expect(lastImport, "no @import found").toBeGreaterThan(-1);
    const beforeLastImport = css
      .slice(0, lastImport)
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/@import\s+[^;]+;/g, "");
    expect(beforeLastImport.trim(), "a rule precedes an @import").not.toMatch(
      /[;{}]/,
    );
  });
});

describe("self-hosted font resolution", () => {
  it("exposes a @font-face rule for every family in the compiled stylesheet", async () => {
    const compiled = await compileAppCss();
    expect(compiled).not.toContain("fonts.googleapis.com");
    expect(compiled, "no @font-face rules at all").toContain("@font-face");
    for (const font of PERSIAN_FONTS) {
      // lightningcss, Tailwind's CSS pipeline, normalizes the Fontsource
      // declarations to single quotes.
      expect(compiled, `${font.name} has no @font-face`).toContain(
        `font-family: '${font.name}'`,
      );
    }
  });

  it("ships a local woff2 file for every imported weight", () => {
    for (const font of PERSIAN_FONTS) {
      for (const weight of FONT_SOURCE_WEIGHTS) {
        const file = path.resolve(
          process.cwd(),
          `node_modules/@fontsource/${font.id}/${weight}.css`,
        );
        // Tajawal ships no 600; every other (family, weight) pair must exist.
        if (font.id === "tajawal" && weight === 600) {
          expect(existsSync(file), `${font.id} ${weight}`).toBe(false);
          continue;
        }
        const face = readFileSync(file, "utf8");
        expect(face, `${font.id} ${weight}`).toContain(`font-weight: ${weight}`);
      }
    }
  });

  it("lists the weight css files each family ships", () => {
    // Documenting the available weights keeps the registry honest: tajawal has
    // no 600, so its imports and specimens must not request one.
    expect(expectedWeightCssFiles(PERSIAN_FONTS[0])).toEqual([
      "@fontsource/estedad/400.css",
      "@fontsource/estedad/500.css",
      "@fontsource/estedad/600.css",
      "@fontsource/estedad/700.css",
    ]);
    expect(expectedWeightCssFiles(findFont("tajawal")!)).not.toContain(
      "@fontsource/tajawal/600.css",
    );
  });
});
