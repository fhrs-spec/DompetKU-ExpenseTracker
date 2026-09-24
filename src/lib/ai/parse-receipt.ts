import { generateContentWithFallback } from "./gemini";
import { EXPENSE_CATEGORIES } from "@/types/database";
import { ParsedAITransaction } from "./parse-transaction";

export interface ParseReceiptOptions {
  imageBase64: string;
  mimeType?: string;
}

/**
 * Parses a shopping receipt / invoice image using Gemini Vision AI.
 * Extracts merchant name, grand total, transaction date, category, and items note.
 */
export async function parseReceiptWithAI(
  options: ParseReceiptOptions
): Promise<ParsedAITransaction> {
  const { imageBase64, mimeType = "image/jpeg" } = options;

  if (!imageBase64 || imageBase64.trim().length === 0) {
    throw new Error("Gambar struk belanja tidak ditemukan.");
  }

  // Clean base64 payload if it includes data URL prefix
  let cleanBase64 = imageBase64.trim();
  let detectedMime = mimeType;

  const dataUrlMatch = cleanBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
  if (dataUrlMatch) {
    detectedMime = dataUrlMatch[1];
    cleanBase64 = cleanBase64.replace(/^data:[^;]+;base64,/, "");
  }

  // Basic size guard (under ~10MB)
  if (cleanBase64.length > 15 * 1024 * 1024) {
    throw new Error("Ukuran foto struk terlalu besar. Harap gunakan foto dengan ukuran lebih kecil.");
  }

  // Anchor baseline date to Asia/Jakarta (WIB)
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const systemInstruction = `
Kamu adalah asisten OCR dan analisis struk belanja cerdas untuk aplikasi keuangan DompetKU.
Tugasmu adalah membaca foto/gambar struk kasir, faktur belanja, invoice, atau kuitansi dalam bahasa Indonesia dan mengekstrak data penting ke format JSON terstruktur.

Aturan Ekstraksi:
1. "title":
   - Nama toko/merchant/kasir yang tertera di bagian atas struk (contoh: "Indomaret", "Alfamart", "Kopi Kenangan", "SPBU Pertamina", "Superindo", "Restoran Padang Sederhana", "Apotek Kimia Farma").
   - Jika tidak ada nama toko yang jelas, buat nama ringkas deskriptif (contoh: "Belanja Supermarket", "Makan Siang Resto").
   - Maksimal 60 karakter.

2. "amount":
   - Nominal TOTAL AKHIR (Grand Total / Netto) yang dibayar.
   - KRITIS: Hati-hati dengan struk belanja! JANGAN ambil:
     * Subtotal (sebelum diskon/pajak)
     * Nilai PPN / PB1 / Tax / Service Charge saja
     * Nilai Diskon / Potongan
     * Uang Tunai / Cash yang diserahkan konsumen (misal belanja 35rb tapi uang tunai 50rb)
     * Kembalian / Change (misal kembalian 15rb)
   - Cari baris "TOTAL", "GRAND TOTAL", "JUMLAH", "TOTAL BAYAR", "NETTO", atau angka tagihan akhir yang sebenarnya.
   - Nominal HARUS berupa angka bulat positif (integer) tanpa titik/koma pemisah ribuan atau simbol "Rp".

3. "type":
   - Selalu "expense".

4. "category":
   - Pilih SATU kategori yang paling dominan dari daftar berikut:
     * "Food" -> Restoran, cafe, warung, bakery, kedai kopi, fast food, makanan/minuman siap saji.
     * "Transport" -> SPBU bensin, tiket kereta/pesawat/bus, parkir, tol.
     * "Shopping" -> Minimarket (Indomaret, Alfamart), supermarket, toko pakaian, perkakas, pernak-pernik.
     * "Bills" -> Struk bayar tagihan listrik, PLN, air PDAM, internet, pulsa.
     * "Entertainment" -> Bioskop (Cinema XXI, CGV), arena bermain, karaoke.
     * "Health" -> Apotek, obat, vitamin, klinik, laboratorium.
     * "Education" -> Toko buku, alat tulis, fotokopi, perlengkapan sekolah/kuliah.
     * "Other" -> Jika tidak cocok dengan kategori di atas.

5. "transaction_date":
   - Tanggal yang tercetak di struk belanja dalam format "YYYY-MM-DD".
   - Jika format di struk DD/MM/YYYY atau DD-MM-YY, konversikan ke "YYYY-MM-DD".
   - Jika tahun tercatat 2 digit (misal 26), jadikan 2026.
   - Jika tanggal di struk kabur, sobek, atau tidak tercetak, gunakan tanggal hari ini: "${today}".

6. "note":
   - Buat ringkasan ringkas 2-5 item barang belanjaan utama yang dibeli (contoh: "Minyak Sania 2L, Telur 1kg, Roti Tawar" atau "1x Mie Goreng, 2x Es Teh Manis").
   - Maksimal 200 karakter. Jika barang terlalu banyak, akhiri dengan "dll.".

Format Output JSON murni (tanpa teks pengantar apapun):
{
  "title": "Nama Toko / Tempat",
  "amount": 45000,
  "type": "expense",
  "category": "Shopping",
  "transaction_date": "YYYY-MM-DD",
  "note": "Ringkasan barang yang dibeli"
}
`;

  // Multimodal prompt: combine instructional text part with inline base64 image part
  const contents = [
    {
      text: "Tolong baca dan ekstrak informasi transaksi dari foto struk belanja berikut ke format JSON sesuai instruksi.",
    },
    {
      inlineData: {
        mimeType: detectedMime,
        data: cleanBase64,
      },
    },
  ];

  // 15-second timeout ceiling for vision processing
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const rawResponse = await generateContentWithFallback({
      contents,
      systemInstruction,
      maxOutputTokens: 1024,
      temperature: 0.1,
      abortSignal: controller.signal,
    });

    let cleaned = rawResponse.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : cleaned;

    let parsed: ParsedAITransaction;
    try {
      parsed = JSON.parse(jsonString) as ParsedAITransaction;
    } catch {
      throw new Error(
        "AI tidak dapat membaca data dari foto struk. Pastikan foto struk terlihat jelas, tidak buram, dan memiliki pencahayaan cukup."
      );
    }

    if (
      !parsed.title ||
      typeof parsed.title !== "string" ||
      typeof parsed.amount !== "number" ||
      !Number.isFinite(parsed.amount) ||
      parsed.amount <= 0
    ) {
      throw new Error(
        "AI tidak menemukan rincian total belanja atau nama toko pada struk. Silakan coba ambil foto struk dengan lebih dekat dan fokus."
      );
    }

    parsed.title = parsed.title.trim().slice(0, 80);
    parsed.amount = Math.round(parsed.amount);
    parsed.type = "expense";

    if (!(EXPENSE_CATEGORIES as readonly string[]).includes(parsed.category)) {
      parsed.category = "Shopping";
    }

    if (!parsed.transaction_date || !/^\d{4}-\d{2}-\d{2}$/.test(parsed.transaction_date)) {
      parsed.transaction_date = today;
    }

    if (parsed.note) {
      parsed.note = parsed.note.trim().slice(0, 250);
    }

    return parsed;
  } finally {
    clearTimeout(timeoutId);
  }
}
