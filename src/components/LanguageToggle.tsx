import { useI18n } from "@/hooks/use-i18n";
import { LOCALES } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t("language.label")}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-lg border border-border/70 bg-card p-0.5",
        className,
      )}
    >
      {LOCALES.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLocale(option)}
          aria-pressed={locale === option}
          className={cn(
            "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
            locale === option
              ? "bg-primary/12 text-primary"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t(option === "fa" ? "language.fa" : "language.en")}
        </button>
      ))}
    </div>
  );
}
