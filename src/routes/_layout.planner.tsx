import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarClock, Loader2, Sparkles, Lightbulb } from "lucide-react";
import { planSchedule, type Schedule } from "@/lib/ai.functions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Disclaimer } from "@/components/disclaimer";

export const Route = createFileRoute("/_layout/planner")({
  head: () => ({ meta: [{ title: "Task Planner — AI Productivity Assistant" }] }),
  component: PlannerPage,
});

const priorityColor: Record<"high" | "medium" | "low", string> = {
  high: "bg-destructive text-destructive-foreground",
  medium: "bg-primary text-primary-foreground",
  low: "bg-secondary text-secondary-foreground",
};

function PlannerPage() {
  const fn = useServerFn(planSchedule);
  const [tasks, setTasks] = useState("");
  const [hours, setHours] = useState("9:00 AM - 5:00 PM");

  const mutation = useMutation({
    mutationFn: () => fn({ data: { tasks, hours } }),
    onError: (e: Error) => toast.error(e.message || "Failed to plan schedule"),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tasks.trim().length < 3 || !hours.trim()) {
      toast.error("Add tasks and working hours");
      return;
    }
    mutation.mutate();
  };

  const s = mutation.data?.schedule as Schedule | undefined;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight flex items-center gap-2">
          <CalendarClock className="h-6 w-6 text-primary" /> AI Task Planner
        </h1>
        <p className="text-sm text-muted-foreground">
          Drop in your tasks and working hours — receive a prioritized timeline.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Plan inputs</CardTitle>
            <CardDescription>One task per line works best.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="hours">Working hours</Label>
                <Input
                  id="hours"
                  value={hours}
                  maxLength={200}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="e.g. 9:00 AM - 5:00 PM"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tasks">Tasks</Label>
                <Textarea
                  id="tasks"
                  rows={8}
                  maxLength={4000}
                  value={tasks}
                  onChange={(e) => setTasks(e.target.value)}
                  placeholder={"- Finalize Q3 report\n- Review PRs\n- 1:1 with manager\n- Reply to client emails"}
                />
              </div>
              <Button type="submit" disabled={mutation.isPending} className="w-full">
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Planning...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" /> Build my day
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Today's timeline</CardTitle>
            <CardDescription>Time-blocked, priority-aware schedule.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!s && (
              <p className="text-sm text-muted-foreground">
                Your AI-generated daily schedule will appear here.
              </p>
            )}
            {s && s.blocks?.length > 0 && (
              <ol className="relative space-y-3 border-l border-border/60 pl-5">
                {s.blocks.map((b, i) => (
                  <li
                    key={i}
                    className="relative animate-in fade-in slide-in-from-left-1 duration-300"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <span className="absolute -left-[27px] top-2 h-3 w-3 rounded-full bg-[image:var(--gradient-primary)] ring-4 ring-background" />
                    <div className="rounded-lg border border-border/60 bg-card p-3 shadow-[var(--shadow-soft)]">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          {b.start} – {b.end}
                        </span>
                        <Badge className={priorityColor[b.priority] ?? priorityColor.medium}>
                          {b.priority}
                        </Badge>
                      </div>
                      <p className="mt-1 font-medium">{b.task}</p>
                      {b.note && <p className="mt-1 text-xs text-muted-foreground">{b.note}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            )}
            {s && s.tips?.length > 0 && (
              <div className="rounded-lg border border-border/60 bg-accent/40 p-4">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <Lightbulb className="h-4 w-4 text-primary" /> Productivity tips
                </h3>
                <ul className="space-y-1.5 text-sm">
                  {s.tips.map((t, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {s && <Disclaimer />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}