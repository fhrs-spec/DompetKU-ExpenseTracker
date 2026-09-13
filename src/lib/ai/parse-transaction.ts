import { getGeminiClient, GEMINI_MODEL } from "./gemini";
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/types/database";

export interface ParsedAITransaction {
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  transaction_date: string;
  note?: string;
}

export async function parseTransactionWithAI(input: string): Promise<ParsedAITransaction> {
  const ai = getGeminiClient();
  const today = new Date().toISOString().slice(0, 10);

  const systemInstruction = `
Kamu adalah asisten keuangan pintar untuk aplikasi DompetKU.
Tugasmu adalah mengekstrak informasi transaksi keuangan dari kalimat bahasa Indonesia santai atau formal menjadi format JSON terstruktur.

Aturan Pemetaan Kategori:
- Jika tipe "expense", kategori HARUS salah satu dari: ${EXPENSE_CATEGORIES.join(", ")}.
  - Makanan, minuman, kopi, camilan, makan siang, gofood, grabfood -> "Food"
  - Bensin, ojol, grab, gojek, parkir, tol, tiket kereta, busway -> "Transport"
  - Beli baju, barang, perlengkapan, marketplace, shopee, tokped -> "Shopping"
  - Listrik, air, wifi, internet, pulsa, kos, kontrakan, cicilan -> "Bills"
  - Bioskop, game, liburan, karaoke, rekreasi -> "Entertainment"
  - Obat, dokter, vitamin, klinik, rumah sakit -> "Health"
  - Buku, kursus, spp, les, kuliah, sekolah -> "Education"
  - Jika tidak ada yang cocok -> "Other"
- Jika tipe "income", kategori HARUS salah satu dari: ${INCOME_CATEGORIES.join(", ")}.
  - Gaji bulanan, upah, bayaran kerja tetap -> "Salary"
  - Bonus, insentif, THR, komisi -> "Bonus"
  - Proyek sampingan, freelance, joki tugas, desain -> "Freelance"
  - Hadiah, angpao, dikasih orang tua -> "Gift"
  - Jika tidak ada yang cocok -> "Other"

Aturan Nominal:
- Pahami istilah angka: "50rb" / "50k" / "50 ribu" = 50000, "1.5jt" / "1,5 juta" = 1500000, dsb.
- Nominal HARUS berupa bilangan bulat positif tanpa simbol mata uang.

Aturan Tanggal:
- Hari ini adalah ${today}.
- "kemarin" = 1 hari sebelum hari ini.
- Jika tidak disebutkan tanggal secara spesifik, gunakan ${today}.

Format Output JSON murni:
{
  "title": "Nama ringkas transaksi yang informatif",
  "amount": 35000,
  "type": "expense" atau "income",
  "category": "Kategori persis sesuai daftar di atas",
  "transaction_date": "YYYY-MM-DD",
  "note": "Catatan tambahan jika ada"
}
`;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: `Instruksi:\n${systemInstruction}\n\nInput Pengguna: "${input}"`,
    config: {
      responseMimeType: "application/json",
      temperature: 0.1,
    },
  });

  const responseText = response.text?.trim();
  if (!responseText) {
    throw new Error("Gagal menerima respon dari AI.");
  }

  const parsed = JSON.parse(responseText) as ParsedAITransaction;

  if (!parsed.title || typeof parsed.amount !== "number" || parsed.amount <= 0) {
    throw new Error("AI tidak dapat menemukan nominal atau judul transaksi yang valid.");
  }

  parsed.type = parsed.type === "income" ? "income" : "expense";

  const validCategories =
    parsed.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  if (!(validCategories as readonly string[]).includes(parsed.category)) {
    parsed.category = "Other";
  }

  if (!parsed.transaction_date || !/^\d{4}-\d{2}-\d{2}$/.test(parsed.transaction_date)) {
    parsed.transaction_date = today;
  }

  return parsed;
}
