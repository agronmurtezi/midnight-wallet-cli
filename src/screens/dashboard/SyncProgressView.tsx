import React from 'react';
import { Box, Text } from 'ink';
import type { FacadeState } from '@midnight-ntwrk/wallet-sdk-facade';

interface Props {
  state: FacadeState;
}

function formatProgress(current: bigint | number, total: bigint | number): string {
  const currentNum = typeof current === 'bigint' ? Number(current) : current;
  const totalNum = typeof total === 'bigint' ? Number(total) : total;

  if (totalNum === 0) {
    return '0/0 (100%)';
  }

  const percentage = Math.floor((currentNum / totalNum) * 100);
  return `${currentNum}/${totalNum} (${percentage}%)`;
}

export const SyncProgressView: React.FC<Props> = ({ state }) => {
  const shieldedProgress = state.shielded.progress;
  const unshieldedProgress = state.unshielded.progress;
  const dustProgress = state.dust.progress;

  return (
    <Box flexDirection="column">
      <Box borderStyle="round" borderColor="gray" paddingX={1} marginBottom={1}>
        <Text bold>Sync Progress</Text>
      </Box>

      {/* Shielded Wallet Sync */}
      <Box flexDirection="column" marginBottom={1}>
        <Box>
          <Text color="magenta">▸ </Text>
          <Text bold color="magenta">
            Shielded Wallet
          </Text>
        </Box>
        <Box marginLeft={2} marginTop={1}>
          <Text dimColor>Progress </Text>
          <Text>{formatProgress(shieldedProgress.appliedIndex ?? 0, shieldedProgress.highestRelevantIndex ?? 0)}</Text>
        </Box>
      </Box>

      {/* Unshielded Wallet Sync */}
      <Box flexDirection="column" marginBottom={1}>
        <Box>
          <Text color="blue">▸ </Text>
          <Text bold color="blue">
            Unshielded Wallet
          </Text>
        </Box>
        <Box marginLeft={2} marginTop={1}>
          <Text dimColor>Progress </Text>
          <Text>{formatProgress(unshieldedProgress.appliedId, unshieldedProgress.highestTransactionId)}</Text>
        </Box>
      </Box>

      {/* Dust Wallet Sync */}
      <Box flexDirection="column">
        <Box>
          <Text color="yellow">▸ </Text>
          <Text bold color="yellow">
            Dust Wallet
          </Text>
        </Box>
        <Box marginLeft={2} marginTop={1}>
          <Text dimColor>Progress </Text>
          <Text>{formatProgress(dustProgress.appliedIndex ?? 0, dustProgress.highestRelevantIndex ?? 0)}</Text>
        </Box>
      </Box>
    </Box>
  );
};
