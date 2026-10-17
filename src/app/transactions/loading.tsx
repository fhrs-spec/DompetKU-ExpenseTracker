import { AppLayout } from "@/components/layout/app-layout";

export default function TransactionsLoading() {
  return (
    <AppLayout>
      <div className="space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-44 bg-muted rounded-lg" />
            <div className="h-4 w-64 bg-muted/60 rounded-md" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-28 bg-muted rounded-lg" />
            <div className="h-10 w-36 bg-muted rounded-lg" />
          </div>
        </div>

        {/* AI Quick Input Bar Skeleton */}
        <div className="h-20 w-full bg-card/40 border border-border/50 rounded-2xl p-4" />

        {/* Filter & Search Controls Skeleton */}
        <div className="p-4 rounded-2xl border border-border/50 bg-card/40 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="h-10 flex-1 bg-muted/60 rounded-lg" />
            <div className="h-10 w-36 bg-muted/60 rounded-lg" />
            <div className="h-10 w-36 bg-muted/60 rounded-lg" />
          </div>
        </div>

        {/* Transaction List Skeleton */}
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl border border-border/50 bg-card/40 flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div className="h-10 w-10 rounded-full bg-muted/60" />
                <div className="space-y-2">
                  <div className="h-4 w-36 bg-muted rounded" />
                  <div className="h-3 w-24 bg-muted/50 rounded" />
                </div>
              </div>
              <div className="space-y-2 text-right">
                <div className="h-5 w-28 bg-muted rounded ml-auto" />
                <div className="h-3 w-16 bg-muted/50 rounded ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
