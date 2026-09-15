import { Button } from "@/components/ui/button";
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
import { Link } from "react-router";

const CAPABILITIES = [
  {
    icon: LogIn,
    title: "Sign up in a minute",
    body: "Sign in with a work email and a one-time code. No passwords to create, store, or rotate.",
  },
  {
    icon: Layers,
    title: "Browse the catalog",
    body: "Every ticket the team has logged, grouped by status and ordered by the last thing that happened.",
  },
  {
    icon: Search,
    title: "Search that finds it",
    body: "Match on title, reference, requester, or the latest comment, then narrow by status and priority.",
  },
  {
    icon: Paperclip,
    title: "Post and upload",
    body: "Open a ticket with screenshots, logs, or documents attached — up to five files, 10 MB each.",
  },
  {
    icon: MessageSquare,
    title: "Comment in context",
    body: "The thread lives on the ticket, so nobody has to reconstruct the story from an inbox later.",
  },
  {
    icon: LayoutDashboard,
    title: "Your own dashboard",
    body: "The tickets you logged, what is waiting on you, and a private todo list beside them.",
  },
];

const WORKFLOW = [
  {
    step: "01",
    title: "Log the request",
    body: "Write the title, the details, and attach what matters. It lands in the catalog as open with normal priority.",
  },
  {
    step: "02",
    title: "Triage it",
    body: "Set status and priority from the ticket page or inline in the admin table. The queue reorders itself.",
  },
  {
    step: "03",
    title: "Close the loop",
    body: "Comment as you work, mark it resolved, and the thread keeps a searchable record of what happened.",
  },
];

