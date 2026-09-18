/**
 * Administrator & Creator Identity Configuration
 */

export const DEFAULT_OWNER_EMAIL = "mfharas5@gmail.com";

/**
 * Checks if the specified email belongs to the verified web application owner / administrator.
 */
export function isAppOwner(email?: string | null): boolean {
  if (!email || typeof email !== "string") {
    return false;
  }

  const configuredAdmin =
    process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
    process.env.ADMIN_EMAIL ||
    DEFAULT_OWNER_EMAIL;

  return email.trim().toLowerCase() === configuredAdmin.trim().toLowerCase();
}
