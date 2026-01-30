import React, { useState, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import SelectInput from 'ink-select-input';
import type { Environment, EnvironmentConfig } from '../../types.js';
import { ENVIRONMENTS, ENVIRONMENT_OPTIONS, deriveIndexerWsUrl } from '../../config/environments.js';
import { BackHint } from '../../components/BackHint.js';

type SettingsStep = 'menu' | 'selectEnvironment' | 'editIndexerUrl' | 'editNodeWs' | 'editProvingServer' | 'confirm';

interface Props {
  currentEnvironment: Environment;
  currentConfig: EnvironmentConfig;
  onApply: (environment: Environment, config: EnvironmentConfig) => void;
  onBack: () => void;
}

type MenuOption = 'environment' | 'indexerUrl' | 'nodeWs' | 'provingServer';

const MENU_OPTIONS: Array<{ label: string; value: MenuOption }> = [
  { label: 'Change Environment', value: 'environment' },
  { label: 'Edit Indexer URL', value: 'indexerUrl' },
  { label: 'Edit Node WebSocket URL', value: 'nodeWs' },
  { label: 'Edit Proving Server URL', value: 'provingServer' },
];

export const SettingsView: React.FC<Props> = ({ currentEnvironment, currentConfig, onApply, onBack }) => {
  const [step, setStep] = useState<SettingsStep>('menu');
  const [environment, setEnvironment] = useState<Environment>(currentEnvironment);
  const [config, setConfig] = useState<EnvironmentConfig>({ ...currentConfig });
  const [editValue, setEditValue] = useState('');
  const [menuKey, setMenuKey] = useState(0);

  const hasChanges =
    environment !== currentEnvironment ||
    config.indexerHttpUrl !== currentConfig.indexerHttpUrl ||
    config.nodeWsUrl !== currentConfig.nodeWsUrl ||
    config.provingServerUrl !== currentConfig.provingServerUrl;

  useInput((input, key) => {
    if (key.escape) {
      switch (step) {
        case 'menu':
          onBack();
          break;
        case 'confirm':
          setStep('menu');
          break;
        default:
          setStep('menu');
          break;
      }
    }

    if (step === 'confirm' && key.return) {
      onApply(environment, config);
    }

    // Keyboard shortcuts only work in menu
    if (step === 'menu') {
      if (input === 'a' && hasChanges) {
        setStep('confirm');
      } else if (input === 'r') {
        // Reset both environment and config to original values
        setEnvironment(currentEnvironment);
        setConfig({ ...currentConfig });
        setMenuKey((k) => k + 1); // Force SelectInput to remount
      }
    }
  });

  const handleMenuSelect = useCallback(
    (item: { value: MenuOption }) => {
      switch (item.value) {
        case 'environment':
          setStep('selectEnvironment');
          break;
        case 'indexerUrl':
          setEditValue(config.indexerHttpUrl);
          setStep('editIndexerUrl');
          break;
        case 'nodeWs':
          setEditValue(config.nodeWsUrl);
          setStep('editNodeWs');
          break;
        case 'provingServer':
          setEditValue(config.provingServerUrl);
          setStep('editProvingServer');
          break;
      }
    },
    [config],
  );

  const handleEnvironmentSelect = useCallback((item: { value: Environment }) => {
    const newEnv = item.value;
    const newConfig = ENVIRONMENTS[newEnv];
    setEnvironment(newEnv);
    setConfig({ ...newConfig });
    setStep('menu');
  }, []);

  const handleIndexerUrlSubmit = useCallback(() => {
    if (editValue.trim()) {
      const httpUrl = editValue.trim();
      const wsUrl = deriveIndexerWsUrl(httpUrl);
      setConfig((prev) => ({ ...prev, indexerHttpUrl: httpUrl, indexerWsUrl: wsUrl }));
    }
    setStep('menu');
  }, [editValue]);

  const handleUrlSubmit = useCallback(
    (field: keyof EnvironmentConfig) => {
      if (editValue.trim()) {
        setConfig((prev) => ({ ...prev, [field]: editValue.trim() }));
      }
      setStep('menu');
    },
    [editValue],
  );

  const renderCurrentConfig = () => (
    <Box flexDirection="column">
      <Box>
        <Text bold color="cyan">
          Current Configuration
        </Text>
      </Box>
      <Box flexDirection="column" paddingLeft={1}>
        <Text>
          <Text dimColor>Environment: </Text>
          <Text color={environment !== currentEnvironment ? 'yellow' : ''}>{environment}</Text>
          {environment !== currentEnvironment && <Text color="yellow"> (changed)</Text>}
        </Text>
        <Text>
          <Text dimColor>Network ID: </Text>
          <Text>{config.networkId}</Text>
        </Text>
        <Text>
          <Text dimColor>Indexer URL: </Text>
          <Text color={config.indexerHttpUrl !== currentConfig.indexerHttpUrl ? 'yellow' : ''}>
            {config.indexerHttpUrl}
          </Text>
          {config.indexerHttpUrl !== currentConfig.indexerHttpUrl && <Text color="yellow"> *</Text>}
        </Text>
        <Text>
          <Text dimColor>Indexer WS: </Text>
          <Text dimColor>{config.indexerWsUrl}</Text>
          <Text dimColor> (derived)</Text>
        </Text>
        <Text>
          <Text dimColor>Node WS: </Text>
          <Text color={config.nodeWsUrl !== currentConfig.nodeWsUrl ? 'yellow' : ''}>{config.nodeWsUrl}</Text>
          {config.nodeWsUrl !== currentConfig.nodeWsUrl && <Text color="yellow"> *</Text>}
        </Text>
        <Text>
          <Text dimColor>Proving Server: </Text>
          <Text color={config.provingServerUrl !== currentConfig.provingServerUrl ? 'yellow' : ''}>
            {config.provingServerUrl}
          </Text>
          {config.provingServerUrl !== currentConfig.provingServerUrl && <Text color="yellow"> *</Text>}
        </Text>
      </Box>
      {hasChanges && (
        <Box marginTop={1}>
          <Text color="yellow">* Unsaved changes</Text>
        </Box>
      )}
    </Box>
  );

  const renderStep = () => {
    switch (step) {
      case 'menu':
        return (
          <Box flexDirection="column">
            {renderCurrentConfig()}
            <Box marginTop={1}>
              <Text bold>Select an option:</Text>
            </Box>
            <SelectInput key={menuKey} items={MENU_OPTIONS} onSelect={handleMenuSelect} />
            <Box marginTop={1}>
              <Text dimColor>
                <Text bold color="cyan">
                  a
                </Text>{' '}
                apply{hasChanges ? '' : ' (no changes)'} ·{' '}
                <Text bold color="cyan">
                  r
                </Text>{' '}
                reset
              </Text>
            </Box>
          </Box>
        );

      case 'selectEnvironment':
        return (
          <Box flexDirection="column">
            <Text bold>Select Environment:</Text>
            <Text dimColor>This will reset all URLs to the environment defaults.</Text>
            <SelectInput
              items={ENVIRONMENT_OPTIONS}
              initialIndex={ENVIRONMENT_OPTIONS.findIndex((e) => e.value === environment)}
              onSelect={handleEnvironmentSelect}
            />
          </Box>
        );

      case 'editIndexerUrl':
        return (
          <Box flexDirection="column">
            <Text bold>Edit Indexer URL:</Text>
            <Text dimColor>The WebSocket URL will be derived automatically.</Text>
            <Box>
              <Text color="cyan">{`> `}</Text>
              <TextInput value={editValue} onChange={setEditValue} onSubmit={handleIndexerUrlSubmit} />
            </Box>
          </Box>
        );

      case 'editNodeWs':
        return (
          <Box flexDirection="column">
            <Text bold>Edit Node WebSocket URL:</Text>
            <Box>
              <Text color="cyan">{`> `}</Text>
              <TextInput value={editValue} onChange={setEditValue} onSubmit={() => handleUrlSubmit('nodeWsUrl')} />
            </Box>
          </Box>
        );

      case 'editProvingServer':
        return (
          <Box flexDirection="column">
            <Text bold>Edit Proving Server URL:</Text>
            <Box>
              <Text color="cyan">{`> `}</Text>
              <TextInput
                value={editValue}
                onChange={setEditValue}
                onSubmit={() => handleUrlSubmit('provingServerUrl')}
              />
            </Box>
          </Box>
        );

      case 'confirm':
        return (
          <Box flexDirection="column">
            <Box borderStyle="round" borderColor="yellow" paddingX={2} paddingY={1}>
              <Text bold color="yellow">
                Rebuild Wallet?
              </Text>
            </Box>
            <Text>Applying these changes will stop the current wallet and rebuild it with the new configuration.</Text>
            <Text>The wallet will re-sync from the network which may take some time.</Text>
            {renderCurrentConfig()}
            <Box marginTop={1}>
              <Text>
                Press{' '}
                <Text bold color="green">
                  Enter
                </Text>{' '}
                to confirm and rebuild, or{' '}
                <Text bold color="gray">
                  Esc
                </Text>{' '}
                to cancel.
              </Text>
            </Box>
          </Box>
        );
    }
  };

  return (
    <Box flexDirection="column">
      <Box borderStyle="round" borderColor="gray" paddingX={1}>
        <Text bold>Settings</Text>
      </Box>

      {renderStep()}

      {step !== 'confirm' && <BackHint />}
    </Box>
  );
};
