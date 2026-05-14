import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, FileText, CalendarClock, MessageSquare, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI Productivity Assistant" },
      { name: "description", content: "Your AI-powered workplace productivity dashboard." },
    ],
  }),
  component: Dashboard,
});

const tools = [
  {
    title: "Smart Email Generator",
    description: "Draft professional, on-tone emails in seconds.",
    href: "/email",
    icon: Mail,
  },
  {
    title: "Meeting Summarizer",
    description: "Turn raw notes into key points, decisions and action items.",
    href: "/summarize",
    icon: FileText,
  },
  {
    title: "AI Task Planner",
    description: "Get a prioritized daily schedule from your task list.",
    href: "/planner",
    icon: CalendarClock,
  },
  {
    title: "AI Chatbot Assistant",
    description: "Ask anything about workplace productivity.",
    href: "/chat",
    icon: MessageSquare,
  },
] as const;

function Dashboard() {
  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <section className="space-y-4">
        <Badge variant="secondary" className="gap-1">
          <Sparkles className="h-3 w-3" /> AI-powered workplace
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">
          Work smarter, not harder.
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          A unified suite of AI tools to help professionals write better emails, summarize meetings,
          plan their day, and answer productivity questions — all in one calm dashboard.
        </p>
      </section>

      <section className="grid gap-5 sm:grid-cols-2">
        {tools.map((t) => (
          <Link key={t.href} to={t.href} className="group">
            <Card className="h-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-elegant)] border-border/60">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-colors group-hover:bg-[image:var(--gradient-primary)] group-hover:text-primary-foreground">
                    <t.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">{t.title}</CardTitle>
                </div>
                <CardDescription className="pt-2">{t.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Open tool
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>

      <section className="rounded-xl border border-border/60 bg-card/60 p-5 text-sm text-muted-foreground shadow-[var(--shadow-soft)]">
        <strong className="text-foreground">Responsible AI:</strong> AI-generated outputs should be
        reviewed before professional use. We don't store your inputs.
      </section>
    </div>
  );
}
