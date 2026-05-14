import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Eye, Scale, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_layout/about")({
  head: () => ({ meta: [{ title: "Responsible AI — AI Productivity Assistant" }] }),
  component: AboutPage,
});

const principles = [
  {
    icon: Eye,
    title: "Human review",
    text: "AI-generated outputs should be reviewed before professional use. Treat them as drafts.",
  },
  {
    icon: Scale,
    title: "Fair & inclusive",
    text: "We instruct the model to avoid biased, harmful or discriminatory content and refuse unsafe requests.",
  },
  {
    icon: Lock,
    title: "Privacy first",
    text: "Your inputs are sent to the AI provider only to produce the response. We do not persist them.",
  },
  {
    icon: ShieldCheck,
    title: "Validation",
    text: "Inputs are validated client and server-side to keep prompts safe and within sensible limits.",
  },
];

function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">About & Responsible AI</h1>
        <p className="text-muted-foreground">
          AI Productivity Assistant is a workplace productivity suite powered by modern LLMs. We
          believe AI should augment professional judgment — never replace it.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {principles.map((p) => (
          <Card key={p.title} className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <p.icon className="h-4 w-4" />
                </span>
                {p.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{p.text}</CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-primary/20 bg-accent/30">
        <CardContent className="p-5 text-sm">
          <strong className="text-foreground">Disclaimer:</strong>{" "}
          AI-generated outputs may contain inaccuracies or inappropriate suggestions. Always review
          and edit results before using them in any professional, legal, financial or HR context.
        </CardContent>
      </Card>
    </div>
  );
}