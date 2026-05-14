import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { FileText, Loader2, Sparkles, ListChecks, Gavel, Clock, Users } from "lucide-react";
import { summarizeMeeting, type MeetingSummary } from "@/lib/ai.functions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Disclaimer } from "@/components/disclaimer";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_layout/summarize")({
  head: () => ({ meta: [{ title: "Meeting Summarizer — AI Productivity Assistant" }] }),
  component: SummarizePage,
});

function SummarizePage() {
  const fn = useServerFn(summarizeMeeting);
  const [notes, setNotes] = useState("");
  const mutation = useMutation({
    mutationFn: () => fn({ data: { notes } }),
    onError: (e: Error) => toast.error(e.message || "Failed to summarize"),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (notes.trim().length < 20) {
      toast.error("Please paste at least 20 characters of notes");
      return;
    }
    mutation.mutate();
  };

  const s = mutation.data?.summary as MeetingSummary | undefined;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" /> Meeting Notes Summarizer
        </h1>
        <p className="text-sm text-muted-foreground">
          Paste raw notes — get key points, decisions, action items and deadlines.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Meeting notes</CardTitle>
          <CardDescription>Paste from Zoom, Google Meet, Notion, anywhere.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={onSubmit}>
            <Textarea
              rows={10}
              maxLength={20000}
              placeholder="Paste your meeting notes here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">{notes.length} / 20000</span>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Summarizing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" /> Summarize
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {s && (
        <div className="grid gap-5 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <SummarySection icon={ListChecks} title="Key points" items={s.keyPoints} />
          <SummarySection icon={Gavel} title="Decisions made" items={s.decisions} />
          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" /> Action items
              </CardTitle>
            </CardHeader>
            <CardContent>
              {s.actionItems?.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="py-2 pr-4">Task</th>
                        <th className="py-2 pr-4">Owner</th>
                        <th className="py-2">Deadline</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {s.actionItems.map((a, i) => (
                        <tr key={i}>
                          <td className="py-2 pr-4">{a.task}</td>
                          <td className="py-2 pr-4">
                            <Badge variant="secondary">{a.owner || "Unassigned"}</Badge>
                          </td>
                          <td className="py-2 text-muted-foreground">{a.deadline || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No action items detected.</p>
              )}
            </CardContent>
          </Card>
          <SummarySection icon={Clock} title="Deadlines" items={s.deadlines} className="md:col-span-2" />
          <div className="md:col-span-2">
            <Disclaimer />
          </div>
        </div>
      )}
    </div>
  );
}

function SummarySection({
  icon: Icon,
  title,
  items,
  className = "",
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: string[];
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items?.length ? (
          <ul className="space-y-2 text-sm">
            {items.map((it, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>{it}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">None detected.</p>
        )}
      </CardContent>
    </Card>
  );
}