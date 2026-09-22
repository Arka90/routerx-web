import type { UptimeResponse } from '@/types/monitor.types';

/** "0s" / "45s" / "12m" / "3h 20m" / "2d 4h" — rather than a raw second count. */
export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds < 0) return '0s';
  if (seconds < 60) return `${Math.round(seconds)}s`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours < 24) {
    return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours ? `${days}d ${remainingHours}h` : `${days}d`;
}

export function formatUptimePercentage(data: UptimeResponse | undefined): string {
  if (!data) return '...';

  return data.uptime_percentage === 100
    ? '100'
    : data.uptime_percentage.toFixed(2);
}

/**
 * A monitor younger than the requested window has only been observed for part
 * of it. Saying "30-Day Uptime" over four hours of data overstates what the
 * number means, so the label follows the data.
 */
export function uptimeWindowLabel(data: UptimeResponse | undefined): string {
  if (!data) return '30-Day Uptime';

  // Tolerance: the observed window is always a hair under the requested one.
  if (data.observed_hours >= data.window_hours - 1) {
    const days = Math.round(data.window_hours / 24);
    return `${days}-Day Uptime`;
  }

  if (data.observed_hours < 1) return 'Uptime (since setup)';

  if (data.observed_hours < 48) {
    return `Uptime (last ${Math.round(data.observed_hours)}h)`;
  }

  return `Uptime (last ${Math.floor(data.observed_hours / 24)}d)`;
}
