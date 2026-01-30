import type { WalletFacade, UtxoWithMeta } from '@midnight-ntwrk/wallet-sdk-facade';
import type { UnshieldedKeystore } from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';

export interface DustRegistrationParams {
  nightUtxos: UtxoWithMeta[];
  dustReceiverAddress?: string | undefined;
}

export type DustRegistrationResult = { success: true; txId: string } | { success: false; error: string };

/**
 * Execute dust registration for Night UTXOs
 */
export async function executeDustRegistration(
  facade: WalletFacade,
  params: DustRegistrationParams,
  unshieldedKeystore: UnshieldedKeystore,
): Promise<DustRegistrationResult> {
  try {
    if (params.nightUtxos.length === 0) {
      return {
        success: false,
        error: 'At least one Night UTXO is required for registration',
      };
    }

    // Step 1: Create dust registration recipe
    const recipe = await facade.registerNightUtxosForDustGeneration(
      params.nightUtxos,
      unshieldedKeystore.getPublicKey(),
      (payload) => unshieldedKeystore.signData(payload),
      params.dustReceiverAddress,
    );

    // Step 2: Finalize (generate proofs)
    const provenTx = await facade.finalizeRecipe(recipe);

    // Step 3: Submit to network
    const txId = await facade.submitTransaction(provenTx);

    return { success: true, txId };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error during dust registration',
    };
  }
}
