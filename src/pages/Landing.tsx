import { LanguageToggle } from "@/components/LanguageToggle";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/use-i18n";
import type { MessageKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Layers,
  LayoutDashboard,
  LogIn,
  MessageSquare,
  Paperclip,
  Search,
  ShieldCheck,
  SquareStack,
  Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router";

const CAPABILITIES: { icon: LucideIcon; titleKey: MessageKey; bodyKey: MessageKey }[] =
  [
    {
      icon: LogIn,
      titleKey: "landing.capabilityOneTitle",
      bodyKey: "landing.capabilityOneBody",
    },
    {
      icon: Layers,
      titleKey: "landing.capabilityTwoTitle",
      bodyKey: "landing.capabilityTwoBody",
    },
    {
      icon: Search,
      titleKey: "landing.capabilityThreeTitle",
      bodyKey: "landing.capabilityThreeBody",
    },
    {
      icon: Paperclip,
      titleKey: "landing.capabilityFourTitle",
      bodyKey: "landing.capabilityFourBody",
    },
    {
      icon: MessageSquare,
      titleKey: "landing.capabilityFiveTitle",
      bodyKey: "landing.capabilityFiveBody",
    },
    {
      icon: LayoutDashboard,
      titleKey: "landing.capabilitySixTitle",
      bodyKey: "landing.capabilitySixBody",
    },
  ];

const WORKFLOW: { step: string; titleKey: MessageKey; bodyKey: MessageKey }[] = [
  {
    step: "01",
    titleKey: "landing.workflowOneTitle",
    bodyKey: "landing.workflowOneBody",
  },
  {
    step: "02",
    titleKey: "landing.workflowTwoTitle",
    bodyKey: "landing.workflowTwoBody",
  },
  {
    step: "03",
    titleKey: "landing.workflowThreeTitle",
    bodyKey: "landing.workflowThreeBody",
  },
];

const PREVIEW_ROWS: {
  reference: string;
  subjectKey: MessageKey;
  chipKey: MessageKey;
  chipClass: string;
}[] = [
  {
    reference: "INT-8F3KQ",
    subjectKey: "landing.previewRowOne",
    chipKey: "landing.previewOpen",
    chipClass: "bg-primary/14 text-primary",
  },
  {
    reference: "INT-2MQ7P",
    subjectKey: "landing.previewRowTwo",
    chipKey: "landing.previewUrgent",
    chipClass: "bg-destructive/16 text-destructive",
  },
  {
    reference: "INT-9WD4R",
    subjectKey: "landing.previewRowThree",
    chipKey: "landing.previewWaiting",
    chipClass: "bg-amber-500/14 text-amber-700 dark:text-amber-300",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
};

export default function Landing() {
  const { t } = useI18n();

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
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a
              href="#capabilities"
              className="transition-colors hover:text-foreground"
            >
              {t("landing.navCapabilities")}
            </a>
            <a href="#workflow" className="transition-colors hover:text-foreground">
              {t("landing.navWorkflow")}
            </a>
            <a href="#desk" className="transition-colors hover:text-foreground">
              {t("landing.navDesk")}
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Button asChild size="sm" className="gap-1.5">
              <Link to="/auth?returnTo=%2Fdashboard">
                {t("landing.signIn")}
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-border/70">
          <div className="surface-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(60%_55%_at_50%_0%,black,transparent)]" />
          <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[44rem] -translate-x-1/2 rounded-full bg-primary/12 blur-[130px]" />

          <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28 lg:pt-24">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="mono-label">{t("landing.overline")}</p>

              <h1 className="mt-5 text-[2.4rem] font-semibold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-[3.4rem]">
                {t("landing.heroTitle")}
                <span className="text-primary">{t("landing.heroAccent")}</span>
              </h1>

              <p className="mt-5 max-w-xl text-[15px] leading-8 text-muted-foreground">
                {t("landing.heroBody")}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="gap-2">
                  <Link to="/auth?returnTo=%2Fdashboard">
                    {t("landing.ctaPrimary")}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-card">
                  <a href="#capabilities">{t("landing.ctaSecondary")}</a>
                </Button>
              </div>

              <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-border/70 pt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                {[t("landing.factCode"), t("landing.factSearch"), t("landing.factFiles")].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-primary" />
                      {item}
                    </li>
                  ),
                )}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/10 via-transparent to-transparent blur-2xl" />
              <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_30px_70px_-40px_rgba(0,0,0,0.9)]">
                <div className="flex items-center justify-between border-b border-border/70 bg-foreground/[0.03] px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-foreground/15" />
                    <span className="size-2.5 rounded-full bg-foreground/15" />
                    <span className="size-2.5 rounded-full bg-foreground/15" />
                    <span className="ms-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                      {t("landing.previewTitle")}
                    </span>
                  </div>
                  <span className="rounded-full border border-border/70 bg-card px-2.5 py-1 font-mono text-[10px] text-muted-foreground">
                    {t("landing.previewCount")}
                  </span>
                </div>

                <div className="space-y-5 px-4 py-5">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        labelKey: "landing.previewOpen" as MessageKey,
                        value: "3",
                        tone: "text-primary",
                      },
                      {
                        labelKey: "landing.previewWaiting" as MessageKey,
                        value: "4",
                        tone: "text-amber-600 dark:text-amber-300",
                      },
                      {
                        labelKey: "landing.previewResolved" as MessageKey,
                        value: "2",
                        tone: "text-emerald-600 dark:text-emerald-300",
                      },
                    ].map((stat) => (
                      <div
                        key={stat.labelKey}
                        className="rounded-xl border border-border/70 bg-background/60 p-3"
                      >
                        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                          {t(stat.labelKey)}
                        </p>
                        <p
                          className={cn(
                            "mt-1 font-mono text-xl font-medium tabular-nums",
                            stat.tone,
                          )}
                        >
                          {stat.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    {PREVIEW_ROWS.map((row) => (
                      <div
                        key={row.reference}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/60 px-3.5 py-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-medium">
                            {t(row.subjectKey)}
                          </p>
                          <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                            {row.reference}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide",
                            row.chipClass,
                          )}
                        >
                          {t(row.chipKey)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl border border-border/70 bg-foreground/[0.03] p-3.5">
                    <div className="flex items-center gap-2">
                      <span className="flex size-6 items-center justify-center rounded-full bg-primary/12 font-mono text-[10px] text-primary">
                        {t("landing.previewCommentInitials")}
                      </span>
                      <span className="text-[12px] font-medium">
                        {t("landing.previewCommentName")}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {t("landing.previewCommentTime")}
                      </span>
                    </div>
                    <p className="mt-2 text-[13px] leading-7 text-foreground/90">
                      {t("landing.previewCommentBody")}
                    </p>
                    <div className="mt-3 flex items-center gap-2 rounded-lg border border-border/70 bg-card px-2.5 py-1.5">
                      <Paperclip className="size-3.5 text-muted-foreground" />
                      <span className="truncate text-[11px]" dir="ltr">
                        {t("landing.previewFile")}
                      </span>
                      <span className="ms-auto font-mono text-[10px] text-muted-foreground">
                        {t("landing.previewSize")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border/70 bg-foreground/[0.03] px-4 py-2.5">
                  <p
                    dir="ltr"
                    className="truncate text-start font-mono text-[10px] text-muted-foreground"
                  >
                    {t("landing.previewQuery")}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section
          id="capabilities"
          className="border-b border-border/70 bg-foreground/[0.015]"
        >
          <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8">
            <motion.div {...fadeUp} className="max-w-2xl">
              <p className="mono-label">{t("landing.capabilitiesOverline")}</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                {t("landing.capabilitiesTitle")}
              </h2>
              <p className="mt-4 text-[15px] leading-8 text-muted-foreground">
                {t("landing.capabilitiesBody")}
              </p>
            </motion.div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {CAPABILITIES.map((capability) => (
                <motion.div
                  key={capability.titleKey}
                  {...fadeUp}
                  className="h-full"
                >
                  <div className="flex h-full flex-col rounded-2xl border border-border/70 bg-card p-6 transition-colors hover:border-primary/30">
                    <span className="flex size-9 items-center justify-center rounded-lg border border-border/70 bg-primary/10 text-primary">
                      <capability.icon className="size-4" />
                    </span>
                    <h3 className="mt-4 text-[15px] font-semibold tracking-tight">
                      {t(capability.titleKey)}
                    </h3>
                    <p className="mt-2 text-[13px] leading-7 text-muted-foreground">
                      {t(capability.bodyKey)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="workflow" className="border-b border-border/70">
          <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8">
            <motion.div {...fadeUp} className="max-w-2xl">
              <p className="mono-label">{t("landing.workflowOverline")}</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                {t("landing.workflowTitle")}
              </h2>
            </motion.div>

            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {WORKFLOW.map((item) => (
                <motion.div key={item.step} {...fadeUp} className="h-full">
                  <div className="h-full rounded-2xl border border-border/70 bg-card p-6">
                    <span className="font-mono text-[11px] tracking-[0.2em] text-primary">
                      {item.step}
                    </span>
                    <h3 className="mt-4 text-[15px] font-semibold tracking-tight">
                      {t(item.titleKey)}
                    </h3>
                    <p className="mt-2 text-[13px] leading-7 text-muted-foreground">
                      {t(item.bodyKey)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="desk"
          className="border-b border-border/70 bg-foreground/[0.015]"
        >
          <div className="mx-auto grid w-full max-w-6xl gap-6 px-5 py-20 sm:px-8 lg:grid-cols-2">
            <motion.div {...fadeUp} className="h-full">
              <div className="flex h-full flex-col rounded-2xl border border-border/70 bg-card p-7">
                <span className="flex size-10 items-center justify-center rounded-xl border border-border/70 bg-primary/10 text-primary">
                  <ShieldCheck className="size-5" />
                </span>
                <h2 className="mt-5 text-xl font-semibold tracking-tight">
                  {t("landing.manageTitle")}
                </h2>
                <p className="mt-3 text-[14px] leading-8 text-muted-foreground">
                  {t("landing.manageBody")}
                </p>
                <ul className="mt-5 space-y-3 text-[13px] leading-7 text-muted-foreground">
                  <li className="flex gap-2.5">
                    <Layers className="mt-1 size-4 shrink-0 text-primary" />
                    {t("landing.manageOne")}
                  </li>
                  <li className="flex gap-2.5">
                    <Trash2 className="mt-1 size-4 shrink-0 text-primary" />
                    {t("landing.manageTwo")}
                  </li>
                  <li className="flex gap-2.5">
                    <ShieldCheck className="mt-1 size-4 shrink-0 text-primary" />
                    {t("landing.manageThree")}
                  </li>
                </ul>
              </div>
            </motion.div>

            <motion.div {...fadeUp} className="h-full">
              <div className="flex h-full flex-col rounded-2xl border border-border/70 bg-card p-7">
                <span className="flex size-10 items-center justify-center rounded-xl border border-border/70 bg-primary/10 text-primary">
                  <LayoutDashboard className="size-5" />
                </span>
                <h2 className="mt-5 text-xl font-semibold tracking-tight">
                  {t("landing.ownTitle")}
                </h2>
                <p className="mt-3 text-[14px] leading-8 text-muted-foreground">
                  {t("landing.ownBody")}
                </p>
                <ul className="mt-5 space-y-3 text-[13px] leading-7 text-muted-foreground">
                  <li className="flex gap-2.5">
                    <LayoutDashboard className="mt-1 size-4 shrink-0 text-primary" />
                    {t("landing.ownOne")}
                  </li>
                  <li className="flex gap-2.5">
                    <CheckCircle2 className="mt-1 size-4 shrink-0 text-primary" />
                    {t("landing.ownTwo")}
                  </li>
                  <li className="flex gap-2.5">
                    <MessageSquare className="mt-1 size-4 shrink-0 text-primary" />
                    {t("landing.ownThree")}
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8">
          <motion.div {...fadeUp}>
            <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card px-6 py-12 sm:px-14">
              <div className="surface-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(55%_60%_at_50%_0%,black,transparent)]" />
              <div className="pointer-events-none absolute -top-24 left-1/2 h-56 w-[36rem] -translate-x-1/2 rounded-full bg-primary/12 blur-[110px]" />
              <div className="relative">
                <p className="mono-label">{t("landing.ctaOverline")}</p>
                <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                  {t("landing.ctaTitle")}
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-[15px] leading-8 text-muted-foreground">
                  {t("landing.ctaBody")}
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Button asChild size="lg" className="gap-2">
                    <Link to="/auth?returnTo=%2Fdashboard">
                      {t("landing.ctaFinalPrimary")}
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link to="/auth?returnTo=%2Fadmin">
                      {t("landing.ctaFinalSecondary")}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-border/70">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:px-8">
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-lg border border-border/80 bg-card text-primary">
              <SquareStack className="size-3.5" />
            </span>
            <span className="text-[13px] font-medium text-foreground">
              {t("brand.name")}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em]">
              {t("brand.tagline")}
            </span>
          </div>
          <div className="flex items-center gap-6 font-mono text-[11px] uppercase tracking-[0.14em]">
            <Link to="/catalog" className="transition-colors hover:text-foreground">
              {t("nav.catalog")}
            </Link>
            <Link
              to="/auth?returnTo=%2Fdashboard"
              className="transition-colors hover:text-foreground"
            >
              {t("landing.signIn")}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
