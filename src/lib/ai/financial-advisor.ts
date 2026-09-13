import { getGeminiClient, GEMINI_MODEL } from "./gemini";

export interface FinancialHealthAdvice {
  healthScore: number;
  status: "Sehat" | "Perlu Perhatian" | "Kritis";
  summary: string;
  keyFindings: string[];
  recommendations: string[];
}

export interface FinancialHealthInput {
  periodLabel: string;
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  netSavings: number;
  savingsRate: number;
  categories: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

export async function generateFinancialHealthAdvice(
  data: FinancialHealthInput
): Promise<FinancialHealthAdvice> {
  const ai = getGeminiClient();

  const promptData = {
    periode: data.periodLabel,
    totalSaldo: data.totalBalance,
    totalPemasukanBulanIni: data.monthlyIncome,
    totalPengeluaranBulanIni: data.monthlyExpense,
    tabunganBersih: data.netSavings,
    rasioTabunganPersen: `${data.savingsRate}%`,
    rincianPengeluaranKategori: data.categories.map((c) => ({
      kategori: c.category,
      nominal: c.amount,
      persentase: `${c.percentage}%`,
    })),
  };

  const systemInstruction = `
Kamu adalah konsultan keuangan profesional untuk aplikasi DompetKU.
Tugasmu adalah menganalisis data keuangan bulanan pengguna secara objektif, tajam, realistis, dan memberikan rekomendasi praktis.

Panduan Penilaian:
- Hitung healthScore (0–100) berdasarkan:
  - Rasio tabungan (ideal >= 20%)
  - Defisit vs Surplus (apakah pengeluaran melebihi pemasukan?)
  - Keseimbangan pos pengeluaran
- Tentukan status:
  - "Sehat" jika skor >= 75
  - "Perlu Perhatian" jika skor 50–74
  - "Kritis" jika skor < 50 (terjadi defisit atau pengeluaran > pemasukan)
- summary: Tuliskan 2–3 kalimat ringkas mengenai evaluasi arus kas bulan ini tanpa basa-basi atau kata klise.
- keyFindings: 2–3 poin observasi penting berbasis data (misal pos mana yang paling dominan, rasio tabungan, dsb.).
- recommendations: 2–3 langkah konkret yang bisa langsung dilakukan pengguna untuk menekan pengeluaran atau mengamankan tabungan.

Format Output JSON:
{
  "healthScore": 85,
  "status": "Sehat",
  "summary": "Arus kas bulan ini dalam kondisi surplus yang baik...",
  "keyFindings": [
    "Pos pengeluaran terbesar berada pada kategori Food sebesar 42%...",
    "Rasio tabungan mencapai 28%, melampaui batas aman finansial 20%."
  ],
  "recommendations": [
    "Alokasikan surplus sebesar Rp ... ke target dana darurat.",
    "Batasi pos Food maksimal Rp ... per minggu untuk menjaga efisiensi."
  ]
}
`;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: `Instruksi:\n${systemInstruction}\n\nData Keuangan Pengguna:\n${JSON.stringify(promptData, null, 2)}`,
    config: {
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  });

  const responseText = response.text?.trim();
  if (!responseText) {
    throw new Error("Gagal menerima analisis finansial dari AI.");
  }

  const result = JSON.parse(responseText) as FinancialHealthAdvice;

  // Validate bounds
  if (typeof result.healthScore !== "number") {
    result.healthScore = data.netSavings >= 0 ? 70 : 40;
  }
  result.healthScore = Math.max(0, Math.min(100, Math.round(result.healthScore)));

  if (!["Sehat", "Perlu Perhatian", "Kritis"].includes(result.status)) {
    result.status =
      result.healthScore >= 75
        ? "Sehat"
        : result.healthScore >= 50
        ? "Perlu Perhatian"
        : "Kritis";
  }

  if (!Array.isArray(result.keyFindings) || result.keyFindings.length === 0) {
    result.keyFindings = ["Pola pengeluaran bulan ini berjalan normal."];
  }

  if (!Array.isArray(result.recommendations) || result.recommendations.length === 0) {
    result.recommendations = ["Pertahankan rasio tabungan positif setiap bulan."];
  }

  return result;
}
