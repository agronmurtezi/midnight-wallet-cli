import { NIGHT_TOKEN_ID } from '../constants.js';

/** SPECK per DUST: 1 DUST = 10^15 SPECK (Midnight glossary) */
export const DUST_DENOMINATION = BigInt(10 ** 15);

/** STAR per NIGHT: 1 NIGHT = 10^6 STAR (Midnight glossary) */
export const NIGHT_DENOMINATION = BigInt(10 ** 6);

/**
 * Format a balance for display by token type and context.
 * NIGHT is only the native unshielded token. A shielded token with all-zeros ID is
 * not NIGHT and has no known unit.
 * NIGHT (unshielded) uses STAR denomination (10^6). All other tokens display raw value.
 */
export function formatBalanceForToken(
  balance: bigint,
  tokenId: string,
  tokenType: 'shielded' | 'unshielded',
): string {
  const isNight = tokenType === 'unshielded' && tokenId === NIGHT_TOKEN_ID;
  const denomination = isNight ? NIGHT_DENOMINATION : 1n;
  return formatBalance(balance, denomination);
}

/**
 * Format a balance for display. Uses NIGHT/STAR denomination (10^6) by default.
 * For DUST (SPECK values), use formatDustBalance instead.
 * For token-aware formatting (NIGHT vs custom), use formatBalanceForToken.
 */
export function formatBalance(balance: bigint, denomination: bigint = NIGHT_DENOMINATION): string {
  const value = balance / denomination;
  const fractionalPart = balance % denomination;

  // Use BigInt for thresholds to avoid precision loss
  const trillion = BigInt(1_000_000_000_000);
  const billion = BigInt(1_000_000_000);
  const million = BigInt(1_000_000);

  let result: string;

  if (value >= trillion) {
    // For trillions, divide and format
    const wholeTrillions = value / trillion;
    const remainderAfterTrillions = value % trillion;
    // Calculate decimal part (2 decimal places)
    const decimalPart = Number((remainderAfterTrillions * 100n) / trillion);

    if (decimalPart === 0 && fractionalPart === 0n) {
      result = `${wholeTrillions.toLocaleString('en-US')}T`;
    } else {
      const decimalStr = (decimalPart / 100).toFixed(2).substring(1); // Get ".XX" part
      result = `${wholeTrillions.toLocaleString('en-US')}${decimalStr.replace(/\.?0+$/, '')}T`;
    }
  } else if (value >= billion) {
    const wholeBillions = value / billion;
    const remainderAfterBillions = value % billion;
    const decimalPart = Number((remainderAfterBillions * 100n) / billion);

    if (decimalPart === 0 && fractionalPart === 0n) {
      result = `${wholeBillions.toLocaleString('en-US')}B`;
    } else {
      const decimalStr = (decimalPart / 100).toFixed(2).substring(1);
      result = `${wholeBillions.toLocaleString('en-US')}${decimalStr.replace(/\.?0+$/, '')}B`;
    }
  } else if (value >= million) {
    const wholeMillions = value / million;
    const remainderAfterMillions = value % million;
    const decimalPart = Number((remainderAfterMillions * 100n) / million);

    if (decimalPart === 0 && fractionalPart === 0n) {
      result = `${wholeMillions.toLocaleString('en-US')}M`;
    } else {
      const decimalStr = (decimalPart / 100).toFixed(2).substring(1);
      result = `${wholeMillions.toLocaleString('en-US')}${decimalStr.replace(/\.?0+$/, '')}M`;
    }
  } else {
    // For values less than 1 million, show with thousands separators and decimals
    const wholeStr = value.toLocaleString('en-US');
    if (fractionalPart > 0n) {
      const fractionalStr = fractionalPart.toString().padStart(6, '0').replace(/0+$/, '');
      result = `${wholeStr}.${fractionalStr}`;
    } else {
      result = wholeStr;
    }
  }

  return result;
}

/** Format dust balance (SPECK → DUST) for display. 1 DUST = 10^15 SPECK. */
export function formatDustBalance(speckBalance: bigint): string {
  return formatBalance(speckBalance, DUST_DENOMINATION);
}
