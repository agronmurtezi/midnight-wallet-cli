import type { FacadeState } from '@midnight-ntwrk/wallet-sdk-facade';

/**
 * Calculate the overall sync percentage from all three wallets
 */
export function calculateSyncPercentage(state: FacadeState): number {
  // Shielded wallet percentage
  const shieldedProgress = state.shielded.progress;
  const shieldedApplied = Number(shieldedProgress.appliedIndex ?? 0);
  const shieldedTotal = Number(shieldedProgress.highestRelevantIndex ?? 0);
  const shieldedPercent = shieldedTotal === 0 ? 100 : (shieldedApplied / shieldedTotal) * 100;

  // Unshielded wallet percentage
  const unshieldedProgress = state.unshielded.progress;
  const unshieldedApplied = Number(unshieldedProgress.appliedId);
  const unshieldedTotal = Number(unshieldedProgress.highestTransactionId);
  const unshieldedPercent = unshieldedTotal === 0 ? 100 : (unshieldedApplied / unshieldedTotal) * 100;

  // Dust wallet percentage
  const dustProgress = state.dust.progress;
  const dustApplied = Number(dustProgress.appliedIndex ?? 0);
  const dustTotal = Number(dustProgress.highestRelevantIndex ?? 0);
  const dustPercent = dustTotal === 0 ? 100 : (dustApplied / dustTotal) * 100;

  // Average of all three
  const overall = (shieldedPercent + unshieldedPercent + dustPercent) / 3;

  return Math.floor(overall);
}

/**
 * Get sync status string with percentage
 */
export function getSyncStatus(state: FacadeState): string {
  const percentage = calculateSyncPercentage(state);

  if (state.isSynced || percentage === 100) {
    return 'synced';
  }

  return `syncing (${percentage}%)`;
}
