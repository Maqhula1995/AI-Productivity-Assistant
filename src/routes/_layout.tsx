import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider, useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/_layout")({
  component: LayoutRoute,
});

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

function LayoutRoute() {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-[image:var(--gradient-subtle)]">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <header className="sticky top-0 z-30 h-14 flex items-center justify-between border-b border-border/60 bg-background/70 px-4 backdrop-blur">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                <span className="text-sm font-medium text-muted-foreground hidden sm:inline">
                  AI Productivity Assistant
                </span>
              </div>
              <ThemeToggle />
            </header>
            <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6 sm:py-10 animate-in fade-in duration-500">
              <Outlet />
            </main>
            <footer className="border-t border-border/60 px-6 py-3 text-xs text-muted-foreground">
              AI-generated outputs should be reviewed before professional use.
            </footer>
          </div>
        </div>
        <Toaster richColors position="top-right" />
      </SidebarProvider>
    </ThemeProvider>
  );
}