"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet, Plus, Menu, X, LogOut, Crown } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/app/auth/actions";
import { cn } from "@/lib/utils";
import { isAppOwner } from "@/lib/auth/admin";

interface AppHeaderProps {
  userName?: string;
  userEmail?: string;
}

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Transaksi", href: "/transactions" },
  { name: "Analitik Bulanan", href: "/analytics" },
  { name: "Target Tabungan", href: "/goals" },
];

export function AppHeader({ userName, userEmail }: AppHeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Close mobile menu on path change or Escape key
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    if (mobileMenuOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border bg-card/80 px-4 sm:px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden rounded-lg p-2 text-muted-foreground hover:bg-muted"
          aria-label="Buka menu navigasi"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Mobile brand */}
        <Link href="/dashboard" className="flex md:hidden items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-soft">
            <Wallet className="h-4 w-4" />
          </div>
          <span className="font-bold text-foreground">
            Dompet<span className="text-primary">KU</span>
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-2.5">
        <Link href="/transactions/add">
          <Button size="sm" className="gap-1.5 shadow-soft">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Catat Transaksi</span>
            <span className="sm:hidden">Catat</span>
          </Button>
        </Link>

        <ThemeToggle />
      </div>

      {/* Mobile Drawer Backdrop & Menu */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 top-16 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-x-0 top-16 z-50 border-b border-border bg-card p-4 shadow-xl md:hidden">
            <div className="mb-4 pb-3 border-b border-border">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-foreground">{userName || "Pengguna"}</p>
                {isAppOwner(userEmail) && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0">
                    <Crown className="h-2.5 w-2.5 text-amber-500 fill-amber-500" />
                    Owner
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{userEmail || ""}</p>
            </div>

            <nav className="flex flex-col space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-4 pt-3 border-t border-border">
              <form action={logoutAction}>
                <Button
                  variant="ghost"
                  type="submit"
                  size="sm"
                  className="w-full justify-start text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Keluar dari Akun
                </Button>
              </form>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
