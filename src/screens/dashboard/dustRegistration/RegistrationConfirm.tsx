import React from 'react';
import { Box, Text } from 'ink';
import type { UtxoWithMeta } from '@midnight-ntwrk/wallet-sdk-facade';
import { formatBalance } from '../../../utils/balance.js';

interface Props {
  selectedUtxos: UtxoWithMeta[];
  dustReceiverAddress: string;
  estimatedFee: bigint | null;
}

export const RegistrationConfirm: React.FC<Props> = ({ selectedUtxos, dustReceiverAddress, estimatedFee }) => {
  const totalNightValue = selectedUtxos.reduce((sum, utxo) => sum + utxo.utxo.value, 0n);

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold color="yellow">
          Confirm Dust Registration
        </Text>
      </Box>

      <Box flexDirection="column" marginLeft={2}>
        <Box>
          <Text dimColor>UTXOs to register: </Text>
          <Text bold>{selectedUtxos.length}</Text>
        </Box>

        <Box>
          <Text dimColor>Total NIGHT value: </Text>
          <Text bold>{formatBalance(totalNightValue)}</Text>
          <Text dimColor> NIGHT</Text>
        </Box>

        <Box marginTop={1}>
          <Text dimColor>Dust receiver: </Text>
        </Box>
        <Box marginLeft={2}>
          <Text color="green">{dustReceiverAddress}</Text>
        </Box>

        {estimatedFee !== null && (
          <Box marginTop={1}>
            <Text dimColor>Estimated fee: </Text>
            <Text bold>{formatBalance(estimatedFee)}</Text>
            <Text dimColor> DUST</Text>
          </Box>
        )}
      </Box>

      <Box marginTop={2}>
        <Text dimColor>
          Press{' '}
          <Text bold color="cyan">
            Enter
          </Text>{' '}
          to confirm registration
        </Text>
      </Box>
    </Box>
  );
};
