import { AppLayout } from "@/components/layout/app-layout";

export default function GoalsLoading() {
  return (
    <AppLayout>
      <div className="space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-muted rounded-lg" />
            <div className="h-4 w-72 bg-muted/60 rounded-md" />
          </div>
          <div className="h-10 w-40 bg-muted rounded-lg" />
        </div>

        {/* Summary Card Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl border border-border/50 bg-card/40 space-y-2"
            >
              <div className="h-4 w-28 bg-muted/70 rounded" />
              <div className="h-7 w-32 bg-muted rounded-lg" />
            </div>
          ))}
        </div>

        {/* Goals Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, j) => (
            <div
              key={j}
              className="p-6 rounded-2xl border border-border/50 bg-card/40 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="h-5 w-36 bg-muted rounded" />
                <div className="h-6 w-16 bg-muted/60 rounded-full" />
              </div>
              <div className="h-7 w-40 bg-muted rounded-lg" />
              <div className="h-2.5 w-full bg-muted/40 rounded-full" />
              <div className="flex justify-between items-center pt-2">
                <div className="h-4 w-24 bg-muted/50 rounded" />
                <div className="h-8 w-24 bg-muted/60 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
