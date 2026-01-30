import React, { useState } from 'react';
import type { Route, Navigator } from '../../navigation/index.js';
import { Box, Text, useInput } from 'ink';
import type { WalletFacade, FacadeState } from '@midnight-ntwrk/wallet-sdk-facade';
import type { UnshieldedKeystore } from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';
import { WalletStateView } from './WalletStateView.js';
import { SyncProgressView } from './SyncProgressView.js';
import { TransferView } from './TransferView.js';
import { DustRegistrationView } from './DustRegistrationView.js';
import { DustDeregistrationView } from './DustDeregistrationView.js';
import { SettingsView } from './SettingsView.js';
import { NetworkId } from '@midnight-ntwrk/wallet-sdk-abstractions';
import { StatusHeader } from '../../components/StatusHeader.js';
import type { WalletSecretKeys } from '../../lib/wallet.js';
import type { Environment, EnvironmentConfig } from '../../types.js';

interface Props {
  route: Route<'dashboard'>;
  nav: Navigator;
  networkId: NetworkId.NetworkId;
  state: FacadeState | undefined;
  facade: WalletFacade | undefined;
  secretKeys: WalletSecretKeys | undefined;
  unshieldedKeystore: UnshieldedKeystore | undefined;
  currentConfig: EnvironmentConfig;
  onSettingsChange: (environment: Environment, config: EnvironmentConfig) => void;
  onQuit: () => void;
}

type View = 'state' | 'sync' | 'transfer' | 'dust-registration' | 'dust-deregistration' | 'settings';

export const DashboardScreen: React.FC<Props> = ({
  route,
  state,
  networkId,
  facade,
  secretKeys,
  unshieldedKeystore,
  currentConfig,
  onSettingsChange,
  onQuit,
}) => {
  const [currentView, setCurrentView] = useState<View>('state');
  const { environment } = route.params;

  // Dashboard-specific keyboard shortcuts (s, p, t, r, d, c, q)
  useInput((input) => {
    // Don't handle shortcuts when in transfer, dust, or settings views (they handle their own input)
    if (
      currentView === 'transfer' ||
      currentView === 'dust-registration' ||
      currentView === 'dust-deregistration' ||
      currentView === 'settings'
    )
      return;

    if (input === 's') {
      setCurrentView('state');
    } else if (input === 'p') {
      setCurrentView('sync');
    } else if (input === 't') {
      setCurrentView('transfer');
    } else if (input === 'r') {
      setCurrentView('dust-registration');
    } else if (input === 'd') {
      setCurrentView('dust-deregistration');
    } else if (input === 'c') {
      setCurrentView('settings');
    } else if (input === 'q') {
      onQuit();
    }
  });

  const handleTransferBack = () => {
    setCurrentView('state');
  };

  const handleDustRegistrationBack = () => {
    setCurrentView('state');
  };

  const handleDustDeregistrationBack = () => {
    setCurrentView('state');
  };

  const handleSettingsBack = () => {
    setCurrentView('state');
  };

  const handleSettingsApply = (newEnvironment: Environment, newConfig: EnvironmentConfig) => {
    onSettingsChange(newEnvironment, newConfig);
  };

  const renderView = () => {
    if (!state) {
      return (
        <Box>
          <Text color="yellow">Waiting for wallet state...</Text>
        </Box>
      );
    }

    if (currentView === 'transfer') {
      if (!facade || !secretKeys || !unshieldedKeystore) {
        return (
          <Box>
            <Text color="red">Wallet not fully initialized for transfers.</Text>
          </Box>
        );
      }
      return (
        <TransferView
          state={state}
          networkId={networkId}
          facade={facade}
          secretKeys={secretKeys}
          unshieldedKeystore={unshieldedKeystore}
          onBack={handleTransferBack}
        />
      );
    }

    if (currentView === 'dust-registration') {
      if (!facade || !unshieldedKeystore) {
        return (
          <Box>
            <Text color="red">Wallet not fully initialized for dust registration.</Text>
          </Box>
        );
      }
      return (
        <DustRegistrationView
          state={state}
          networkId={networkId}
          facade={facade}
          unshieldedKeystore={unshieldedKeystore}
          onBack={handleDustRegistrationBack}
        />
      );
    }

    if (currentView === 'dust-deregistration') {
      if (!facade || !unshieldedKeystore) {
        return (
          <Box>
            <Text color="red">Wallet not fully initialized for dust deregistration.</Text>
          </Box>
        );
      }
      return (
        <DustDeregistrationView
          state={state}
          facade={facade}
          unshieldedKeystore={unshieldedKeystore}
          onBack={handleDustDeregistrationBack}
        />
      );
    }

    if (currentView === 'settings') {
      return (
        <SettingsView
          currentEnvironment={environment}
          currentConfig={currentConfig}
          onApply={handleSettingsApply}
          onBack={handleSettingsBack}
        />
      );
    }

    return (
      <>
        {currentView === 'state' ? (
          <WalletStateView state={state} networkId={networkId} />
        ) : (
          <SyncProgressView state={state} />
        )}

        <StatusHeader environment={environment} state={state} />

        <Box paddingTop={1} paddingX={1}>
          <Text dimColor>
            <Text bold color="cyan">
              s
            </Text>
            <Text> state </Text>
            <Text dimColor>· </Text>
            <Text bold color="cyan">
              p
            </Text>
            <Text> progress </Text>
            <Text dimColor>· </Text>
            <Text bold color="cyan">
              t
            </Text>
            <Text> transfer </Text>
            <Text dimColor>· </Text>
            <Text bold color="cyan">
              r
            </Text>
            <Text> register dust </Text>
            <Text dimColor>· </Text>
            <Text bold color="cyan">
              d
            </Text>
            <Text> deregister dust </Text>
            <Text dimColor>· </Text>
            <Text bold color="cyan">
              c
            </Text>
            <Text> settings </Text>
            <Text dimColor>· </Text>
            <Text bold color="cyan">
              q
            </Text>
            <Text> quit</Text>
          </Text>
        </Box>
      </>
    );
  };

  return <Box flexDirection="column">{renderView()}</Box>;
};
