import React from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import { formatBalance } from '../../../utils/balance.js';
import { getTokenDisplayName } from '../../../utils/display.js';

interface Props {
  tokenType: 'shielded' | 'unshielded';
  balances: Record<string, bigint>;
  onSelect: (tokenId: string) => void;
}

interface Item {
  label: string;
  value: string;
}

export const TokenSelect: React.FC<Props> = ({ tokenType, balances, onSelect }) => {
  const entries = Object.entries(balances);

  if (entries.length === 0) {
    return (
      <Box flexDirection="column">
        <Text color="yellow">No {tokenType} tokens available for transfer.</Text>
      </Box>
    );
  }

  const items: Item[] = entries.map(([tokenId, balance]) => ({
    label: `${getTokenDisplayName(tokenId)}: ${formatBalance(balance)}`,
    value: tokenId,
  }));

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text dimColor>Select token to transfer:</Text>
      </Box>
      <SelectInput items={items} onSelect={(item) => onSelect(item.value)} />
    </Box>
  );
};
