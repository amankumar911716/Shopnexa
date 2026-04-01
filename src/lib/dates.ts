/**
 * Date Utility for Shopnexa
 * Platform launch: March 2026
 * Ensures no date before March 1, 2026 is ever displayed to users.
 */

// Platform launch date — the earliest acceptable date
const PLATFORM_LAUNCH = new Date('2026-03-01T00:00:00.000Z');

/**
 * Clamp a date string to be >= March 1, 2026.
 * If the given date is before platform launch, returns the launch date instead.
 */
export function clampDate(dateStr: string | Date | null | undefined): Date {
  if (!dateStr) return new Date();
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(d.getTime())) return new Date();
  return d < PLATFORM_LAUNCH ? new Date(PLATFORM_LAUNCH) : d;
}

/**
 * Format a date string for display, ensuring it's >= March 2026.
 * Returns formatted date like "01 Mar 2026"
 */
export function formatDate(iso: string | Date | null | undefined): string {
  const d = clampDate(iso);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format a date+time string for display, ensuring it's >= March 2026.
 * Returns formatted datetime like "01 Mar 2026, 10:30 AM"
 */
export function formatDateTime(iso: string | Date | null | undefined): string {
  const d = clampDate(iso);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get current ISO timestamp (for new records).
 */
export function nowISO(): string {
  return new Date().toISOString();
}
