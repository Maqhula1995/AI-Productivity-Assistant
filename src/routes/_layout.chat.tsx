import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { MessageSquare, Send, Sparkles, User } from "lucide-react";
import { chatAssistant } from "@/lib/ai.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Disclaimer } from "@/components/disclaimer";

export const Route = createFileRoute("/_layout/chat")({
  head: () => ({ meta: [{ title: "AI Chatbot — AI Productivity Assistant" }] }),
  component: ChatPage,
});

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "How do I run a focused 30-minute deep work session?",
  "Tips for handling email overload?",
  "How to politely decline a meeting?",
  "Frameworks for prioritizing tasks?",
];

function ChatPage() {
  const fn = useServerFn(chatAssistant);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your AI productivity assistant. Ask me anything about workplace productivity, focus, planning, or communication.",
    },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const mutation = useMutation({
    mutationFn: (msgs: Msg[]) => fn({ data: { messages: msgs } }),
    onSuccess: (res) => setMessages((m) => [...m, { role: "assistant", content: res.reply }]),
    onError: (e: Error) => toast.error(e.message || "Chat failed"),
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, mutation.isPending]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (trimmed.length > 4000) {
      toast.error("Message too long");
      return;
    }
    const next: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    mutation.mutate(next.filter((m) => m.role === "user" || m.role === "assistant").slice(-20));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" /> AI Chatbot Assistant
        </h1>
        <p className="text-sm text-muted-foreground">
          Conversational helper for everyday workplace questions.
        </p>
      </header>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div ref={scrollRef} className="h-[55vh] overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((m, i) => (
              <Bubble key={i} msg={m} />
            ))}
            {mutation.isPending && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[image:var(--gradient-primary)]">
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="flex gap-1 rounded-2xl bg-muted px-4 py-3">
                  <Dot delay="0ms" />
                  <Dot delay="160ms" />
                  <Dot delay="320ms" />
                </div>
              </div>
            )}
          </div>

          {messages.length <= 1 && (
            <div className="border-t border-border/60 px-4 py-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={onSubmit}
            className="border-t border-border/60 bg-background p-3 flex items-end gap-2"
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={1}
              maxLength={4000}
              placeholder="Ask about productivity, planning, focus..."
              className="min-h-[44px] resize-none"
              disabled={mutation.isPending}
            />
            <Button type="submit" size="icon" disabled={mutation.isPending || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
      <Disclaimer />
    </div>
  );
}

function Bubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex items-start gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser ? "bg-secondary text-secondary-foreground" : "bg-[image:var(--gradient-primary)] text-primary-foreground"
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
      </div>
      <div
        className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-[var(--shadow-soft)] animate-in fade-in slide-in-from-bottom-1 duration-300 ${
          isUser ? "bg-primary text-primary-foreground" : "bg-card border border-border/60"
        }`}
      >
        {msg.content}
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="h-2 w-2 rounded-full bg-foreground/40 animate-bounce"
      style={{ animationDelay: delay, animationDuration: "1s" }}
    />
  );
}