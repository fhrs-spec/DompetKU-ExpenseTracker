"use client";

import * as React from "react";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { parseTransactionAction } from "@/app/actions/ai";
import { ParsedAITransaction } from "@/lib/ai/parse-transaction";
import { Button } from "@/components/ui/button";

interface AiQuickInputProps {
  onParsed: (data: ParsedAITransaction) => void;
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

  const handleParse = async (textToParse?: string) => {
    const text = textToParse || prompt;
    if (!text.trim()) {
      toast.error("Tulis kalimat transaksi terlebih dahulu.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await parseTransactionAction(text);
      if (res.success && res.data) {
        onParsed(res.data);
        toast.success(`Berhasil mengekstrak: ${res.data.title}`);
        setPrompt("");
      } else {
        toast.error(res.error || "Gagal mengekstrak data transaksi.");
      }
    } catch {
      toast.error("Terjadi kendala saat menghubungkan ke AI.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isLoading) {
      e.preventDefault();
      handleParse();
    }
  };

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/[0.03] dark:bg-primary/[0.05] p-4 space-y-3 transition-colors">
      <div className="flex items-center gap-2 text-xs font-semibold text-primary">
        <Sparkles className="h-4 w-4" />
        <span>Catat Cepat dengan AI (Gemini Flash)</span>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || isLoading}
            placeholder="Ketik kalimat bebas (cth: Beli kopi kenangan 22rb tadi siang)..."
            className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all disabled:opacity-50"
          />
        </div>

        <Button
          type="button"
          onClick={() => handleParse()}
          disabled={disabled || isLoading || !prompt.trim()}
          size="sm"
          className="shrink-0 gap-1.5 h-10 px-4"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Memproses...</span>
            </>
          ) : (
            <>
              <span>Ekstrak</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </Button>
      </div>

      {/* Quick sample chips */}
      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
        <span className="text-[11px] text-muted-foreground">Contoh:</span>
        {SAMPLE_PROMPTS.map((sample, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setPrompt(sample);
              handleParse(sample);
            }}
            disabled={disabled || isLoading}
            className="text-[11px] rounded-lg border border-border bg-card hover:bg-muted/80 px-2 py-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            &ldquo;{sample}&rdquo;
          </button>
        ))}
      </div>
    </div>
  );
}
