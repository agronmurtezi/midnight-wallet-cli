import React from 'react';
import { SetupScreen } from './setup/index.js';
import { DashboardScreen } from './dashboard/index.js';
import type { Route, Navigator } from '../navigation/index.js';
import type { WalletFacade, FacadeState } from '@midnight-ntwrk/wallet-sdk-facade';
import type { UnshieldedKeystore } from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';
import { NetworkId } from '@midnight-ntwrk/wallet-sdk-abstractions';
import type { WalletSecretKeys } from '../lib/wallet.js';
import type { Environment, EnvironmentConfig } from '../types.js';

interface Props {
  route: Route;
  nav: Navigator;
  networkId: NetworkId.NetworkId;
  state: FacadeState | undefined;
  facade: WalletFacade | undefined;
  secretKeys: WalletSecretKeys | undefined;
  unshieldedKeystore: UnshieldedKeystore | undefined;
  currentConfig: EnvironmentConfig | undefined;
  onSeedSubmit: (seed: Uint8Array) => Promise<void>;
  onSettingsChange: (environment: Environment, config: EnvironmentConfig) => void;
  onQuit: () => void;
}

/**
 * ScreenHost - Top-level screen router
 * Routes between dashboard and setup screens
 */
export const ScreenHost: React.FC<Props> = ({
  route,
  nav,
  state,
  networkId,
  facade,
  secretKeys,
  unshieldedKeystore,
  currentConfig,
  onSeedSubmit,
  onSettingsChange,
  onQuit,
}) => {
  if (route.name === 'dashboard' && currentConfig) {
    return (
      <DashboardScreen
        route={route as Route<'dashboard'>}
        nav={nav}
        state={state}
        networkId={networkId}
        facade={facade}
        secretKeys={secretKeys}
        unshieldedKeystore={unshieldedKeystore}
        currentConfig={currentConfig}
        onSettingsChange={onSettingsChange}
        onQuit={onQuit}
      />
    );
  }

  return <SetupScreen route={route} nav={nav} onSeedSubmit={onSeedSubmit} />;
};
