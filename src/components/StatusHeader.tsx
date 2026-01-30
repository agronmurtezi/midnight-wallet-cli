import React from 'react';
import { Box, Text } from 'ink';
import type { FacadeState } from '@midnight-ntwrk/wallet-sdk-facade';
import type { Environment } from '../types.js';
import { getSyncStatus } from '../utils/sync.js';

interface Props {
  environment: Environment | undefined;
  state: FacadeState | undefined;
}

export const StatusHeader: React.FC<Props> = ({ environment, state }) => {
  if (!environment) return null;

  const getSyncColor = () => {
    if (!state) return 'yellow';
    return state.isSynced ? 'green' : 'yellow';
  };

  return (
    <Box marginTop={1} flexDirection="column" borderStyle="round" borderColor="gray" paddingX={1}>
      <Text>
        Environment:{' '}
        <Text bold color="cyan">
          {environment}
        </Text>
      </Text>

      {state && (
        <Text>
          Status:{' '}
          <Text bold color={getSyncColor()}>
            {getSyncStatus(state)}
          </Text>
        </Text>
      )}
    </Box>
  );
};
