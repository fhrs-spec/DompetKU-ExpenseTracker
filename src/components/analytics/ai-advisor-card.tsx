"use client";

import * as React from "react";
import {
  Sparkles,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  ArrowRight,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getFinancialHealthCheckAction,
} from "@/app/actions/ai";
import { FinancialHealthAdvice } from "@/lib/ai/financial-advisor";
import { cn } from "@/lib/utils";

interface AiAdvisorCardProps {
  year: number;
  month: number;
  periodLabel: string;
}

export function AiAdvisorCard({ year, month, periodLabel }: AiAdvisorCardProps) {
  const [advice, setAdvice] = React.useState<FinancialHealthAdvice | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const cacheKey = `dompetku_ai_audit_${year}_${month}`;

  // Load cached audit if available
  React.useEffect(() => {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setAdvice(JSON.parse(cached));
      } else {
        setAdvice(null);
      }
    } catch {
      setAdvice(null);
    }
    setError(null);
  }, [cacheKey]);

  const handleRunAudit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await getFinancialHealthCheckAction(year, month);
      if (res.success && res.data) {
        setAdvice(res.data);
        try {
          localStorage.setItem(cacheKey, JSON.stringify(res.data));
        } catch {
          // localStorage might be unavailable/full
        }
      } else {
        setError(res.error || "Gagal memperoleh audit dari AI.");
      }
    } catch {
      setError("Terjadi kendala jaringan saat menghubungi AI.");
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) {
      return {
        bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
        border: "border-emerald-500/30",
        text: "text-emerald-600 dark:text-emerald-400",
        ring: "ring-emerald-500/20",
        badge: "success" as const,
      };
    }
    if (score >= 50) {
      return {
        bg: "bg-amber-500/10 dark:bg-amber-500/20",
        border: "border-amber-500/30",
        text: "text-amber-600 dark:text-amber-400",
        ring: "ring-amber-500/20",
        badge: "secondary" as const,
      };
    }
    return {
      bg: "bg-destructive/10 dark:bg-destructive/20",
      border: "border-destructive/30",
      text: "text-destructive",
      ring: "ring-destructive/20",
      badge: "destructive" as const,
    };
  };

  return (
    <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/[0.03] p-6 shadow-card relative overflow-hidden">
      {/* Decorative gradient blur in corner */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-soft">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-foreground">
                Audit Kesehatan Keuangan AI
              </h2>
              <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                <Zap className="h-3 w-3" /> Gemini
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Evaluasi arus kas otomatis dan rekomendasi finansial taktis untuk {periodLabel}.
            </p>
          </div>
        </div>

        <Button
          onClick={handleRunAudit}
          disabled={isLoading}
          variant={advice ? "outline" : "default"}
          size="sm"
          className="gap-2 shrink-0 self-start sm:self-auto shadow-soft font-medium"
        >
          <RefreshCw
            className={cn("h-3.5 w-3.5", isLoading && "animate-spin text-primary")}
          />
          <span>{isLoading ? "Menganalisis..." : advice ? "Audit Ulang" : "Jalankan Audit AI"}</span>
        </Button>
      </div>

      {/* Error notification */}
      {error && (
        <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Initial Empty Callout State */}
      {!advice && !isLoading && !error && (
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-dashed border-border p-5 bg-muted/30">
          <div className="space-y-1 text-center sm:text-left">
            <p className="text-sm font-medium text-foreground">
              Belum ada evaluasi untuk periode {periodLabel}
            </p>
            <p className="text-xs text-muted-foreground max-w-lg">
              Klik tombol &quot;Jalankan Audit AI&quot; di atas untuk menganalisis rasio tabungan, mendeteksi potensi kebocoran pos pengeluaran, dan mendapatkan saran alokasi dana darurat secara instan.
            </p>
          </div>
          <Button
            onClick={handleRunAudit}
            size="sm"
            className="gap-2 shrink-0 shadow-soft"
          >
            <Sparkles className="h-4 w-4" />
            <span>Mulai Evaluasi</span>
          </Button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="mt-6 space-y-4 animate-pulse">
          <div className="h-20 rounded-xl bg-muted/60" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-32 rounded-xl bg-muted/50" />
            <div className="h-32 rounded-xl bg-muted/50" />
          </div>
        </div>
      )}

      {/* Audit Result Display */}
      {advice && !isLoading && (
        <div className="mt-6 space-y-6">
          {/* Health Score & Summary Banner */}
          {(() => {
            const scoreStyles = getScoreColor(advice.healthScore);
            return (
              <div
                className={cn(
                  "flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-xl p-4 border transition-all",
                  scoreStyles.bg,
                  scoreStyles.border
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl font-bold text-2xl border shadow-soft",
                      scoreStyles.bg,
                      scoreStyles.border,
                      scoreStyles.text
                    )}
                  >
                    {advice.healthScore}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Skor Kesehatan
                      </span>
                      <Badge variant={scoreStyles.badge}>{advice.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {advice.healthScore >= 75
                        ? "Arus kas Anda berada di zona aman dan terkendali."
                        : advice.healthScore >= 50
                        ? "Ada beberapa pos yang berpotensi membebani tabungan."
                        : "Perhatian mendesak dibutuhkan untuk menyeimbangkan arus kas."}
                    </p>
                  </div>
                </div>

                <div className="sm:ml-auto text-xs text-foreground/90 font-medium sm:max-w-md bg-background/50 backdrop-blur-sm p-3 rounded-lg border border-border/40">
                  {advice.summary}
                </div>
              </div>
            );
          })()}

          {/* Key Findings & Recommendations Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Key Findings */}
            <div className="rounded-xl border border-border/80 bg-card p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span>Temuan Arus Kas & Kebocoran</span>
              </div>
              <ul className="space-y-2.5">
                {advice.keyFindings.map((finding, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs text-muted-foreground leading-relaxed"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                    <span className="text-foreground/90">{finding}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actionable Recommendations */}
            <div className="rounded-xl border border-border/80 bg-card p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <span>Rekomendasi Aksi Konkret</span>
              </div>
              <ul className="space-y-2.5">
                {advice.recommendations.map((rec, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs text-muted-foreground leading-relaxed"
                  >
                    <ArrowRight className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                    <span className="text-foreground/90">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
