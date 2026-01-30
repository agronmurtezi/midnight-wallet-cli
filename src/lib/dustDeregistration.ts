import type { WalletFacade, UtxoWithMeta } from '@midnight-ntwrk/wallet-sdk-facade';
import type { UnshieldedKeystore } from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';

export interface DustDeregistrationParams {
  nightUtxos: UtxoWithMeta[];
}

export type DustDeregistrationResult = { success: true; txId: string } | { success: false; error: string };

/**
 * Execute dust deregistration for Night UTXOs
 */
export async function executeDustDeregistration(
  facade: WalletFacade,
  params: DustDeregistrationParams,
  unshieldedKeystore: UnshieldedKeystore,
): Promise<DustDeregistrationResult> {
  try {
    if (params.nightUtxos.length === 0) {
      return {
        success: false,
        error: 'At least one Night UTXO is required for deregistration',
      };
    }

    // Step 1: Create dust deregistration recipe
    const recipe = await facade.deregisterFromDustGeneration(
      params.nightUtxos,
      unshieldedKeystore.getPublicKey(),
      (payload) => unshieldedKeystore.signData(payload),
    );

    // Step 2: Finalize (generate proofs)
    const provenTx = await facade.finalizeRecipe(recipe);

    // Step 3: Submit to network
    const txId = await facade.submitTransaction(provenTx);

    return { success: true, txId };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error during dust deregistration',
    };
  }
}
