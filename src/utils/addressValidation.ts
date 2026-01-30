import {
  MidnightBech32m,
  ShieldedAddress,
  UnshieldedAddress,
  DustAddress,
} from '@midnight-ntwrk/wallet-sdk-address-format';
import type { NetworkId } from '@midnight-ntwrk/wallet-sdk-abstractions';

export type AddressValidationResult = { valid: true; address: string } | { valid: false; error: string };

/**
 * Validates a shielded address (mn_shield-addr prefix)
 */
export function validateShieldedAddress(addressStr: string, networkId: NetworkId.NetworkId): AddressValidationResult {
  try {
    const parsed = MidnightBech32m.parse(addressStr);

    if (parsed.type !== 'shield-addr') {
      return {
        valid: false,
        error: `Expected shielded address (mn_shield-addr...), got ${parsed.type}`,
      };
    }

    ShieldedAddress.codec.decode(networkId, parsed);

    return { valid: true, address: addressStr };
  } catch (err) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : 'Invalid shielded address format',
    };
  }
}

/**
 * Validates an unshielded address (mn_addr prefix)
 */
export function validateUnshieldedAddress(addressStr: string, networkId: NetworkId.NetworkId): AddressValidationResult {
  try {
    const parsed = MidnightBech32m.parse(addressStr);

    if (parsed.type !== 'addr') {
      return {
        valid: false,
        error: `Expected unshielded address (mn_addr...), got ${parsed.type}`,
      };
    }

    UnshieldedAddress.codec.decode(networkId, parsed);

    return { valid: true, address: addressStr };
  } catch (err) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : 'Invalid unshielded address format',
    };
  }
}

/**
 * Validates a dust address (mn_dust prefix)
 */
export function validateDustAddress(addressStr: string, networkId: NetworkId.NetworkId): AddressValidationResult {
  try {
    const parsed = MidnightBech32m.parse(addressStr);

    if (parsed.type !== 'dust') {
      return {
        valid: false,
        error: `Expected dust address (mn_dust...), got ${parsed.type}`,
      };
    }

    DustAddress.codec.decode(networkId, parsed);

    return { valid: true, address: addressStr };
  } catch (err) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : 'Invalid dust address format',
    };
  }
}

/**
 * Validates an address based on the token type
 */
export function validateAddress(
  addressStr: string,
  tokenType: 'shielded' | 'unshielded',
  networkId: NetworkId.NetworkId,
): AddressValidationResult {
  return tokenType === 'shielded'
    ? validateShieldedAddress(addressStr, networkId)
    : validateUnshieldedAddress(addressStr, networkId);
}
