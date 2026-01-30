import type { WalletFacade, BalancingRecipe } from '@midnight-ntwrk/wallet-sdk-facade';
import type { UnshieldedKeystore } from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';
import type * as ledger from '@midnight-ntwrk/ledger-v7';

export interface TransferParams {
  tokenType: 'shielded' | 'unshielded';
  tokenId: string;
  amount: bigint;
  receiverAddress: string;
}

export type TransferResult = { success: true; txId: string } | { success: false; error: string };

export interface TransferSecretKeys {
  shieldedSecretKeys: ledger.ZswapSecretKeys;
  dustSecretKey: ledger.DustSecretKey;
}

/**
 * Execute a token transfer
 */
export async function executeTransfer(
  facade: WalletFacade,
  params: TransferParams,
  secretKeys: TransferSecretKeys,
  unshieldedKeystore?: UnshieldedKeystore,
): Promise<TransferResult> {
  try {
    const ttl = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Step 1: Create transfer transaction
    const recipe = await facade.transferTransaction(
      [
        {
          type: params.tokenType,
          outputs: [
            {
              type: params.tokenId,
              receiverAddress: params.receiverAddress,
              amount: params.amount,
            },
          ],
        },
      ],
      secretKeys,
      { ttl },
    );

    // Step 2: Sign if unshielded (requires signature)
    let signedRecipe: BalancingRecipe = recipe;
    if (params.tokenType === 'unshielded') {
      if (!unshieldedKeystore) {
        return {
          success: false,
          error: 'Unshielded keystore required for unshielded transfers',
        };
      }
      signedRecipe = await facade.signRecipe(recipe, (payload) => unshieldedKeystore.signData(payload));
    }

    // Step 3: Finalize (generate proofs)
    const finalizedTx = await facade.finalizeRecipe(signedRecipe);

    // Step 4: Submit to network
    const txId = await facade.submitTransaction(finalizedTx);

    return { success: true, txId };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error during transfer',
    };
  }
}
