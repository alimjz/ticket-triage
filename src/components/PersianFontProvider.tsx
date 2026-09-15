import {
  DEFAULT_PERSIAN_FONT_ID,
  FONT_STORAGE_KEY,
  PersianFontContext,
  defaultFont,
  findFont,
  isPersianFontId,
  type PersianFontContextValue,
} from "@/lib/fonts";
import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

function readStoredFont(): string {
  if (typeof window === "undefined") return DEFAULT_PERSIAN_FONT_ID;
  try {
    const stored = window.localStorage.getItem(FONT_STORAGE_KEY);
    return isPersianFontId(stored) ? stored : DEFAULT_PERSIAN_FONT_ID;
  } catch {
    return DEFAULT_PERSIAN_FONT_ID;
  }
}

function persist(id: string) {
  try {
    window.localStorage.setItem(FONT_STORAGE_KEY, id);
  } catch {
    // storage can be unavailable in private modes; the session still works
  }
}

/**
 * Selects the Persian typeface for the whole document. `--font-persian` feeds
 * both the sans and mono stacks, so mono contexts (eyebrow labels, references)
 * pick up the same face instead of falling back to a generic monospace.
 */
export function PersianFontProvider({ children }: { children: ReactNode }) {
  const [fontId, setFontIdState] = useState<string>(readStoredFont);

  const font = findFont(fontId) ?? defaultFont();

  // Layout effect so a stored preference is in place before the first paint.
  useLayoutEffect(() => {
    document.documentElement.style.setProperty("--font-persian", font.stack);
  }, [font.stack]);

  const setFontId = useCallback((id: string) => {
    if (!isPersianFontId(id)) return;
    setFontIdState(id);
    persist(id);
  }, []);

  const resetFont = useCallback(() => {
    setFontIdState(DEFAULT_PERSIAN_FONT_ID);
    persist(DEFAULT_PERSIAN_FONT_ID);
  }, []);

  const value = useMemo<PersianFontContextValue>(
    () => ({
      fontId: font.id,
      font,
      setFontId,
      resetFont,
      isDefault: font.id === DEFAULT_PERSIAN_FONT_ID,
    }),
    [font, setFontId, resetFont],
  );

  return (
    <PersianFontContext.Provider value={value}>
      {children}
    </PersianFontContext.Provider>
  );
}
