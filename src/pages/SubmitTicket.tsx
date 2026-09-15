import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Copy,
  LifeBuoy,
  Mail,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

type FieldErrors = Partial<
  Record<"customerName" | "customerEmail" | "subject" | "body", string>
>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: {
  customerName: string;
  customerEmail: string;
  subject: string;
  body: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  if (values.customerName.trim().length < 2) {
    errors.customerName = "Please tell us your name.";
  }
  if (!EMAIL_PATTERN.test(values.customerEmail.trim())) {
    errors.customerEmail = "Enter a valid email so we can reply.";
  }
  if (values.subject.trim().length < 4) {
    errors.subject = "Add a short subject (at least 4 characters).";
  }
  if (values.body.trim().length < 10) {
    errors.body = "Describe the issue in at least 10 characters.";
  }
  return errors;
}

export default function SubmitTicket() {
  const createTicket = useMutation(api.tickets.createTicket);

  const [values, setValues] = useState({
    customerName: "",
    customerEmail: "",
    subject: "",
    body: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSending, setIsSending] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const update = (field: keyof typeof values) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSending(true);
    try {
      const result = await createTicket({
        customerName: values.customerName,
        customerEmail: values.customerEmail,
        subject: values.subject,
        body: values.body,
      });
      setReference(result.reference);
      setValues({ customerName: "", customerEmail: "", subject: "", body: "" });
    } catch (error) {
      const message =
        error instanceof ConvexError
          ? String(error.data)
          : "Something went wrong sending your ticket. Please try again.";
      setErrors({ body: message });
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = async () => {
    if (!reference) return;
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/70 bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <LifeBuoy className="size-4" />
            </span>
            <span className="text-[15px] font-semibold tracking-tight">
              Relay
            </span>
            <span className="text-[13px] text-muted-foreground">Support</span>
          </Link>
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
            <Link to="/auth?returnTo=%2Fdashboard">Agent sign in</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              Customer support
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Tell us what&apos;s not working
            </h1>
            <p className="mt-3 max-w-xl text-[15px] leading-7 text-muted-foreground">
              Send us the details and you&apos;ll get a reference number right
              away. A human reads every message — no bots in the loop.
            </p>

            <div className="mt-8 rounded-2xl border border-border/70 bg-card p-6 shadow-[0_18px_40px_-32px_rgba(28,32,58,0.4)] sm:p-7">
              {reference ? (
                <div className="flex flex-col items-start gap-5">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/12 text-emerald-600">
                    <CheckCircle2 className="size-6" />
                  </span>
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight">
                      Ticket received
                    </h2>
                    <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                      We&apos;ve logged your request. Quote the reference below
                      if you need to follow up, and watch your inbox for a
                      reply.
                    </p>
                  </div>

                  <div className="flex w-full flex-wrap items-center gap-3 rounded-xl border border-border/70 bg-muted/40 px-4 py-3">
                    <span className="font-mono text-lg font-semibold tracking-tight">
                      {reference}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="ml-auto gap-2 bg-card"
                      onClick={handleCopy}
                    >
                      <Copy className="size-3.5" />
                      {copied ? "Copied" : "Copy reference"}
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      type="button"
                      onClick={() => setReference(null)}
                      className="shadow-sm"
                    >
                      Submit another ticket
                    </Button>
                    <Button asChild variant="outline">
                      <Link to="/">
                        <ArrowLeft className="size-4" />
                        Back to home
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="customerName">Your name</Label>
                      <Input
                        id="customerName"
                        name="customerName"
                        placeholder="Jordan Ellis"
                        value={values.customerName}
                        onChange={update("customerName")}
                        aria-invalid={Boolean(errors.customerName)}
                        disabled={isSending}
                        autoComplete="name"
                      />
                      {errors.customerName ? (
                        <p className="text-xs text-destructive">
                          {errors.customerName}
                        </p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customerEmail">Email</Label>
                      <Input
                        id="customerEmail"
                        name="customerEmail"
                        type="email"
                        placeholder="jordan@company.com"
                        value={values.customerEmail}
                        onChange={update("customerEmail")}
                        aria-invalid={Boolean(errors.customerEmail)}
                        disabled={isSending}
                        autoComplete="email"
                      />
                      {errors.customerEmail ? (
                        <p className="text-xs text-destructive">
                          {errors.customerEmail}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="Short summary of the issue"
                      value={values.subject}
                      onChange={update("subject")}
                      aria-invalid={Boolean(errors.subject)}
                      disabled={isSending}
                    />
                    {errors.subject ? (
                      <p className="text-xs text-destructive">{errors.subject}</p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="body">What happened?</Label>
                    <Textarea
                      id="body"
                      name="body"
                      rows={7}
                      placeholder="Include what you expected, what happened instead, and anything you already tried."
                      value={values.body}
                      onChange={update("body")}
                      aria-invalid={Boolean(errors.body)}
                      disabled={isSending}
                      className="min-h-40"
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {errors.body ? (
                          <span className="text-destructive">{errors.body}</span>
                        ) : (
                          "The more detail, the faster the fix."
                        )}
                      </span>
                      <span className="tabular-nums">
                        {values.body.trim().length} characters
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-5">
                    <p className="text-xs text-muted-foreground">
                      We only use your email to reply to this ticket.
                    </p>
                    <Button
                      type="submit"
                      size="lg"
                      className="gap-2 shadow-sm"
                      disabled={isSending}
                    >
                      <MessageSquare className="size-4" />
                      {isSending ? "Sending..." : "Send ticket"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>

          <aside className="space-y-4 lg:pt-24">
            <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
              <Clock className="size-5 text-primary" />
              <h2 className="mt-3 text-sm font-semibold tracking-tight">
                What happens next
              </h2>
              <ol className="mt-3 space-y-3 text-[13px] leading-6 text-muted-foreground">
                <li className="flex gap-2.5">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  Your ticket gets a reference number immediately.
                </li>
                <li className="flex gap-2.5">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  It lands in the support queue and gets triaged for priority.
                </li>
                <li className="flex gap-2.5">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  A reply arrives by email, usually within a working day.
                </li>
              </ol>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
              <ShieldCheck className="size-5 text-primary" />
              <h2 className="mt-3 text-sm font-semibold tracking-tight">
                Please don&apos;t send secrets
              </h2>
              <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
                Never paste passwords, API keys, or full card numbers into a
                ticket. If a password reset is the issue, just say so and
                we&apos;ll handle it securely.
              </p>
            </div>

            <div
              className={cn(
                "rounded-2xl border border-border/70 bg-muted/40 p-5",
                "shadow-sm",
              )}
            >
              <Mail className="size-5 text-primary" />
              <h2 className="mt-3 text-sm font-semibold tracking-tight">
                Existing ticket?
              </h2>
              <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
                Reply to the email thread and your message is added to the same
                ticket — no need to start over.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
