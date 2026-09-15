import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import {
  Globe,
  Inbox,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  MessageSquarePlus,
} from "lucide-react";
import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router";

const PRIMARY_NAV: {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}[] = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/dashboard/tickets", label: "Tickets", icon: Inbox },
];

const CUSTOMER_NAV: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/submit", label: "Ticket form", icon: MessageSquarePlus },
  { to: "/", label: "Public site", icon: Globe },
];

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <LifeBuoy className="size-[18px]" />
      </span>
      <span className="leading-tight">
        <span className="block text-[15px] font-semibold tracking-tight">
          Relay
        </span>
        <span className="block text-[11px] font-medium text-muted-foreground">
          Support desk
        </span>
      </span>
    </div>
  );
}

function navClass({ isActive }: { isActive: boolean }) {
  return cn(
    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
    isActive
      ? "bg-card text-foreground shadow-sm ring-1 ring-border/70"
      : "hover:bg-sidebar-accent",
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

  const name = user?.name?.trim() || user?.email || "Agent";
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
    <div className="flex min-h-screen bg-secondary/35">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-6 border-r border-border/70 bg-sidebar px-4 py-5 lg:flex">
        <NavLink to="/" className="px-1 py-1">
          <Brand />
        </NavLink>

        <nav className="flex flex-col gap-1">
          {PRIMARY_NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
              <item.icon className="size-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex flex-col gap-1">
          <p className="px-3 pb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80">
            Customer-facing
          </p>
          {CUSTOMER_NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end className={navClass}>
              <item.icon className="size-4" />
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="mt-auto rounded-xl border border-border/70 bg-card p-3 shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {initials || "A"}
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
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
          <div className="flex flex-col gap-3 px-4 py-4 sm:px-8">
            <div className="flex items-center justify-between gap-3 lg:hidden">
              <NavLink to="/">
                <Brand />
              </NavLink>
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

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
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
              {[...PRIMARY_NAV, ...CUSTOMER_NAV].map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end
                  className={({ isActive }) =>
                    cn(
                      "flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted",
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
