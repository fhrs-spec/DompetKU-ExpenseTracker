"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Wallet,
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Target,
  LogOut,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { isAppOwner } from "@/lib/auth/admin";

const NAV_ITEMS = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Transaksi",
    href: "/transactions",
    icon: ArrowLeftRight,
  },
  {
    name: "Analitik Bulanan",
    href: "/analytics",
    icon: PieChart,
  },
  {
    name: "Target Tabungan",
    href: "/goals",
    icon: Target,
  },
];

interface AppSidebarProps {
  userEmail?: string;
  userName?: string;
}

export function AppSidebar({ userEmail, userName }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30 border-r border-border bg-card">
      {/* Brand Header */}
      <div className="flex h-16 items-center px-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft">
            <Wallet className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Dompet<span className="text-primary">KU</span>
          </span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 px-3 py-6">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-soft font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Footer Profile & Logout */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
            {(userName?.[0] || userEmail?.[0] || "U").toUpperCase()}
          </div>
          <div className="overflow-hidden flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-foreground truncate">
                {userName || "Pengguna"}
              </p>
              {isAppOwner(userEmail) && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0 shadow-soft">
                  <Crown className="h-2.5 w-2.5 text-amber-500 fill-amber-500" />
                  Owner
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {userEmail || ""}
            </p>
          </div>
        </div>

        <form action={logoutAction}>
          <Button
            variant="ghost"
            type="submit"
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Keluar
          </Button>
        </form>
      </div>
    </aside>
  );
}
