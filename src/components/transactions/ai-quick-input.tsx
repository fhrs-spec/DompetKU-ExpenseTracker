"use client";

import * as React from "react";
import { Sparkles, Loader2, Zap, FileEdit } from "lucide-react";
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

export function AiQuickInput({ onParsed, onDirectSave, disabled }: AiQuickInputProps) {
  const [prompt, setPrompt] = React.useState("");
  const [loadingAction, setLoadingAction] = React.useState<"fill" | "direct_save" | null>(null);

  const isLoading = loadingAction !== null;

  const handleAction = async (action: "fill" | "direct_save", textOverride?: string) => {
    const text = textOverride || prompt;
    if (!text.trim()) {
      toast.error("Tulis kalimat transaksi terlebih dahulu.");
      return;
    }

    setLoadingAction(action);
    try {
      const res = await parseTransactionAction(text);
      if (!res.success || !res.data) {
        toast.error(res.error || "Gagal mengekstrak data transaksi.");
        return;
      }

      if (action === "direct_save" && onDirectSave) {
        // Langsung simpan ke database Supabase
        const saved = await onDirectSave(res.data);
        if (saved) {
          setPrompt("");
        }
      } else {
        // Isi ke form untuk ditinjau
        onParsed(res.data);
        toast.info(
          `Data "${res.data.title}" masuk ke formulir. Klik "Simpan Transaksi" di bawah untuk menyimpan ke database.`
        );
      }
    } catch {
      toast.error("Terjadi kendala saat menghubungkan ke AI.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isLoading) {
      e.preventDefault();
      // Enter langsung simpan jika onDirectSave tersedia
      if (onDirectSave) {
        handleAction("direct_save");
      } else {
        handleAction("fill");
      }
    }
  };

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/[0.03] dark:bg-primary/[0.05] p-4 space-y-3 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-primary">
          <Sparkles className="h-4 w-4" />
          <span>Catat Cepat dengan AI (Gemini Flash)</span>
        </div>
        <span className="text-[11px] text-muted-foreground hidden sm:inline">
          Otomatis simpan ke database
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || isLoading}
            placeholder="Ketik kalimat (cth: Beli kopi kenangan 22rb tadi siang)..."
            className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all disabled:opacity-50"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleAction("fill")}
            disabled={disabled || isLoading || !prompt.trim()}
            size="sm"
            className="h-10 px-3 text-xs gap-1.5"
            title="Isi formulir di bawah untuk diperiksa/diedit terlebih dahulu"
          >
            {loadingAction === "fill" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FileEdit className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <span>Isi Form</span>
          </Button>

          <Button
            type="button"
            onClick={() => handleAction("direct_save")}
            disabled={disabled || isLoading || !prompt.trim()}
            size="sm"
            className="h-10 px-3.5 text-xs gap-1.5 shadow-soft bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            title="Ekstrak dan langsung simpan ke database"
          >
            {loadingAction === "direct_save" ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Zap className="h-3.5 w-3.5" />
                <span>Simpan Langsung</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Quick sample chips */}
      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
        <span className="text-[11px] text-muted-foreground">Contoh klik cepat:</span>
        {SAMPLE_PROMPTS.map((sample, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setPrompt(sample);
              handleAction("direct_save", sample);
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
