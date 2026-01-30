import React from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import type { Route, Navigator } from '../../navigation/index.js';
import type { Environment } from '../../types.js';
import { ENVIRONMENT_OPTIONS } from '../../config/environments.js';

interface Props {
  route: Route<'environment'>;
  nav: Navigator;
}

export const EnvironmentScreen: React.FC<Props> = ({ nav }) => {
  const handleSelectEnvironment = (environment: Environment) => {
    nav.push('seedType', { environment });
  };

  return (
    <Box flexDirection="column">
      <Box marginBottom={2}>
        <Text bold>
          <Text color="cyan">Midnight</Text> <Text dimColor>Wallet CLI</Text>
        </Text>
      </Box>
      <Box marginBottom={1}>
        <Text dimColor>Select network environment:</Text>
      </Box>
      <SelectInput items={ENVIRONMENT_OPTIONS} onSelect={(item) => handleSelectEnvironment(item.value)} />
    </Box>
  );
};
