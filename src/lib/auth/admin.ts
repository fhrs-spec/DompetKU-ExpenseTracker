/**
 * Administrator & Creator Identity Configuration
 */

export const DEFAULT_OWNER_EMAIL = "mfharas5@gmail.com";

/**
 * Checks if the specified user belongs to the verified web application owner / administrator.
 * Matches mfharas5@gmail.com, any email matching configured ADMIN_EMAIL, or email/name containing "fharas".
 */
export function isAppOwner(
  email?: string | null,
  name?: string | null
): boolean {
  const normEmail = (email || "").trim().toLowerCase();
  const normName = (name || "").trim().toLowerCase();

  if (!normEmail && !normName) {
    return false;
  }

  const configuredAdmin = (
    process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
    process.env.ADMIN_EMAIL ||
    DEFAULT_OWNER_EMAIL
  )
    .trim()
    .toLowerCase();

  return (
    normEmail === configuredAdmin ||
    normEmail === DEFAULT_OWNER_EMAIL.toLowerCase() ||
    normEmail.includes("fharas") ||
    normName.includes("fharas")
  );
}

export const ADMIN_CONTACT = {
  name: "Fharas",
  email: "mfharas5@gmail.com",
  whatsappNumber: "6282279510673",
  whatsapp: process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "6282279510673",
  whatsappUrl: (msg?: string) => {
    const rawNumber = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "6282279510673";
    const phone = rawNumber.replace(/\D/g, "");
    const text = encodeURIComponent(
      msg ||
      "Halo Mas Fharas, saya tertarik dengan akses lisensi penuh DompetKU SaaS Pro ($99)."
    );
    return `https://wa.me/${phone}?text=${text}`;
  },
  emailUrl: (subject?: string, body?: string) => {
    const adminEmail =
      process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
      process.env.ADMIN_EMAIL ||
      DEFAULT_OWNER_EMAIL;
    const sub = encodeURIComponent(
      subject || "Aktivasi Lisensi DompetKU SaaS Pro ($99)"
    );
    const bod = encodeURIComponent(
      body ||
      "Halo Mas Fharas,\n\nSaya ingin membeli lisensi DompetKU SaaS Pro ($99 Lifetime Access). Mohon info instruksi pembayaran atau aktivasi akun saya.\n\nTerima kasih."
    );
    return `mailto:${adminEmail}?subject=${sub}&body=${bod}`;
  },
  priceUsd: 99,
  priceIdr: "1.550.000",
  currency: "USD",
  planName: "DompetKU Pro Lifetime",
};
