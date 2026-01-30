import React, { useState } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import { formatBalance } from '../../../utils/balance.js';
import { getTokenDisplayName } from '../../../utils/display.js';

interface Props {
  tokenId: string;
  availableBalance: bigint;
  onSubmit: (amount: bigint) => void;
  error?: string;
}

export const AmountInput: React.FC<Props> = ({ tokenId, availableBalance, onSubmit, error }) => {
  const [value, setValue] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = (input: string) => {
    setLocalError('');

    const trimmed = input.trim();
    if (!trimmed) {
      setLocalError('Please enter an amount');
      return;
    }

    // Parse the amount (supports decimal notation)
    let amount: bigint;
    try {
      if (trimmed.includes('.')) {
        const [intPart, decPart] = trimmed.split('.');
        const paddedDec = (decPart || '').padEnd(6, '0').slice(0, 6);
        amount = BigInt(intPart || '0') * BigInt(10 ** 6) + BigInt(paddedDec);
      } else {
        amount = BigInt(trimmed) * BigInt(10 ** 6);
      }
    } catch {
      setLocalError('Invalid amount format');
      return;
    }

    if (amount <= 0n) {
      setLocalError('Amount must be greater than zero');
      return;
    }

    if (amount > availableBalance) {
      setLocalError(`Insufficient balance. Available: ${formatBalance(availableBalance)}`);
      return;
    }

    onSubmit(amount);
  };

  const displayError = error || localError;

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text dimColor>
          Available balance ({getTokenDisplayName(tokenId)}): <Text bold>{formatBalance(availableBalance)}</Text>
        </Text>
      </Box>
      <Box marginBottom={1}>
        <Text dimColor>Enter amount:</Text>
      </Box>
      <Box>
        <Text dimColor>› </Text>
        <TextInput value={value} onChange={setValue} onSubmit={handleSubmit} placeholder="0.00" />
      </Box>
      {displayError && (
        <Box marginTop={1} paddingLeft={2}>
          <Text color="red">✗ {displayError}</Text>
        </Box>
      )}
    </Box>
  );
};
