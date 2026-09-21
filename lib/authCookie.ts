/**
 * Helpers untuk manage auth cookie yang dipakai oleh middleware.
 * Cookie ini bukan untuk keamanan penuh (Firebase token ada di IndexedDB),
 * tapi sebagai sinyal bagi middleware server-side untuk redirect.
 */

const COOKIE_NAME = "sara_auth_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 hari

/** Set cookie tanda sudah login */
export function setAuthCookie(uid: string): void {
  document.cookie = [
    `${COOKIE_NAME}=${uid}`,
    `max-age=${COOKIE_MAX_AGE}`,
    "path=/",
    "SameSite=Lax",
  ].join("; ");
}

/** Hapus cookie saat logout */
export function clearAuthCookie(): void {
  document.cookie = `${COOKIE_NAME}=; max-age=0; path=/; SameSite=Lax`;
}
