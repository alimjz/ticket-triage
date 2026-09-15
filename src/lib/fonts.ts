import type { MessageKey } from "@/lib/i18n";
import { createContext } from "react";

/**
 * Persian typeface candidates. Every entry is loaded from Google Fonts, so the
 * comparison needs no self-hosted files, and each one only downloads once
 * Arabic-script text is on screen.
 *
 * Proper nouns stay in Latin: these are typeface names, not translated copy.
 */
export type PersianFont = {
  /** Stable id, used for storage and selection. */
  id: string;
  /** The typeface's own name. */
  name: string;
  /** Value assigned to `--font-persian`; already includes script fallbacks. */
  stack: string;
  /** One line on the face's character, localized. */
  noteKey: MessageKey;
  /** How the face is best described in one word, localized. */
  tagKey: MessageKey;
};

const SCRIPT_FALLBACK = '"Noto Sans Arabic", Tahoma';

function stackFor(primary: string) {
  return `"${primary}", ${SCRIPT_FALLBACK}`;
}

export const PERSIAN_FONTS: PersianFont[] = [
  {
    id: "estedad",
    name: "Estedad",
    stack: stackFor("Estedad"),
    noteKey: "fonts.noteEstedad",
    tagKey: "fonts.tagGeometric",
  },
  {
    id: "ibm-plex-sans-arabic",
    name: "IBM Plex Sans Arabic",
    stack: stackFor("IBM Plex Sans Arabic"),
    noteKey: "fonts.noteIbm",
    tagKey: "fonts.tagTechnical",
  },
  {
    id: "readex-pro",
    name: "Readex Pro",
    stack: stackFor("Readex Pro"),
    noteKey: "fonts.noteReadex",
    tagKey: "fonts.tagModern",
  },
  {
    id: "vazirmatn",
    name: "Vazirmatn",
    stack: stackFor("Vazirmatn"),
    noteKey: "fonts.noteVazirmatn",
    tagKey: "fonts.tagFamiliar",
  },
  {
    id: "tajawal",
    name: "Tajawal",
    stack: stackFor("Tajawal"),
    noteKey: "fonts.noteTajawal",
    tagKey: "fonts.tagRounded",
  },
  {
    id: "noto-sans-arabic",
    name: "Noto Sans Arabic",
    stack: stackFor("Noto Sans Arabic"),
    noteKey: "fonts.noteNoto",
    tagKey: "fonts.tagNeutral",
  },
];

export const DEFAULT_PERSIAN_FONT_ID = "estedad";

export const FONT_STORAGE_KEY = "intake.persianFont";

const BY_ID = new Map(PERSIAN_FONTS.map((font) => [font.id, font]));

export function findFont(id: string | null | undefined): PersianFont | undefined {
  return id ? BY_ID.get(id) : undefined;
}

export function isPersianFontId(id: unknown): id is string {
  return typeof id === "string" && BY_ID.has(id);
}

export function defaultFont(): PersianFont {
  return BY_ID.get(DEFAULT_PERSIAN_FONT_ID) ?? PERSIAN_FONTS[0];
}

/** The `--font-persian` value for an id, falling back to the default face. */
export function fontFamilyFor(id: string | null | undefined): string {
  return (findFont(id) ?? defaultFont()).stack;
}

export type PersianFontContextValue = {
  fontId: string;
  font: PersianFont;
  setFontId: (id: string) => void;
  resetFont: () => void;
  isDefault: boolean;
};

export const PersianFontContext =
  createContext<PersianFontContextValue | null>(null);
