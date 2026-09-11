"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log minimal error digest without dumping raw stack to the browser UI
    if (process.env.NODE_ENV !== "production") {
      console.error("Application Error:", error);
    }
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center bg-background">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-6">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Terjadi Kesalahan Sistem
      </h1>
      <p className="mt-3 text-sm text-muted-foreground max-w-md">
        Terjadi kendala saat memproses permintaan Anda. Silakan coba muat ulang halaman.
      </p>
      {error.digest && (
        <p className="mt-2 text-xs font-mono text-muted-foreground">
          Kode referensi: {error.digest}
        </p>
      )}
      <div className="mt-8 flex gap-3">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" />
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
