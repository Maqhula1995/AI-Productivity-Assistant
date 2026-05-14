import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, Check, Loader2, Mail, Sparkles } from "lucide-react";
import { generateEmail } from "@/lib/ai.functions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Disclaimer } from "@/components/disclaimer";

export const Route = createFileRoute("/_layout/email")({
  head: () => ({
    meta: [{ title: "Email Generator — AI Productivity Assistant" }],
  }),
  component: EmailPage,
});

function EmailPage() {
  const fn = useServerFn(generateEmail);
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState<"formal" | "informal" | "persuasive" | "friendly" | "apologetic">(
    "formal",
  );
  const [purpose, setPurpose] = useState("");
  const [details, setDetails] = useState("");
  const [copied, setCopied] = useState(false);

  const mutation = useMutation({
    mutationFn: () => fn({ data: { audience, tone, purpose, details } }),
    onError: (e: Error) => toast.error(e.message || "Failed to generate email"),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!audience.trim() || !purpose.trim()) {
      toast.error("Audience and purpose are required");
      return;
    }
    mutation.mutate();
  };

  const onCopy = async () => {
    if (!mutation.data?.email) return;
    await navigator.clipboard.writeText(mutation.data.email);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight flex items-center gap-2">
          <Mail className="h-6 w-6 text-primary" /> Smart Email Generator
        </h1>
        <p className="text-sm text-muted-foreground">
          Compose professional emails with the right audience, tone and intent.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Email brief</CardTitle>
            <CardDescription>Tell the AI what you need.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="audience">Audience</Label>
                <Input
                  id="audience"
                  maxLength={200}
                  placeholder="e.g. My manager, the marketing team..."
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Tone</Label>
                <Select value={tone} onValueChange={(v) => setTone(v as typeof tone)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="informal">Informal</SelectItem>
                    <SelectItem value="persuasive">Persuasive</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="apologetic">Apologetic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose</Label>
                <Input
                  id="purpose"
                  maxLength={500}
                  placeholder="e.g. Request a deadline extension"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="details">Additional details</Label>
                <Textarea
                  id="details"
                  rows={5}
                  maxLength={2000}
                  placeholder="Context, dates, names, key points to include..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={mutation.isPending} className="w-full">
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" /> Generate email
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:sticky lg:top-20 h-fit">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Generated email</CardTitle>
              <CardDescription>Review before sending.</CardDescription>
            </div>
            {mutation.data?.email && (
              <Button size="sm" variant="outline" onClick={onCopy}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="ml-1.5">{copied ? "Copied" : "Copy"}</span>
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="min-h-[260px] whitespace-pre-wrap rounded-lg border border-border/60 bg-muted/40 p-4 text-sm leading-relaxed">
              {mutation.isPending ? (
                <span className="text-muted-foreground">Drafting your email...</span>
              ) : mutation.data?.email ? (
                mutation.data.email
              ) : (
                <span className="text-muted-foreground">
                  Your generated email will appear here.
                </span>
              )}
            </div>
            <Disclaimer />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}