import React from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';

export type TokenType = 'shielded' | 'unshielded';

interface Props {
  onSelect: (type: TokenType) => void;
}

interface Item {
  label: string;
  value: TokenType;
}

const tokenTypes: Item[] = [
  { label: 'Shielded', value: 'shielded' },
  { label: 'Unshielded', value: 'unshielded' },
];

export const TokenTypeSelect: React.FC<Props> = ({ onSelect }) => {
  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text dimColor>Select transfer type:</Text>
      </Box>
      <SelectInput items={tokenTypes} onSelect={(item) => onSelect(item.value)} />
    </Box>
  );
};
