import React from 'react';
import { Box, Text } from 'ink';
import { formatBalance } from '../../../utils/balance.js';
import { getTokenDisplayName, truncateAddress } from '../../../utils/display.js';

interface Props {
  tokenType: 'shielded' | 'unshielded';
  tokenId: string;
  amount: bigint;
  receiverAddress: string;
}

export const TransferConfirm: React.FC<Props> = ({ tokenType, tokenId, amount, receiverAddress }) => {
  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold>Confirm Transfer</Text>
      </Box>

      <Box flexDirection="column" marginLeft={2}>
        <Box>
          <Text dimColor>Type: </Text>
          <Text color={tokenType === 'shielded' ? 'magenta' : 'blue'}>{tokenType}</Text>
        </Box>
        <Box>
          <Text dimColor>Token: </Text>
          <Text>{getTokenDisplayName(tokenId)}</Text>
        </Box>
        <Box>
          <Text dimColor>Amount: </Text>
          <Text bold>{formatBalance(amount)}</Text>
        </Box>
        <Box>
          <Text dimColor>To: </Text>
          <Text>{truncateAddress(receiverAddress)}</Text>
        </Box>
      </Box>

      <Box marginTop={1}>
        <Text dimColor>Press Enter to confirm</Text>
      </Box>
    </Box>
  );
};
