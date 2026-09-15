import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Inbox,
  LifeBuoy,
  MessagesSquare,
  Send,
  Sparkles,
  Timer,
} from "lucide-react";
import { Link } from "react-router";

const STATUS_CHIPS = [
  { label: "Urgent", className: "bg-destructive/10 text-destructive" },
  { label: "Open", className: "bg-primary/10 text-primary" },
  { label: "Waiting", className: "bg-amber-500/12 text-amber-700" },
  { label: "Resolved", className: "bg-emerald-500/12 text-emerald-700" },
];

const FEATURES = [
  {
    icon: Inbox,
    title: "One queue, no guesswork",
    body: "Every ticket lands in a single list ordered by activity, so the newest request is always the first thing you see.",
  },
  {
    icon: Timer,
    title: "Priority that surfaces itself",
    body: "Tag tickets low through urgent and watch the ones that actually hurt your customers rise to the top of your day.",
  },
  {
    icon: MessagesSquare,
    title: "Reply without leaving the desk",
    body: "The full conversation sits next to the triage controls. One composer, no copy-pasting between tools.",
  },
  {
    icon: BarChart3,
    title: "An overview you can trust",
    body: "Open volume, first-reply time, and resolved-this-week numbers are computed live from the same data you triage.",
  },
];

const STEPS = [
  {
    title: "Customer sends the form",
    body: "A public form captures name, email, subject, and the full description. No account, no friction.",
  },
  {
    title: "You triage in one click",
    body: "Set status and priority, and read the whole thread. The queue reorders itself around real activity.",
  },
  {
    title: "Reply and close the loop",
    body: "Send an answer, the ticket moves to Waiting, and it drops out of your attention list until they respond.",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-3.5 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <LifeBuoy className="size-4" />
            </span>
            <span className="text-[15px] font-semibold tracking-tight">
              Relay
            </span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#how" className="transition-colors hover:text-foreground">
              How it works
            </a>
            <a href="#features" className="transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#agents" className="transition-colors hover:text-foreground">
              For agents
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
              <Link to="/auth?returnTo=%2Fdashboard">Agent sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/submit">Submit a ticket</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="surface-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(65%_55%_at_50%_0%,black,transparent)]" />
          <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-primary/12 blur-[120px]" />

          <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28 lg:pt-24">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              <Badge
                variant="outline"
                className="gap-1.5 rounded-full border-border/80 bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm"
              >
                <Sparkles className="size-3 text-primary" />
                A support desk for one very busy agent
              </Badge>

              <h1 className="mt-6 text-[2.4rem] font-semibold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-[3.4rem]">
                Every customer question,
                <span className="text-primary"> answered in order</span>.
              </h1>

              <p className="mt-5 max-w-xl text-[15px] leading-7 text-muted-foreground">
                Relay gives your customers a clean ticket form and gives you a
                calm triage queue with replies, priorities, and a live overview
                of how the week is actually going.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="gap-2 shadow-sm">
                  <Link to="/submit">
                    Submit a ticket
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-card">
                  <Link to="/auth?returnTo=%2Fdashboard">Open agent dashboard</Link>
                </Button>
              </div>

              <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-border/70 pt-6">
                {[
                  { value: "0", label: "Tools to configure" },
                  { value: "<1h", label: "Typical first reply" },
                  { value: "Live", label: "Queue updates" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <dt className="text-lg font-semibold tracking-tight">
                      {stat.value}
                    </dt>
                    <dd className="mt-0.5 text-xs leading-5 text-muted-foreground">
                      {stat.label}
                    </dd>
                  </div>
                ))}
              </dl>
            </motion.div>

            {/* Product preview */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/10 via-transparent to-transparent blur-2xl" />
              <Card className="gap-0 overflow-hidden rounded-2xl border-border/70 py-0 shadow-[0_24px_60px_-30px_rgba(28,32,58,0.35)]">
                <div className="flex items-center justify-between border-b border-border/70 bg-muted/40 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-muted-foreground/25" />
                    <span className="size-2.5 rounded-full bg-muted-foreground/25" />
                    <span className="size-2.5 rounded-full bg-muted-foreground/25" />
                    <span className="ml-2 text-xs font-medium text-muted-foreground">
                      Overview
                    </span>
                  </div>
                  <span className="rounded-full bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground shadow-sm ring-1 ring-border/70">
                    10 tickets
                  </span>
                </div>

                <CardContent className="space-y-5 px-4 py-5">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Open", value: "3", tone: "text-primary" },
                      { label: "Waiting", value: "4", tone: "text-amber-600" },
                      { label: "Resolved", value: "2", tone: "text-emerald-600" },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-xl border border-border/70 bg-card p-3 shadow-sm"
                      >
                        <p className="text-[11px] font-medium text-muted-foreground">
                          {stat.label}
                        </p>
                        <p
                          className={cn(
                            "mt-1 text-xl font-semibold tracking-tight",
                            stat.tone,
                          )}
                        >
                          {stat.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    {[
                      {
                        ref: "TCK-8F3KQ",
                        subject: "Billing: charged twice for August",
                        chip: "Urgent",
                        chipClass: "bg-destructive/10 text-destructive",
                      },
                      {
                        ref: "TCK-2MQ7P",
                        subject: "Password reset email never arrives",
                        chip: "Open",
                        chipClass: "bg-primary/10 text-primary",
                      },
                      {
                        ref: "TCK-9WD4R",
                        subject: "Webhooks retrying with stale payloads",
                        chip: "Waiting",
                        chipClass: "bg-amber-500/12 text-amber-700",
                      },
                    ].map((row) => (
                      <div
                        key={row.ref}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-card px-3.5 py-3 shadow-sm"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-medium">
                            {row.subject}
                          </p>
                          <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                            {row.ref}
                          </p>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium",
                            row.chipClass,
                          )}
                        >
                          {row.chip}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl border border-border/70 bg-muted/40 p-3.5">
                    <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                      <MessagesSquare className="size-3.5" />
                      Agent reply sent
                    </div>
                    <p className="mt-2 text-[13px] leading-6 text-foreground/90">
                      Thanks for flagging this — I can see both charges and the
                      duplicate refund is already on its way.
                    </p>
                    <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <CheckCircle2 className="size-3.5 text-emerald-600" />
                      Moved to Waiting
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-y border-border/70 bg-secondary/40">
          <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8">
            <motion.div {...fadeUp} className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Built for v1
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Four things, done properly
              </h2>
              <p className="mt-4 text-[15px] leading-7 text-muted-foreground">
                No chatbots, no SLAs, no workflow builder. Just the parts of a
                support desk that actually earn their place in a small team.
              </p>
            </motion.div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2">
              {FEATURES.map((feature) => (
                <motion.div key={feature.title} {...fadeUp}>
                  <Card className="h-full gap-4 rounded-2xl border-border/70 shadow-sm transition-shadow hover:shadow-md">
                    <CardContent className="space-y-3">
                      <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <feature.icon className="size-5" />
                      </span>
                      <h3 className="text-base font-semibold tracking-tight">
                        {feature.title}
                      </h3>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {feature.body}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8">
          <motion.div {...fadeUp} className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              The loop
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              From complaint to closed in three moves
            </h2>
          </motion.div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <motion.div key={step.title} {...fadeUp}>
                <div className="h-full rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-foreground text-[13px] font-semibold text-background">
                    {index + 1}
                  </span>
                  <h3 className="mt-4 text-base font-semibold tracking-tight">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {step.body}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* For agents */}
        <section id="agents" className="border-t border-border/70 bg-secondary/40">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
            <motion.div {...fadeUp}>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                For agents
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Your day starts on the overview
              </h2>
              <p className="mt-4 text-[15px] leading-7 text-muted-foreground">
                Open volume, first-reply time, and what slipped this week — then
                jump straight into the tickets that need you. Access is limited
                to the signed-in agent.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild size="lg" className="gap-2 shadow-sm">
                  <Link to="/auth?returnTo=%2Fdashboard">
                    Sign in to the desk
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-card">
                  <Link to="/submit">Preview the customer form</Link>
                </Button>
              </div>
            </motion.div>

            <motion.div {...fadeUp} className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: Inbox,
                  title: "Triage queue",
                  body: "Filter by status, priority, or search the thread.",
                },
                {
                  icon: Send,
                  title: "Threaded replies",
                  body: "Customer and agent messages in one timeline.",
                },
                {
                  icon: BarChart3,
                  title: "Live overview",
                  body: "Ten stats and a 14-day volume chart, always current.",
                },
                {
                  icon: CheckCircle2,
                  title: "Sample data",
                  body: "Load a realistic queue on day one to see it working.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm"
                >
                  <item.icon className="size-5 text-primary" />
                  <p className="mt-3 text-sm font-semibold tracking-tight">
                    {item.title}
                  </p>
                  <p className="mt-1.5 text-[13px] leading-6 text-muted-foreground">
                    {item.body}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8">
          <motion.div {...fadeUp}>
            <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card px-6 py-12 text-center shadow-sm sm:px-14">
              <div className="pointer-events-none absolute -top-20 left-1/2 h-56 w-[36rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[100px]" />
              <div className="relative">
                <div className="mx-auto flex w-fit items-center gap-2 rounded-full bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground">
                  {STATUS_CHIPS.map((chip) => (
                    <span
                      key={chip.label}
                      className={cn(
                        "rounded-full px-2 py-0.5",
                        chip.className,
                      )}
                    >
                      {chip.label}
                    </span>
                  ))}
                </div>
                <h2 className="mt-6 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                  Give customers a way in — and yourself a way through
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-[15px] leading-7 text-muted-foreground">
                  Share the ticket form, then work the queue from the agent
                  dashboard. Two screens, one loop.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Button asChild size="lg" className="gap-2 shadow-sm">
                    <Link to="/submit">
                      Submit a ticket
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link to="/auth?returnTo=%2Fdashboard">Agent sign in</Link>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-border/70 bg-secondary/40">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:px-8">
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <LifeBuoy className="size-3.5" />
            </span>
            <span className="font-medium text-foreground">Relay Support desk</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/submit" className="transition-colors hover:text-foreground">
              Submit a ticket
            </Link>
            <Link
              to="/auth?returnTo=%2Fdashboard"
              className="transition-colors hover:text-foreground"
            >
              Agent sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
