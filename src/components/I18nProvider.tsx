import {
  DEFAULT_LOCALE,
  I18nContext,
  LOCALE_STORAGE_KEY,
  dictionaryFor,
  dirFor,
  isLocale,
  translate,
  type I18nContextValue,
  type Locale,
} from "@/lib/i18n";
import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return isLocale(stored) ? stored : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readStoredLocale);

  const dir = dirFor(locale);

  // Layout effect so the direction is applied before the first paint, which
  // avoids a flash of the wrong layout when a stored locale differs from the
  // Persian default baked into index.html.
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dir = dir;
  }, [locale, dir]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      // storage can be unavailable in private modes; the session still works
    }
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState((current) => {
      const next: Locale = current === "fa" ? "en" : "fa";
      try {
        window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      dir,
      dict: dictionaryFor(locale),
      t: (key, params) => translate(locale, key, params),
      setLocale,
      toggleLocale,
    }),
    [locale, dir, setLocale, toggleLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
