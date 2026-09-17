"use client";

import * as React from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { parseTransactionAction } from "@/app/actions/ai";
import { ParsedAITransaction } from "@/lib/ai/parse-transaction";
import { Button } from "@/components/ui/button";

interface AiQuickInputProps {
  onParsed: (data: ParsedAITransaction) => void;
  onDirectSave?: (data: ParsedAITransaction) => Promise<boolean>;
  disabled?: boolean;
}

const SAMPLE_PROMPTS = [
  "Makan siang nasi padang 35rb",
  "Bensin pertamax 50rb kemarin",
  "Gaji bulanan 5jt dari kantor",
  "Bayar tagihan listrik 180rb",
];

export function AiQuickInput({ onParsed, disabled }: AiQuickInputProps) {
  const [prompt, setPrompt] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleAction = async (textOverride?: string) => {
    const text = textOverride || prompt;
    const trimmed = text.trim();
    if (!trimmed) {
      toast.error("Tulis kalimat transaksi terlebih dahulu.");
      return;
    }
    if (trimmed.length > 500) {
      toast.error("Kalimat transaksi terlalu panjang (maksimal 500 karakter).");
      return;
    }

    setIsLoading(true);
    try {
      const res = await parseTransactionAction(trimmed);
      if (!res.success || !res.data) {
        toast.error(res.error || "Gagal mengekstrak data transaksi.");
        return;
      }

      // Enforce human-in-the-loop review for all parsed entries to prevent unreviewed prompt injection DB commits (P0-3)
      onParsed(res.data);
      setPrompt("");
      toast.success(
        `Data "${res.data.title}" berhasil diekstrak! Tinjau dan klik "Simpan Transaksi" untuk memasukkan ke database.`
      );
    } catch {
      toast.error("Terjadi kendala saat menghubungkan ke AI.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isLoading) {
      e.preventDefault();
      handleAction();
    }
  };

  return (
    <div className="rounded-xl sm:rounded-2xl border border-primary/20 bg-primary/[0.03] dark:bg-primary/[0.05] p-2.5 sm:p-3.5 space-y-2 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Catat Cepat dengan AI</span>
        </div>
        <span className="text-[10px] text-muted-foreground">
          Gemini Flash
        </span>
      </div>

      {/* Integrated search-bar style input */}
      <div className="relative flex items-center">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isLoading}
          aria-label="Kalimat transaksi untuk AI"
          placeholder="Cth: Beli kopi kenangan 22rb tadi siang..."
          className="w-full rounded-lg sm:rounded-xl border border-border bg-card pl-3 pr-24 sm:pr-28 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all disabled:opacity-50"
        />

        <div className="absolute right-1 flex items-center">
          <Button
            type="button"
            onClick={() => handleAction()}
            disabled={disabled || isLoading || !prompt.trim()}
            size="sm"
            className="h-7 sm:h-8 px-2.5 text-[11px] sm:text-xs gap-1 shadow-soft bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-md sm:rounded-lg"
            title="Ekstrak data transaksi dengan AI ke formulir untuk ditinjau"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Mengekstrak...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3" />
                <span>Ekstrak</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Swipeable quick sample chips in a single horizontal row */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-0.5 px-0.5 scroll-smooth">
        <span className="text-[10px] sm:text-[11px] text-muted-foreground shrink-0 font-medium">Contoh:</span>
        {SAMPLE_PROMPTS.map((sample, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setPrompt(sample);
              handleAction(sample);
            }}
            disabled={disabled || isLoading}
            className="text-[10px] sm:text-[11px] whitespace-nowrap shrink-0 rounded-md sm:rounded-lg border border-border/80 bg-card hover:bg-muted/80 px-2 py-0.5 text-muted-foreground hover:text-foreground transition-all cursor-pointer active:scale-95"
          >
            &ldquo;{sample}&rdquo;
          </button>
        ))}
      </div>
    </div>
  );
}
