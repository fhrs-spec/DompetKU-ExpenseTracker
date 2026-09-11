import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency, formatDate } from "@/lib/utils";

export interface ReportTransaction {
  transaction_date: string;
  title: string;
  category: string;
  type: "income" | "expense";
  amount: number;
}

export interface ReportCategory {
  category: string;
  amount: number;
  percentage: number;
}

export interface MonthlyReportData {
  userName: string;
  userEmail: string;
  period: string; // e.g. "September 2026"
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  categories: ReportCategory[];
  transactions: ReportTransaction[];
}

export function generateMonthlyReportPDF(data: MonthlyReportData) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let currentY = 16;

  // 1. Header Banner
  doc.setFillColor(22, 163, 74); // #16A34A Primary Fintech Green
  doc.rect(margin, currentY, 3, 16, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(24, 24, 27); // Zinc-900
  doc.text("DompetKU", margin + 6, currentY + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(113, 113, 122); // Zinc-500
  doc.text("Laporan Rekening & Arus Kas Finansial Pribadi", margin + 6, currentY + 13);

  // Right-aligned header metadata
  doc.setFontSize(8);
  doc.setTextColor(113, 113, 122);
  const printDate = `Dicetak: ${formatDate(new Date())}`;
  doc.text(printDate, pageWidth - margin, currentY + 6, { align: "right" });
  doc.text(`Status: Terverifikasi RLS`, pageWidth - margin, currentY + 11, {
    align: "right",
  });

  currentY += 24;

  // 2. User & Period Information Box
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 20, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);

  // Left Column
  doc.text("Nama Akun:", margin + 5, currentY + 7);
  doc.setFont("helvetica", "normal");
  doc.text(data.userName, margin + 28, currentY + 7);

  doc.setFont("helvetica", "bold");
  doc.text("Email:", margin + 5, currentY + 14);
  doc.setFont("helvetica", "normal");
  doc.text(data.userEmail, margin + 28, currentY + 14);

  // Right Column
  const rightColX = pageWidth / 2 + 10;
  doc.setFont("helvetica", "bold");
  doc.text("Periode Laporan:", rightColX, currentY + 7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(22, 163, 74);
  doc.setFont("helvetica", "bold");
  doc.text(data.period, rightColX + 30, currentY + 7);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 41, 59);
  doc.text("Mata Uang:", rightColX, currentY + 14);
  doc.text("IDR (Rupiah Indonesia)", rightColX + 30, currentY + 14);

  currentY += 26;

  // 3. Financial Summary 4 Metrics Grid
  const cardWidth = (pageWidth - margin * 2 - 9) / 4;
  const cardHeight = 18;

  // Metric 1: Total Saldo
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(margin, currentY, cardWidth, cardHeight, 2, 2, "FD");
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(22, 101, 52);
  doc.text("TOTAL SALDO", margin + 4, currentY + 6);
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.text(formatCurrency(data.totalBalance), margin + 4, currentY + 13);

  // Metric 2: Pemasukan
  const card2X = margin + cardWidth + 3;
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(card2X, currentY, cardWidth, cardHeight, 2, 2, "FD");
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(22, 101, 52);
  doc.text("PEMASUKAN PERIODE", card2X + 4, currentY + 6);
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.text(`+${formatCurrency(data.totalIncome)}`, card2X + 4, currentY + 13);

  // Metric 3: Pengeluaran
  const card3X = margin + (cardWidth + 3) * 2;
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(card3X, currentY, cardWidth, cardHeight, 2, 2, "FD");
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(153, 27, 27);
  doc.text("PENGELUARAN PERIODE", card3X + 4, currentY + 6);
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.text(`-${formatCurrency(data.totalExpense)}`, card3X + 4, currentY + 13);

  // Metric 4: Tabungan Bersih
  const card4X = margin + (cardWidth + 3) * 3;
  const isNetSurplus = data.netSavings >= 0;
  doc.setFillColor(isNetSurplus ? 240 : 254, isNetSurplus ? 253 : 242, isNetSurplus ? 244 : 242);
  doc.setDrawColor(isNetSurplus ? 187 : 254, isNetSurplus ? 247 : 202, isNetSurplus ? 208 : 202);
  doc.roundedRect(card4X, currentY, cardWidth, cardHeight, 2, 2, "FD");
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(isNetSurplus ? 22 : 153, isNetSurplus ? 101 : 27, isNetSurplus ? 52 : 27);
  doc.text(isNetSurplus ? "TABUNGAN BERSIH" : "DEFISIT BERSIH", card4X + 4, currentY + 6);
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.text(
    `${isNetSurplus ? "+" : ""}${formatCurrency(data.netSavings)}`,
    card4X + 4,
    currentY + 13
  );

  currentY += 24;

  // 4. Category Breakdown Summary (If Available)
  if (data.categories.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(24, 24, 27);
    doc.text("Ringkasan Pengeluaran Berdasarkan Kategori", margin, currentY);

    currentY += 4;

    const catRows = data.categories.slice(0, 5).map((cat) => [
      cat.category,
      formatCurrency(cat.amount),
      `${cat.percentage}%`,
    ]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [["Kategori", "Total Pengeluaran", "Porsi (%)"]],
      body: catRows,
      theme: "striped",
      headStyles: {
        fillColor: [71, 85, 105], // Slate-600
        textColor: 255,
        fontStyle: "bold",
        fontSize: 8,
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      columnStyles: {
        1: { halign: "right", fontStyle: "bold" },
        2: { halign: "center" },
      },
    });

    // @ts-expect-error autoTable extends doc with lastAutoTable
    currentY = doc.lastAutoTable.finalY + 8;
  }

  // 5. Full Transactions Table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(24, 24, 27);
  doc.text(`Rincian Transaksi (${data.transactions.length} Catatan)`, margin, currentY);

  currentY += 4;

  const tableBody = data.transactions.map((tx, idx) => [
    (idx + 1).toString(),
    formatDate(tx.transaction_date),
    tx.title,
    tx.category,
    tx.type === "income" ? "Pemasukan" : "Pengeluaran",
    `${tx.type === "income" ? "+" : "-"} ${formatCurrency(Number(tx.amount))}`,
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin, bottom: 20 },
    head: [["No", "Tanggal", "Keterangan", "Kategori", "Tipe", "Nominal (IDR)"]],
    body: tableBody.length > 0 ? tableBody : [["-", "-", "Belum ada transaksi", "-", "-", "-"]],
    theme: "striped",
    headStyles: {
      fillColor: [22, 163, 74], // DompetKU Green #16A34A
      textColor: 255,
      fontStyle: "bold",
      fontSize: 8,
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      1: { cellWidth: 32 },
      3: { cellWidth: 26 },
      4: { cellWidth: 24 },
      5: { halign: "right", fontStyle: "bold" },
    },
    didParseCell: (hookData) => {
      // Colorize the amount and type columns
      if (hookData.section === "body" && hookData.column.index === 5) {
        const rawText = hookData.cell.raw as string;
        if (rawText.startsWith("+")) {
          hookData.cell.styles.textColor = [22, 163, 74];
        } else if (rawText.startsWith("-")) {
          hookData.cell.styles.textColor = [220, 38, 38];
        }
      }
    },
    didDrawPage: (hookData) => {
      // 6. Page Footer
      const totalPages = doc.getNumberOfPages();
      const currentPage = hookData.pageNumber;

      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(148, 163, 184);

      // Line
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, 287, pageWidth - margin, 287);

      // Footer text
      doc.text(
        "Dokumen ini dihasilkan secara otomatis oleh sistem DompetKU. Simpan sebagai arsip finansial Anda.",
        margin,
        292
      );
      doc.text(
        `Halaman ${currentPage} dari ${totalPages}`,
        pageWidth - margin,
        292,
        { align: "right" }
      );
    },
  });

  // Filename formatting
  const sanitizedPeriod = data.period.toLowerCase().replace(/\s+/g, "-");
  doc.save(`Laporan-Keuangan-DompetKU-${sanitizedPeriod}.pdf`);
}
