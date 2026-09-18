import { Link } from "@tanstack/react-router";
import { LayoutDashboard, FileText, CalendarCheck, Search, Menu, Sparkles } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/meeting-notes", label: "Meeting Notes", icon: FileText },
  { to: "/task-planner", label: "Task Planner", icon: CalendarCheck },
  { to: "/research", label: "Research Assistant", icon: Search },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: (() => void) | undefined }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          onClick={onNavigate}
          activeOptions={{ exact: to === "/" }}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          activeProps={{
            className: cn("bg-sidebar-accent text-sidebar-accent-foreground"),
          }}
        >
          <Icon className="size-4 shrink-0" />
          {label}
        </Link>
      ))}
    </nav>
  );
}

function SidebarBody({ onNavigate }: { onNavigate?: (() => void) | undefined }) {
  return (
    <div className="flex h-full flex-col gap-8 bg-sidebar p-5">
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Sparkles className="size-4" />
        </span>
        <div className="leading-tight">
          <p className="font-display text-sm font-semibold text-sidebar-primary">Northwork</p>
          <p className="text-xs text-sidebar-foreground/60">AI workplace assistant</p>
        </div>
      </div>
      <NavLinks onNavigate={onNavigate} />
      <p className="mt-auto text-[11px] leading-relaxed text-sidebar-foreground/50">
        Nothing you enter is saved. Everything clears when you close this tab.
      </p>
    </div>
  );
}

export function AppShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[17rem_1fr]">
      <aside className="sticky top-0 hidden h-screen lg:block">
        <SidebarBody />
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open navigation">
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 border-0 p-0">
              <SidebarBody onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <span className="font-display text-sm font-semibold">Northwork</span>
        </header>

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
          <div className="mx-auto w-full max-w-5xl">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
            </div>
            {children}
          </div>
        </main>

        <footer className="border-t border-border px-4 py-5 sm:px-6 lg:px-10">
          <p className="mx-auto max-w-5xl rounded-lg bg-muted px-4 py-3 text-xs leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">Responsible AI Disclaimer:</span>{" "}
            AI-generated content may contain errors. Always review and verify AI outputs before
            using them for important workplace decisions.
          </p>
        </footer>
      </div>
    </div>
  );
}
