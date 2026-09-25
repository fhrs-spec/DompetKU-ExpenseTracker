"use client";

import * as React from "react";
import { Sparkles, Loader2, Crown, Camera, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import {
  parseTransactionAction,
  parseReceiptAction,
  getUserAIQuotaAction,
} from "@/app/actions/ai";
import { ParsedAITransaction } from "@/lib/ai/parse-transaction";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

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

/**
 * Compresses an image file client-side using an HTML5 Canvas.
 * Resizes max dimension to 1280px and converts to JPEG at 0.82 quality.
 * Shrinks 5-15MB mobile photos to ~150-350KB in under 100ms for instant AI OCR.
 */
async function compressImageFile(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Format file gambar tidak valid atau rusak."));
      img.onload = () => {
        try {
          const MAX_DIM = 1280;
          let { width, height } = img;

          if (width > MAX_DIM || height > MAX_DIM) {
            if (width > height) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            } else {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Canvas context 2D tidak tersedia di browser."));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
          const base64 = dataUrl.replace(/^data:image\/jpeg;base64,/, "");

          resolve({ base64, mimeType: "image/jpeg" });
        } catch (err) {
          reject(err);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function AiQuickInput({ onParsed, disabled }: AiQuickInputProps) {
  const [prompt, setPrompt] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isScanning, setIsScanning] = React.useState(false);
  const [quotaInfo, setQuotaInfo] = React.useState<{ isOwner: boolean } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    getUserAIQuotaAction()
      .then((data) => setQuotaInfo(data))
      .catch(() => {});
  }, []);

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

      onParsed(res.data);
      setPrompt("");
      toast.success(
        `Data "${res.data.title}" berhasil diekstrak! Tinjau dan klik "Simpan Transaksi".`
      );
    } catch {
      toast.error("Terjadi kendala saat menghubungkan ke AI.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so the user can select the same file again if needed
    e.target.value = "";

    if (!file.type.startsWith("image/")) {
      toast.error("File yang dipilih harus berupa foto/gambar (JPG, PNG, WebP).");
      return;
    }

    setIsScanning(true);
    const toastId = toast.loading("Mengompres & memindai struk dengan Gemini AI...");

    try {
      const { base64, mimeType } = await compressImageFile(file);

      const res = await parseReceiptAction(base64, mimeType);
      if (!res.success || !res.data) {
        toast.error(res.error || "Gagal memindai struk belanja.", { id: toastId });
        return;
      }

      onParsed(res.data);
      toast.success(
        `Struk "${res.data.title}" berhasil dipindai (${formatCurrency(
          res.data.amount
        )})! Periksa dan simpan transaksi.`,
        { id: toastId, duration: 4000 }
      );
    } catch (err) {
      console.error("Receipt Scan Error:", err);
      toast.error(
        err instanceof Error ? err.message : "Terjadi kendala saat memindai struk belanja.",
        { id: toastId }
      );
    } finally {
      setIsScanning(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isLoading && !isScanning) {
      e.preventDefault();
      handleAction();
    }
  };

  const isBusy = isLoading || isScanning;

  return (
    <div className="rounded-xl sm:rounded-2xl border border-primary/20 bg-primary/[0.03] dark:bg-primary/[0.05] p-2.5 sm:p-3.5 space-y-2.5 transition-colors">
      {/* Hidden File Input for Receipt Photo / Camera */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isBusy}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Catat Cepat dengan AI</span>
        </div>
        {quotaInfo?.isOwner ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
            <Crown className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
            Unlimited (Owner)
          </span>
        ) : (
          <span className="text-[10px] text-muted-foreground">
            Gemini Flash
          </span>
        )}
      </div>

      {/* Scanning status banner */}
      {isScanning && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary font-medium animate-pulse">
          <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
          <span>Sedang memindai struk belanja dengan Gemini AI...</span>
        </div>
      )}

      {/* Integrated search-bar style input with camera trigger */}
      <div className="relative flex items-center">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isBusy}
          className="absolute left-1.5 flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          title="Foto struk langsung dari kamera atau pilih dari galeri"
          aria-label="Scan struk belanja dengan kamera"
        >
          {isScanning ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </button>

        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isBusy}
          aria-label="Kalimat transaksi untuk AI"
          placeholder={
            isScanning
              ? "Memproses foto struk..."
              : "Ketik transaksi atau scan struk..."
          }
          className="w-full rounded-lg sm:rounded-xl border border-border bg-card pl-11 pr-24 sm:pr-28 py-2.5 sm:py-2 text-base sm:text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all disabled:opacity-50"
        />

        <div className="absolute right-1 sm:right-1.5 flex items-center">
          <Button
            type="button"
            onClick={() => handleAction()}
            disabled={disabled || isBusy || !prompt.trim()}
            size="sm"
            className="h-8 sm:h-8 px-2.5 sm:px-3 text-xs gap-1 shadow-soft bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-md sm:rounded-lg"
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

      {/* Quick Action Chips & Sample Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 -mx-0.5 px-0.5 scroll-smooth">
        {/* Prominent Scan Struk Chip */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isBusy}
          className="inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap shrink-0 rounded-lg border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50 min-h-[32px]"
          title="Ambil foto atau upload struk belanja"
        >
          {isScanning ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Camera className="h-3.5 w-3.5" />
          )}
          <span>Scan Struk</span>
        </button>

        <span className="text-xs text-muted-foreground shrink-0 font-medium">Contoh:</span>
        {SAMPLE_PROMPTS.map((sample, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setPrompt(sample);
              handleAction(sample);
            }}
            disabled={disabled || isBusy}
            className="text-xs whitespace-nowrap shrink-0 rounded-lg border border-border/80 bg-card hover:bg-muted/80 px-2.5 py-1.5 text-muted-foreground hover:text-foreground transition-all cursor-pointer active:scale-95 disabled:opacity-50 min-h-[32px] flex items-center"
          >
            &ldquo;{sample}&rdquo;
          </button>
        ))}
      </div>
    </div>
  );
}
