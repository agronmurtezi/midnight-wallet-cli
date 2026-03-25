#!/usr/bin/env node

import { initializeWallet } from './lib/wallet.js';
import { getEnvironmentConfig } from './config/environments.js';
import type { Subscription } from 'rxjs';
import { switchMap } from 'rxjs';
import { BlockHash } from '@midnight-ntwrk/wallet-sdk-indexer-client';
import { QueryRunner } from '@midnight-ntwrk/wallet-sdk-indexer-client/effect';

let subscription: Subscription | undefined;

async function main() {
  const envConfig = getEnvironmentConfig('qanet');
  const seed = Buffer.from('....', 'hex');
  const result = await initializeWallet(seed, envConfig);
  subscription = result.facade
    .state()
    .pipe(
      switchMap(async (newState) => {
        const blockNumber = Number(newState.dust.progress.appliedIndex);
        if (blockNumber >= 982 && blockNumber <= 1020) {
          console.log('Processing block:', blockNumber);
          const query = await QueryRunner.runPromise(
            BlockHash,
            {
              offset: {
                height: Number(newState.dust.progress.appliedIndex),
              },
            },
            { url: envConfig.indexerHttpUrl },
          );
          console.log(
            `Block: ${newState.dust.progress.appliedIndex}`,
            '; Dust tokens:',
            newState.dust.availableCoins.length,
          );
          const date = new Date(query.block?.timestamp ?? 0);
          console.log(`Block Time:`, date.toISOString(), 'Timestamp:', query.block?.timestamp);
          console.log(newState.dust.availableCoinsWithFullInfo(date));
        }

        if (newState.dust.progress.appliedIndex > 1039n) {
          console.log('Stopping..');
          subscription!.unsubscribe();
          // process.exit(0);
        }

        return newState;
      }),
    )
    .subscribe();
}

main()
  .then(console.log)
  .catch((error) => {
    console.error('Some error occurred', error);
    if (subscription) subscription.unsubscribe();
  });
