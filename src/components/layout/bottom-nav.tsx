"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Plus,
  PieChart,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { TransactionForm } from "@/components/transactions/transaction-form";

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isQuickAddOpen, setIsQuickAddOpen] = React.useState(false);

  const navItems = [
    {
      label: "Beranda",
      href: "/dashboard",
      icon: LayoutDashboard,
      isActive: pathname === "/dashboard",
    },
    {
      label: "Transaksi",
      href: "/transactions",
      icon: ArrowLeftRight,
      isActive: pathname.startsWith("/transactions") && pathname !== "/transactions/add",
    },
    // Center Action: Elevated FAB Quick Add
    {
      label: "Catat",
      isAction: true,
      icon: Plus,
    },
    {
      label: "Analitik",
      href: "/analytics",
      icon: PieChart,
      isActive: pathname === "/analytics",
    },
    {
      label: "Target",
      href: "/goals",
      icon: Target,
      isActive: pathname === "/goals",
    },
  ];

  return (
    <>
      <nav
        aria-label="Navigasi Bawah Mobile"
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-card/95 backdrop-blur-lg border-t border-border shadow-[0_-4px_16px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_16px_rgba(0,0,0,0.25)] pb-[env(safe-area-inset-bottom)]"
      >
        <div className="flex items-center justify-around h-16 px-2 max-w-md mx-auto">
          {navItems.map((item, index) => {
            if (item.isAction) {
              return (
                <div key="fab-quick-add" className="flex flex-col items-center relative -top-3">
                  <button
                    type="button"
                    onClick={() => setIsQuickAddOpen(true)}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 border-4 border-background active:scale-90 transition-transform cursor-pointer"
                    aria-label="Catat transaksi cepat"
                    title="Catat transaksi cepat"
                  >
                    <Plus className="h-6 w-6 stroke-[2.5]" />
                  </button>
                  <span className="text-[10px] font-semibold text-primary mt-0.5">
                    Catat
                  </span>
                </div>
              );
            }

            const Icon = item.icon;
            const active = item.isActive;

            return (
              <Link
                key={item.href || index}
                href={item.href!}
                className={cn(
                  "flex flex-col items-center justify-center w-14 py-1 text-center transition-colors rounded-lg active:scale-95",
                  active
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground font-medium"
                )}
              >
                <div className="relative">
                  <Icon className={cn("h-5 w-5 transition-transform", active && "scale-110")} />
                  {active && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />
                  )}
                </div>
                <span className="text-[10px] mt-1 tracking-tight truncate max-w-[56px]">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Global Mobile Quick Add Modal */}
      <Modal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        title="Catat Transaksi Cepat"
        description="Pindai struk atau ketik transaksi langsung ke akun Anda."
      >
        <TransactionForm
          onSuccess={() => {
            setIsQuickAddOpen(false);
            router.refresh();
          }}
          onCancel={() => setIsQuickAddOpen(false)}
        />
      </Modal>
    </>
  );
}
