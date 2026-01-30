import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import type { Subscription } from 'rxjs';
import type { WalletFacade, FacadeState } from '@midnight-ntwrk/wallet-sdk-facade';
import type { UnshieldedKeystore } from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';
import { ScreenHost } from './screens/index.js';
import { getEnvironmentConfig } from './config/environments.js';
import { initializeWallet, type WalletSecretKeys } from './lib/wallet.js';
import { useStackNavigator } from './navigation/index.js';
import type { Route } from './navigation/index.js';
import { NetworkId } from '@midnight-ntwrk/wallet-sdk-abstractions';
import type { Environment, EnvironmentConfig } from './types.js';

interface Props {
  onExit: () => Promise<void>;
}

export const App: React.FC<Props> = ({ onExit }) => {
  const nav = useStackNavigator({ name: 'environment', params: undefined });
  const [facade, setFacade] = useState<WalletFacade | undefined>();
  const [networkId, setNetworkId] = useState<NetworkId.NetworkId>();
  const [state, setState] = useState<FacadeState | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [secretKeys, setSecretKeys] = useState<WalletSecretKeys | undefined>();
  const [unshieldedKeystore, setUnshieldedKeystore] = useState<UnshieldedKeystore | undefined>();
  const [currentConfig, setCurrentConfig] = useState<EnvironmentConfig | undefined>();
  const [currentSeed, setCurrentSeed] = useState<Uint8Array | undefined>();
  const [currentEnvironment, setCurrentEnvironment] = useState<Environment | undefined>();

  // Subscribe to wallet state when facade is ready
  useEffect(() => {
    if (!facade) return;

    const subscription: Subscription = facade.state().subscribe({
      next: (newState) => {
        setState(newState);
      },
      error: (err) => {
        setError(`State update error: ${err}`);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [facade]);

  // Central keyboard handler for exit and back navigation
  useInput((input, key) => {
    // Handle Ctrl+C - exit from any screen
    if (key.ctrl && input === 'c') {
      void handleQuit();
      return;
    }

    // Handle Esc - back navigation (only if not on dashboard/initializing and can go back)
    if (key.escape) {
      if (nav.route.name !== 'dashboard' && nav.route.name !== 'initializing' && nav.canGoBack()) {
        setError(undefined); // Clear errors when navigating back
        nav.pop();
      }
    }
  });

  const handleSeedSubmit = async (seed: Uint8Array) => {
    const { environment, seedType } = (nav.route as Route<'seed'>).params;

    nav.replace('initializing', { environment, seedType, seed });

    try {
      const envConfig = getEnvironmentConfig(environment);
      const result = await initializeWallet(seed, envConfig);
      setFacade(result.facade);
      setNetworkId(result.networkId);
      setSecretKeys(result.secretKeys);
      setUnshieldedKeystore(result.unshieldedKeystore);
      setCurrentConfig(envConfig);
      setCurrentSeed(seed);
      setCurrentEnvironment(environment);
      nav.replace('dashboard', { environment });
    } catch (err) {
      setError(`Failed to initialize wallets: ${err instanceof Error ? err.message : String(err)}`);
      nav.replace('seed', { environment, seedType });
    }
  };

  const handleSettingsChange = async (newEnvironment: Environment, newConfig: EnvironmentConfig) => {
    if (!currentSeed) {
      setError('No seed available for wallet rebuild');
      return;
    }

    // Stop current facade
    if (facade) {
      await facade.stop();
      setFacade(undefined);
      setState(undefined);
    }

    // Show initializing screen
    nav.replace('initializing', {
      environment: newEnvironment,
      seedType: 'hex', // doesn't matter for rebuild
      seed: currentSeed,
    });

    try {
      const result = await initializeWallet(currentSeed, newConfig);
      setFacade(result.facade);
      setNetworkId(result.networkId);
      setSecretKeys(result.secretKeys);
      setUnshieldedKeystore(result.unshieldedKeystore);
      setCurrentConfig(newConfig);
      setCurrentEnvironment(newEnvironment);
      nav.replace('dashboard', { environment: newEnvironment });
    } catch (err) {
      setError(`Failed to rebuild wallet: ${err instanceof Error ? err.message : String(err)}`);
      // Try to restore previous state
      if (currentEnvironment && currentConfig) {
        nav.replace('dashboard', { environment: currentEnvironment });
      }
    }
  };

  const handleQuit = async () => {
    if (facade) {
      await facade.stop();
    }
    await onExit();
  };

  return (
    <Box flexDirection="column">
      <ScreenHost
        route={nav.route}
        nav={nav}
        state={state}
        networkId={networkId!}
        facade={facade}
        secretKeys={secretKeys}
        unshieldedKeystore={unshieldedKeystore}
        currentConfig={currentConfig}
        onSeedSubmit={handleSeedSubmit}
        onSettingsChange={(env, config) => void handleSettingsChange(env, config)}
        onQuit={() => void handleQuit()}
      />

      {error && (
        <Box marginTop={1}>
          <Text color="red">{error}</Text>
        </Box>
      )}
    </Box>
  );
};
