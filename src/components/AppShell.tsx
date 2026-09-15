import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Layers,
  LogOut,
  Plus,
  ShieldCheck,
  SquareStack,
} from "lucide-react";
import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router";

const NAV: {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/catalog", label: "Catalog", icon: Layers },
  { to: "/admin", label: "Admin", icon: ShieldCheck },
];

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-9 items-center justify-center rounded-xl border border-border/80 bg-card text-primary">
        <SquareStack className="size-[18px]" />
      </span>
      <span className="leading-tight">
        <span className="block text-[15px] font-semibold tracking-tight">
          Intake
        </span>
        <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Internal ticketing
        </span>
      </span>
    </div>
  );
}

function navClass({ isActive }: { isActive: boolean }) {
  return cn(
    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-primary/10 text-primary ring-1 ring-primary/20"
      : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground",
  );
}

export function AppShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const name = user?.name?.trim() || user?.email || "Teammate";
  const initials = name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-6 border-r border-sidebar-border bg-sidebar px-4 py-5 lg:flex">
        <NavLink to="/dashboard" className="px-1 py-1">
          <Brand />
        </NavLink>

        <Button asChild className="w-full justify-start gap-2">
          <NavLink to="/new">
            <Plus className="size-4" />
            New ticket
          </NavLink>
        </Button>

        <nav className="flex flex-col gap-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={navClass}
            >
              <item.icon className="size-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-3">
          <p className="px-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
            {user?.role === "admin" ? "Workspace owner" : "Workspace member"}
          </p>
          <div className="rounded-xl border border-sidebar-border bg-card/60 p-3">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/12 font-mono text-[11px] font-medium text-primary">
                {initials || "T"}
              </span>
              <span className="min-w-0 leading-tight">
                <span className="block truncate text-[13px] font-medium">
                  {name}
                </span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {user?.email ?? "Signed in"}
                </span>
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="mt-2 w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="size-4" />
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
          <div className="flex flex-col gap-3 px-4 py-4 sm:px-8">
            <div className="flex items-center justify-between gap-3 lg:hidden">
              <NavLink to="/dashboard">
                <Brand />
              </NavLink>
              <div className="flex items-center gap-1">
                <Button asChild size="sm" className="gap-1.5">
                  <NavLink to="/new">
                    <Plus className="size-4" />
                    New
                  </NavLink>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleSignOut}
                  aria-label="Sign out"
                >
                  <LogOut className="size-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  {title}
                </h1>
                {description ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {description}
                  </p>
                ) : null}
              </div>
              {actions ? (
                <div className="flex flex-wrap items-center gap-2">{actions}</div>
              ) : null}
            </div>

            <nav className="-mb-1 flex gap-1 overflow-x-auto lg:hidden">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      "flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                        : "text-muted-foreground hover:bg-foreground/[0.04]",
                    )
                  }
                >
                  <item.icon className="size-3.5" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
