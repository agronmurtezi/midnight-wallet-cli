import { NIGHT_TOKEN_ID } from '../constants.js';

/**
 * Returns a human-readable display name for a token ID.
 * Returns 'NIGHT' for the native token, otherwise returns truncated ID.
 */
export function getTokenDisplayName(tokenId: string): string {
  if (tokenId === NIGHT_TOKEN_ID) {
    return 'NIGHT';
  }
  return tokenId.substring(0, 8) + '...';
}

/**
 * Truncates a long address for display purposes.
 * Shows first 20 and last 16 characters with ellipsis in between.
 */
export function truncateAddress(address: string): string {
  if (address.length <= 40) return address;
  return address.substring(0, 20) + '...' + address.substring(address.length - 16);
}

/**
 * Formats a time duration in days and hours.
 * Returns a human-readable string like "2d 5h", "5h 30m", or "Complete".
 */
export function formatTimeRemaining(targetDate: Date, now: Date = new Date()): string {
  const diffMs = targetDate.getTime() - now.getTime();

  if (diffMs <= 0) {
    return 'Complete';
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}
