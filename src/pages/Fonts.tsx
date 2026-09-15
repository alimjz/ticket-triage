import { LanguageToggle } from "@/components/LanguageToggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useI18n } from "@/hooks/use-i18n";
import { usePersianFont } from "@/hooks/use-persian-font";
import { PRIORITY_LABEL_KEY, STATUS_LABEL_KEY } from "@/lib/tickets";
import {
  DEFAULT_PERSIAN_FONT_ID,
  PERSIAN_FONTS,
  type PersianFont,
} from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { ArrowLeft, Check, Loader2, RotateCcw, SquareStack } from "lucide-react";
import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router";

/** Families to warm up before showing specimens, in the weights the UI uses. */
const FAMILIES = PERSIAN_FONTS.map((font) => font.name);
const SAMPLE = "نمونه";

/**
 * Cold-starting a webfont means the first render shows a fallback face, which
 * would make the comparison useless. Load every candidate at 400 and 600 first.
 */
function useSpecimenFontsReady() {
  // Start ready when the browser has no FontFaceSet, so the effect never has to
  // set state synchronously.
  const [ready, setReady] = useState(
    () => typeof document === "undefined" || !document.fonts,
  );

  useEffect(() => {
    if (typeof document === "undefined" || !document.fonts) return;

    let cancelled = false;

    const loads = FAMILIES.flatMap((family) => [
      document.fonts.load(`400 1rem "${family}"`, SAMPLE),
      document.fonts.load(`600 1rem "${family}"`, SAMPLE),
    ]);

    // allSettled never rejects: a candidate that fails to load simply renders in
    // its fallback rather than hanging the comparison.
    void Promise.allSettled(loads).then(() => {
      if (!cancelled) setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return ready;
}

/**
 * One specimen, rendered in a fixed face regardless of the app-wide choice.
 * Overriding `--font-persian` on the wrapper is enough: both the sans and the
 * mono stack resolve through it, so the Persian eyebrow label exercises the
 * same fallback path it uses in the real shell.
 */
function Specimen({ stack }: { stack: string }) {
  const { t, formatMinutes } = useI18n();

  return (
    <div
      className="font-sans rounded-xl border border-border/70 bg-muted/15 p-5"
      style={{ "--font-persian": stack } as CSSProperties}
    >
      <p className="mono-label">
        {t("fonts.eyebrowLabel")} — {t("dashboard.teamCard")}
      </p>

      <p className="mt-4 text-2xl font-semibold ltr:tracking-tight">
        {t("landing.heroTitle")}
        <span className="text-primary">{t("landing.heroAccent")}</span>
      </p>

      <p className="mt-3 text-sm leading-8 text-muted-foreground">
        {t("landing.previewCommentBody")}
      </p>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-card px-3.5 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium">
            {t("landing.previewRowThree")}
          </p>
          <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
            INT-9WD4R
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-amber-500/14 px-2.5 py-1 font-mono text-[10px] text-amber-700 dark:text-amber-300">
          {t(STATUS_LABEL_KEY.pending)}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted-foreground">
        <span>{t("fonts.figuresLabel")}</span>
        <span className="text-border">/</span>
        <span>0123456789</span>
        <span className="text-border">/</span>
        <span>{t("common.ticketsCount", { count: 10 })}</span>
        <span className="text-border">/</span>
        <span>{t("landing.previewSize")}</span>
        <span className="text-border">/</span>
        <span>{formatMinutes(90)}</span>
        <span className="text-border">/</span>
        <span>{t(PRIORITY_LABEL_KEY.urgent)}</span>
      </div>
    </div>
  );
}

function FontCard({ font, ready }: { font: PersianFont; ready: boolean }) {
  const { t } = useI18n();
  const { fontId, setFontId } = usePersianFont();
  const isSelected = fontId === font.id;
  const isShippingDefault = font.id === DEFAULT_PERSIAN_FONT_ID;

  return (
    <Card className="gap-0 overflow-hidden rounded-2xl border-border/70 py-0 shadow-sm">
      <CardHeader className="gap-2 border-b border-border/70 py-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="font-sans text-base" dir="ltr">
            {font.name}
          </CardTitle>
          <div className="flex items-center gap-1.5">
            <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
              {t(font.tagKey)}
            </span>
            {isShippingDefault ? (
              <span className="rounded-full bg-primary/12 px-2 py-0.5 font-mono text-[10px] text-primary">
                {t("fonts.defaultBadge")}
              </span>
            ) : null}
          </div>
        </div>
        <CardDescription>{t(font.noteKey)}</CardDescription>
      </CardHeader>

      <CardContent className="py-5">
        {ready ? (
          <Specimen stack={font.stack} />
        ) : (
          <div className="flex h-[19rem] items-center justify-center rounded-xl border border-border/70 bg-muted/15">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t border-border/70 bg-muted/10 py-4">
        <Button
          type="button"
          variant={isSelected ? "outline" : "default"}
          className={cn("w-full gap-2", isSelected && "bg-card")}
          disabled={isSelected}
          onClick={() => setFontId(font.id)}
        >
          {isSelected ? (
            <>
              <Check className="size-4 text-primary" />
              {t("fonts.applied")}
            </>
          ) : (
            t("fonts.apply")
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function Fonts() {
  const { t } = useI18n();
  const { font, resetFont, isDefault } = usePersianFont();
  const ready = useSpecimenFontsReady();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-5 py-3.5 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg border border-border/80 bg-card text-primary">
              <SquareStack className="size-4" />
            </span>
            <span className="leading-tight">
              <span className="block text-[15px] font-semibold tracking-tight">
                {t("brand.name")}
              </span>
              <span className="block font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                {t("brand.tagline")}
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Button asChild size="sm" variant="outline" className="gap-1.5">
              <Link to="/dashboard">
                <ArrowLeft className="size-3.5" />
                {t("notFound.dashboard")}
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="mono-label">{t("fonts.specimen")}</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              {t("fonts.title")}
            </h1>
            <p className="mt-3 text-[15px] leading-8 text-muted-foreground">
              {t("fonts.description")}
            </p>
          </div>
          {!isDefault ? (
            <Button
              type="button"
              variant="outline"
              className="shrink-0 gap-2 bg-card"
              onClick={resetFont}
            >
              <RotateCcw className="size-3.5" />
              {t("fonts.reset")}
            </Button>
          ) : null}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-border/70 bg-muted/15 px-4 py-3 text-xs text-muted-foreground">
          <span className="font-mono">{font.name}</span>
          <span className="text-border">/</span>
          <span>{t("fonts.notice")}</span>
        </div>

        <div
          className={cn(
            "mt-8 grid gap-5 transition-opacity duration-300 lg:grid-cols-2",
            ready ? "opacity-100" : "opacity-70",
          )}
        >
          {PERSIAN_FONTS.map((candidate) => (
            <FontCard key={candidate.id} font={candidate} ready={ready} />
          ))}
        </div>
      </main>
    </div>
  );
}