const PREVIEW_ROWS = [
  {
    reference: "INT-8F3KQ",
    subject: "Rotate the staging API keys before Friday",
    chip: "Open",
    chipClass: "bg-primary/14 text-primary",
  },
  {
    reference: "INT-2MQ7P",
    subject: "Deploy runbook is out of date",
    chip: "Urgent",
    chipClass: "bg-destructive/16 text-destructive",
  },
  {
    reference: "INT-9WD4R",
    subject: "Import fails on files larger than 5 MB",
    chip: "Waiting",
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
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-3.5 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg border border-border/80 bg-card text-primary">
              <SquareStack className="size-4" />
            </span>
            <span className="leading-tight">
              <span className="block text-[15px] font-semibold tracking-tight">
                Intake
              </span>
              <span className="block font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                internal ticketing
              </span>
            </span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#capabilities" className="transition-colors hover:text-foreground">
              Capabilities
            </a>
            <a href="#workflow" className="transition-colors hover:text-foreground">
              Workflow
            </a>
            <a href="#desk" className="transition-colors hover:text-foreground">
              The desk
            </a>
          </nav>
          <Button asChild size="sm" className="gap-1.5">
            <Link to="/auth?returnTo=%2Fdashboard">
              Sign in
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
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
              <p className="mono-label">Internal ticketing system</p>

              <h1 className="mt-5 text-[2.4rem] font-semibold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-[3.4rem]">
                Every request the team owes,
                <span className="text-primary"> in one quiet queue</span>.
              </h1>

              <p className="mt-5 max-w-xl text-[15px] leading-7 text-muted-foreground">
                Intake is a private ticketing desk for a handful of people. Log
                what you are waiting on, comment in context, attach the file that
                explains it, and keep a todo list that stays yours.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="gap-2">
                  <Link to="/auth?returnTo=%2Fdashboard">
                    Sign in or create an account
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-card">
                  <a href="#capabilities">See what it does</a>
                </Button>
              </div>

              <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-border/70 pt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                {[
                  "one-time code sign-in",
                  "full-text search",
                  "attachments up to 10 MB",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-primary" />
                    {item}
                  </li>
                ))}
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
                    <span className="ml-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                      catalog
                    </span>
                  </div>
                  <span className="rounded-full border border-border/70 bg-card px-2.5 py-1 font-mono text-[10px] text-muted-foreground">
                    10 tickets
                  </span>
                </div>

                <div className="space-y-5 px-4 py-5">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Open", value: "3", tone: "text-primary" },
                      {
                        label: "Waiting",
                        value: "4",
                        tone: "text-amber-600 dark:text-amber-300",
                      },
                      {
                        label: "Resolved",
                        value: "2",
                        tone: "text-emerald-600 dark:text-emerald-300",
                      },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-xl border border-border/70 bg-background/60 p-3"
                      >
                        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                          {stat.label}
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
                            {row.subject}
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
                          {row.chip}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl border border-border/70 bg-foreground/[0.03] p-3.5">
                    <div className="flex items-center gap-2">
                      <span className="flex size-6 items-center justify-center rounded-full bg-primary/12 font-mono text-[10px] text-primary">
                        MO
                      </span>
                      <span className="text-[12px] font-medium">
                        Maya Okafor
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        2h ago
                      </span>
                    </div>
                    <p className="mt-2 text-[13px] leading-6 text-foreground/90">
                      Confirmed on my machine too. The uploader rejects anything
                      over 5 MB, so I raised the limit to 20 MB on my branch.
                    </p>
                    <div className="mt-3 flex items-center gap-2 rounded-lg border border-border/70 bg-card px-2.5 py-1.5">
                      <Paperclip className="size-3.5 text-muted-foreground" />
                      <span className="truncate text-[11px]">
                        deploy-log.txt
                      </span>
                      <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                        128 KB
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border/70 bg-foreground/[0.03] px-4 py-2.5">
                  <p className="truncate font-mono text-[10px] text-muted-foreground">
                    select * from tickets order by last_activity_at desc;
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
              <p className="mono-label">Capabilities</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Everything a small team actually needs
              </h2>
              <p className="mt-4 text-[15px] leading-7 text-muted-foreground">
                Accounts, a searchable catalog, detail pages, file uploads,
                comments, personal todos, and an admin area. Nothing else
                competing for attention.
              </p>
            </motion.div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {CAPABILITIES.map((capability) => (
                <motion.div key={capability.title} {...fadeUp} className="h-full">
                  <div className="flex h-full flex-col rounded-2xl border border-border/70 bg-card p-6 transition-colors hover:border-primary/30">
                    <span className="flex size-9 items-center justify-center rounded-lg border border-border/70 bg-primary/10 text-primary">
                      <capability.icon className="size-4" />
                    </span>
                    <h3 className="mt-4 text-[15px] font-semibold tracking-tight">
                      {capability.title}
                    </h3>
                    <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
                      {capability.body}
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
              <p className="mono-label">Workflow</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                From request to record in three moves
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
                      {item.title}
                    </h3>
                    <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
                      {item.body}
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
                  Run the desk from the admin area
                </h2>
                <p className="mt-3 text-[14px] leading-7 text-muted-foreground">
                  Team-wide numbers first: volume by day, what is unresolved,
                  how long a first response usually takes, and which tickets
                  have been sitting the longest.
                </p>
                <ul className="mt-5 space-y-3 text-[13px] leading-6 text-muted-foreground">
                  <li className="flex gap-2.5">
                    <Layers className="mt-0.5 size-4 shrink-0 text-primary" />
                    Inline status and priority on every row, no page hopping.
                  </li>
                  <li className="flex gap-2.5">
                    <Trash2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    Delete tickets you logged by mistake, with their files and
                    comments cleaned up.
                  </li>
                  <li className="flex gap-2.5">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                    Every screen sits behind an account, so the catalog is not
                    public.
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
                  Track your own work too
                </h2>
                <p className="mt-3 text-[14px] leading-7 text-muted-foreground">
                  Your dashboard is the small slice that belongs to you: the
                  tickets you opened, what is waiting on someone else, and the
                  todos that never needed a ticket of their own.
                </p>
                <ul className="mt-5 space-y-3 text-[13px] leading-6 text-muted-foreground">
                  <li className="flex gap-2.5">
                    <LayoutDashboard className="mt-0.5 size-4 shrink-0 text-primary" />
                    Counts update as the queue moves, because they read the same
                    data.
                  </li>
                  <li className="flex gap-2.5">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    Todos are private to you and can be linked to a ticket.
                  </li>
                  <li className="flex gap-2.5">
                    <MessageSquare className="mt-0.5 size-4 shrink-0 text-primary" />
                    Commenting as the requester reopens a ticket; anyone else
                    moves it to waiting.
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
                <p className="mono-label">Invite only by design</p>
                <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                  Give the team a desk, keep the catalog private
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-[15px] leading-7 text-muted-foreground">
                  Sign in with a work email and Intake creates your account on
                  the spot. Tickets, comments, and todos are visible to
                  signed-in teammates only.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Button asChild size="lg" className="gap-2">
                    <Link to="/auth?returnTo=%2Fdashboard">
                      Sign in or create an account
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link to="/auth?returnTo=%2Fadmin">Go to the admin area</Link>
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
              Intake
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em]">
              internal ticketing
            </span>
          </div>
          <div className="flex items-center gap-6 font-mono text-[11px] uppercase tracking-[0.14em]">
            <Link to="/catalog" className="transition-colors hover:text-foreground">
              Catalog
            </Link>
            <Link
              to="/auth?returnTo=%2Fdashboard"
              className="transition-colors hover:text-foreground"
            >
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
