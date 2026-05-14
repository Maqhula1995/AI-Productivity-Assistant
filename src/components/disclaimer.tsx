import { ShieldAlert } from "lucide-react";

export function Disclaimer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-start gap-2 rounded-lg border border-border/60 bg-accent/40 px-3 py-2 text-xs text-muted-foreground ${className}`}
    >
      <ShieldAlert className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
      <span>AI-generated outputs should be reviewed before professional use.</span>
    </div>
  );
}