import * as React from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { MobileBottomNav } from "@/components/layout/bottom-nav";

interface AppLayoutProps {
  children: React.ReactNode;
  userName?: string;
  userEmail?: string;
}

export function AppLayout({ children, userName, userEmail }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Desktop Sidebar */}
      <AppSidebar userName={userName} userEmail={userEmail} />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        <AppHeader userName={userName} userEmail={userEmail} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav />
    </div>
  );
}
