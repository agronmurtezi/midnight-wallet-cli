import type { NetworkId } from '@midnight-ntwrk/wallet-sdk-abstractions';

/**
 * Supported environment names for the CLI
 */
export type Environment = 'preprod' | 'preview' | 'qanet' | 'dev' | 'undeployed';

/**
 * Supported seed input types
 */
export type SeedType = 'mnemonic' | 'hex' | 'randomHex';

/**
 * Configuration for a specific environment
 */
export interface EnvironmentConfig {
  /** Network identifier used by the wallet SDK */
  networkId: NetworkId.NetworkId;
  /** HTTP URL for the indexer GraphQL endpoint */
  indexerHttpUrl: string;
  /** WebSocket URL for the indexer GraphQL subscriptions */
  indexerWsUrl: string;
  /** WebSocket URL for the node RPC endpoint */
  nodeWsUrl: string;
  /** HTTP URL for the proving server */
  provingServerUrl: string;
}

/**
 * Result of a transaction execution (transfer, registration, deregistration)
 */
export type TransactionResult = { success: true; txId: string } | { success: false; error: string } | null;
