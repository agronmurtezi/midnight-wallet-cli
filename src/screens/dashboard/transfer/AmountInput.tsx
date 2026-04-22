import React, { useState } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import { NIGHT_TOKEN_ID } from '../../../constants.js';
import { formatBalanceForToken } from '../../../utils/balance.js';
import { getTokenDisplayName } from '../../../utils/display.js';

interface Props {
  tokenType: 'shielded' | 'unshielded';
  tokenId: string;
  availableBalance: bigint;
  onSubmit: (amount: bigint) => void;
  error?: string;
}

export const AmountInput: React.FC<Props> = ({ tokenType, tokenId, availableBalance, onSubmit, error }) => {
  const [value, setValue] = useState('');
  const [localError, setLocalError] = useState('');

  const isNight = tokenType === 'unshielded' && tokenId === NIGHT_TOKEN_ID;

  const handleSubmit = (input: string) => {
    setLocalError('');

    const trimmed = input.trim();
    if (!trimmed) {
      setLocalError('Please enter an amount');
      return;
    }

    let amount: bigint;
    try {
      if (isNight) {
        // NIGHT: parse decimal notation (1 NIGHT = 10^6 STAR)
        if (trimmed.includes('.')) {
          const [intPart, decPart] = trimmed.split('.');
          const paddedDec = (decPart || '').padEnd(6, '0').slice(0, 6);
          amount = BigInt(intPart || '0') * BigInt(10 ** 6) + BigInt(paddedDec);
        } else {
          amount = BigInt(trimmed) * BigInt(10 ** 6);
        }
      } else {
        // Custom token: parse as raw integer (no unit conversion)
        if (trimmed.includes('.')) {
          setLocalError('Custom tokens require whole number amounts');
          return;
        }
        amount = BigInt(trimmed);
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
      setLocalError(`Insufficient balance. Available: ${formatBalanceForToken(availableBalance, tokenId, tokenType)}`);
      return;
    }

    onSubmit(amount);
  };

  const displayError = error || localError;

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text dimColor>
          Available balance ({getTokenDisplayName(tokenId, tokenType)}):{' '}
          <Text bold>{formatBalanceForToken(availableBalance, tokenId, tokenType)}</Text>
        </Text>
      </Box>
      <Box marginBottom={1}>
        <Text dimColor>Enter amount:</Text>
      </Box>
      <Box>
        <Text dimColor>› </Text>
        <TextInput value={value} onChange={setValue} onSubmit={handleSubmit} placeholder={isNight ? '0.00' : '0'} />
      </Box>
      {displayError && (
        <Box marginTop={1} paddingLeft={2}>
          <Text color="red">✗ {displayError}</Text>
        </Box>
      )}
    </Box>
  );
};
