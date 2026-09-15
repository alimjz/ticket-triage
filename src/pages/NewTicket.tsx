import { AppShell } from "@/components/AppShell";
import { AssigneeSelect } from "@/components/AssigneeSelect";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useI18n } from "@/hooks/use-i18n";
import { useTeamMembers } from "@/hooks/use-team-members";
import { errorMessage } from "@/lib/errors";
import { formatBytes } from "@/lib/tickets";
import { useMutation } from "convex/react";
import { FileText, Loader2, Paperclip, Send, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

// Kept in step with the limits enforced in src/convex/tickets.ts.
const MAX_FILES = 5;
const MAX_FILE_BYTES = 10 * 1024 * 1024;

export default function NewTicket() {
  const { t } = useI18n();
  const createTicket = useMutation(api.tickets.createTicket);
  const generateUploadUrl = useMutation(api.tickets.generateUploadUrl);
  const navigate = useNavigate();

  const members = useTeamMembers();

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [assigneeId, setAssigneeId] = useState<Id<"users"> | undefined>();
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);

  const isSubmitting = progress !== null;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (picked.length === 0) return;

    const oversized = picked.filter((file) => file.size > MAX_FILE_BYTES);
    if (oversized.length > 0) {
      toast.error(t("newTicket.tooLarge"));
    }

    setFiles((current) => {
      const room = Math.max(MAX_FILES - current.length, 0);
      const accepted = picked
        .filter((file) => file.size <= MAX_FILE_BYTES)
        .slice(0, room);
      if (accepted.length < picked.length - oversized.length) {
        toast.error(t("newTicket.tooMany", { max: MAX_FILES }));
      }
      return [...current, ...accepted];
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (subject.trim().length < 4) {
      setError(t("newTicket.needTitle"));
      return;
    }
    if (body.trim().length < 10) {
      setError(t("newTicket.needDetails"));
      return;
    }

    try {
      const uploads: {
        storageId: Id<"_storage">;
        name: string;
        size: number;
        contentType?: string;
      }[] = [];

      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        setProgress(
          files.length === 1
            ? t("newTicket.uploadingOne", { name: file.name })
            : t("newTicket.uploadingMany", {
                current: index + 1,
                total: files.length,
              }),
        );
        const postUrl = await generateUploadUrl({});
        const response = await fetch(postUrl, {
          method: "POST",
          headers: file.type ? { "Content-Type": file.type } : undefined,
          body: file,
        });
        if (!response.ok) {
          throw new Error(t("errors.uploadFailed", { name: file.name }));
        }
        const { storageId } = (await response.json()) as { storageId: string };
        uploads.push({
          storageId: storageId as Id<"_storage">,
          name: file.name,
          size: file.size,
          contentType: file.type || undefined,
        });
      }

      setProgress(t("newTicket.creating"));
      const result = await createTicket({
        subject,
        body,
        assigneeId,
        attachments: uploads.length > 0 ? uploads : undefined,
      });

      toast.success(t("toasts.ticketCreated", { reference: result.reference }));
      navigate(`/catalog/${result.ticketId}`);
    } catch (caught) {
      setError(errorMessage(caught, t("errors.createTicket")));
    } finally {
      setProgress(null);
    }
  };

  return (
    <AppShell
      title={t("newTicket.title")}
      description={t("newTicket.description")}
      actions={
        <Button
          type="button"
          variant="outline"
          className="bg-card"
          onClick={() => navigate("/catalog")}
        >
          {t("common.cancel")}
        </Button>
      }
    >
      <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">
              {t("newTicket.cardTitle")}
            </CardTitle>
            <CardDescription>{t("newTicket.cardHint")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="space-y-2">
                <Label htmlFor="subject">{t("newTicket.titleLabel")}</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder={t("newTicket.titlePlaceholder")}
                  className="bg-background"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">{t("newTicket.detailsLabel")}</Label>
                <Textarea
                  id="body"
                  rows={8}
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  placeholder={t("newTicket.detailsPlaceholder")}
                  className="min-h-44 bg-background"
                  disabled={isSubmitting}
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{t("newTicket.detailsHint")}</span>
                  <span className="font-mono tabular-nums">
                    {t("newTicket.chars", { count: body.trim().length })}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("newTicket.ownerLabel")}</Label>
                <AssigneeSelect
                  members={members}
                  value={assigneeId}
                  onChange={(next) => setAssigneeId(next ?? undefined)}
                  className="w-full bg-background"
                />
                <p className="text-xs text-muted-foreground">
                  {t("newTicket.ownerHint")}
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="attachments">
                  {t("newTicket.attachmentsLabel")}
                </Label>
                <label
                  htmlFor="attachments"
                  className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center transition-colors hover:border-primary/40 hover:bg-primary/[0.04]"
                >
                  <Paperclip className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {t("newTicket.chooseFiles")}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t("newTicket.filesHint")}
                  </span>
                </label>
                <input
                  id="attachments"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                  disabled={isSubmitting}
                />

                {files.length > 0 ? (
                  <ul className="space-y-2">
                    {files.map((file, index) => (
                      <li
                        key={`${file.name}-${index}`}
                        className="flex items-center gap-3 rounded-lg border border-border/70 bg-muted/20 px-3 py-2"
                      >
                        <FileText className="size-4 shrink-0 text-muted-foreground" />
                        <span className="min-w-0 flex-1 truncate text-[13px]">
                          {file.name}
                        </span>
                        <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                          {formatBytes(file.size)}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7 text-muted-foreground hover:text-foreground"
                          aria-label={t("newTicket.removeFile", {
                            name: file.name,
                          })}
                          disabled={isSubmitting}
                          onClick={() =>
                            setFiles((current) =>
                              current.filter(
                                (_, position) => position !== index,
                              ),
                            )
                          }
                        >
                          <X className="size-3.5" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>

              {error ? (
                <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-[13px] text-destructive">
                  {error}
                </p>
              ) : null}

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-5">
                <p className="text-xs text-muted-foreground">
                  {t("newTicket.defaults")}
                </p>
                <Button type="submit" className="gap-2" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                  {progress ?? t("newTicket.create")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="rounded-2xl border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                {t("newTicket.goodTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-[13px] leading-6 text-muted-foreground">
                {[t("newTicket.goodOne"), t("newTicket.goodTwo"), t("newTicket.goodThree")].map(
                  (item) => (
                    <li key={item} className="flex gap-2.5">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                      {item}
                    </li>
                  ),
                )}
              </ul>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                {t("newTicket.afterTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[13px] leading-6 text-muted-foreground">
                {t("newTicket.afterBody")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
