import React from 'react';
import { Box, Text } from 'ink';
import type { UtxoWithMeta } from '@midnight-ntwrk/wallet-sdk-facade';
import { formatBalance } from '../../../utils/balance.js';

interface Props {
  selectedUtxos: UtxoWithMeta[];
}

export const DeregistrationConfirm: React.FC<Props> = ({ selectedUtxos }) => {
  const totalNightValue = selectedUtxos.reduce((sum, utxo) => sum + utxo.utxo.value, 0n);

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold color="yellow">
          Confirm Dust Deregistration
        </Text>
      </Box>

      <Box flexDirection="column" marginLeft={2}>
        <Box>
          <Text dimColor>UTXOs to deregister: </Text>
          <Text bold>{selectedUtxos.length}</Text>
        </Box>

        <Box>
          <Text dimColor>Total NIGHT value: </Text>
          <Text bold>{formatBalance(totalNightValue)}</Text>
          <Text dimColor> NIGHT</Text>
        </Box>

        <Box marginTop={1}>
          <Text dimColor>These UTXOs will no longer generate dust rewards.</Text>
        </Box>
      </Box>

      <Box marginTop={2}>
        <Text dimColor>
          Press{' '}
          <Text bold color="cyan">
            Enter
          </Text>{' '}
          to confirm deregistration
        </Text>
      </Box>
    </Box>
  );
};
