import { NetworkId } from '@midnight-ntwrk/wallet-sdk-abstractions';
import type { Environment, EnvironmentConfig } from '../types.js';

/**
 * Proving server URL (runs locally)
 * Users should start a proving server instance before using the CLI
 */
export const PROVING_SERVER_URL = 'http://localhost:6300';

/**
 * Environment options for selection UI
 */
export const ENVIRONMENT_OPTIONS: Array<{ label: string; value: Environment }> = [
  { label: 'PreProd', value: 'preprod' },
  { label: 'Preview', value: 'preview' },
  { label: 'QANet', value: 'qanet' },
  { label: 'DevNet', value: 'dev' },
  { label: 'Undeployed', value: 'undeployed' },
];

/**
 * Derive the WebSocket URL from an HTTP URL
 * Converts https:// to wss:// (or http:// to ws://) and appends /ws
 */
export function deriveIndexerWsUrl(httpUrl: string): string {
  const wsUrl = httpUrl.replace(/^https:\/\//, 'wss://').replace(/^http:\/\//, 'ws://');
  return wsUrl.endsWith('/ws') ? wsUrl : `${wsUrl}/ws`;
}

/**
 * Environment configurations for all supported networks
 */
export const ENVIRONMENTS: Record<Environment, EnvironmentConfig> = {
  preprod: {
    networkId: NetworkId.NetworkId.PreProd,
    indexerHttpUrl: 'https://indexer.preprod.midnight.network/api/v3/graphql',
    indexerWsUrl: 'wss://indexer.preprod.midnight.network/api/v3/graphql/ws',
    nodeWsUrl: 'wss://rpc.preprod.midnight.network',
    provingServerUrl: PROVING_SERVER_URL,
  },
  preview: {
    networkId: NetworkId.NetworkId.Preview,
    indexerHttpUrl: 'https://indexer.preview.midnight.network/api/v3/graphql',
    indexerWsUrl: 'wss://indexer.preview.midnight.network/api/v3/graphql/ws',
    nodeWsUrl: 'wss://rpc.preview.midnight.network',
    provingServerUrl: PROVING_SERVER_URL,
  },
  qanet: {
    networkId: NetworkId.NetworkId.QaNet,
    indexerHttpUrl: 'https://indexer.qanet.dev.midnight.network/api/v3/graphql',
    indexerWsUrl: 'wss://indexer.qanet.dev.midnight.network/api/v3/graphql/ws',
    nodeWsUrl: 'wss://rpc.qanet.dev.midnight.network',
    provingServerUrl: PROVING_SERVER_URL,
  },
  dev: {
    networkId: NetworkId.NetworkId.DevNet,
    indexerHttpUrl: 'https://indexer.devnet.midnight.network/api/v3/graphql',
    indexerWsUrl: 'wss://indexer.devnet.midnight.network/api/v3/graphql/ws',
    nodeWsUrl: 'wss://rpc.devnet.midnight.network',
    provingServerUrl: PROVING_SERVER_URL,
  },
  undeployed: {
    networkId: NetworkId.NetworkId.Undeployed,
    indexerHttpUrl: 'http://localhost:8088/api/v3/graphql',
    indexerWsUrl: 'ws://localhost:8088/api/v3/graphql/ws',
    nodeWsUrl: 'ws://localhost:8080',
    provingServerUrl: PROVING_SERVER_URL,
  },
};

/**
 * Get the environment configuration for a given environment name
 */
export function getEnvironmentConfig(environment: Environment): EnvironmentConfig {
  return ENVIRONMENTS[environment];
}
