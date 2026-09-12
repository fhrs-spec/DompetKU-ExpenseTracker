"use client";

import * as React from "react";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { MonthlyReportData } from "@/lib/pdf/generate-report";

interface ExportPdfButtonProps {
  reportData: MonthlyReportData;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
}

export function ExportPdfButton({
  reportData,
  className,
  variant = "outline",
}: ExportPdfButtonProps) {
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleExport = async () => {
    setIsGenerating(true);
    try {
      toast.info("Menyiapkan dokumen PDF laporan keuangan...");
      const { generateMonthlyReportPDF } = await import("@/lib/pdf/generate-report");
      generateMonthlyReportPDF(reportData);
      toast.success("Laporan PDF berhasil diunduh!");
    } catch (err) {
      console.error("PDF generation error:", err);
      toast.error("Gagal mengunduh dokumen PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant={variant}
      onClick={handleExport}
      disabled={isGenerating}
      className={className}
      title="Unduh laporan dalam format PDF"
    >
      {isGenerating ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <FileDown className="mr-2 h-4 w-4 text-primary" />
      )}
      <span>{isGenerating ? "Menyiapkan PDF..." : "Ekspor PDF"}</span>
    </Button>
  );
}
