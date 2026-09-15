import {
  I18nContext,
  formatDateTime,
  formatDayLabel,
  formatMinutes,
  timeAgo,
  type I18nContextValue,
} from "@/lib/i18n";
import { useContext, useMemo } from "react";

export type I18n = I18nContextValue & {
  timeAgo: (timestamp: number) => string;
  formatDateTime: (timestamp: number) => string;
  formatDayLabel: (day: string) => string;
  formatMinutes: (minutes: number | null) => string;
};

/** Messages, direction, and date formatting for the active locale. */
export function useI18n(): I18n {
  const value = useContext(I18nContext);
  if (value === null) {
    throw new Error("useI18n must be used inside I18nProvider");
  }

  const { locale } = value;

  return useMemo(
    () => ({
      ...value,
      timeAgo: (timestamp: number) => timeAgo(timestamp, locale),
      formatDateTime: (timestamp: number) => formatDateTime(timestamp, locale),
      formatDayLabel: (day: string) => formatDayLabel(day, locale),
      formatMinutes: (minutes: number | null) => formatMinutes(minutes, locale),
    }),
    [value, locale],
  );
}
