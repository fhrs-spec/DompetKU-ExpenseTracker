import { AppLayout } from "@/components/layout/app-layout";

export default function DashboardLoading() {
  return (
    <AppLayout>
      <div className="space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-muted rounded-lg" />
            <div className="h-4 w-72 bg-muted/60 rounded-md" />
          </div>
          <div className="h-10 w-32 bg-muted rounded-lg" />
        </div>

        {/* 4 Balance Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl border border-border/50 bg-card/40 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 bg-muted/70 rounded" />
                <div className="h-9 w-9 bg-muted/60 rounded-xl" />
              </div>
              <div className="h-7 w-36 bg-muted rounded-lg" />
              <div className="h-3 w-20 bg-muted/50 rounded" />
            </div>
          ))}
        </div>

        {/* Chart & Recent Activity Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-w-0">
          <div className="lg:col-span-7 rounded-2xl border border-border/50 bg-card/40 p-6 space-y-4">
            <div className="h-5 w-40 bg-muted rounded" />
            <div className="h-64 w-full bg-muted/40 rounded-xl" />
          </div>
          <div className="lg:col-span-5 rounded-2xl border border-border/50 bg-card/40 p-6 space-y-4">
            <div className="h-5 w-36 bg-muted rounded" />
            <div className="space-y-3">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="h-12 w-full bg-muted/40 rounded-xl" />
              ))}
            </div>
          </div>
        </div>

        {/* Goals Preview Skeleton */}
        <div className="rounded-2xl border border-border/50 bg-card/40 p-6 space-y-4">
          <div className="h-5 w-36 bg-muted rounded" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, k) => (
              <div key={k} className="h-24 bg-muted/40 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
