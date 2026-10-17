import { AppLayout } from "@/components/layout/app-layout";

export default function AnalyticsLoading() {
  return (
    <AppLayout>
      <div className="space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-muted rounded-lg" />
            <div className="h-4 w-72 bg-muted/60 rounded-md" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-44 bg-muted rounded-lg" />
            <div className="h-10 w-32 bg-muted rounded-lg" />
          </div>
        </div>

        {/* AI Advisor Card Skeleton */}
        <div className="p-6 rounded-2xl border border-primary/20 bg-primary/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-6 w-52 bg-primary/20 rounded-md" />
            <div className="h-7 w-24 bg-primary/20 rounded-full" />
          </div>
          <div className="h-14 w-full bg-primary/10 rounded-xl" />
        </div>

        {/* 4 Stats Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl border border-border/50 bg-card/40 space-y-3"
            >
              <div className="h-4 w-28 bg-muted/70 rounded" />
              <div className="h-7 w-36 bg-muted rounded-lg" />
              <div className="h-3 w-20 bg-muted/50 rounded" />
            </div>
          ))}
        </div>

        {/* Charts Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-w-0">
          <div className="lg:col-span-6 rounded-2xl border border-border/50 bg-card/40 p-6 space-y-4">
            <div className="h-5 w-48 bg-muted rounded" />
            <div className="h-64 w-full bg-muted/40 rounded-xl" />
          </div>
          <div className="lg:col-span-6 rounded-2xl border border-border/50 bg-card/40 p-6 space-y-4">
            <div className="h-5 w-48 bg-muted rounded" />
            <div className="h-64 w-full bg-muted/40 rounded-xl" />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
