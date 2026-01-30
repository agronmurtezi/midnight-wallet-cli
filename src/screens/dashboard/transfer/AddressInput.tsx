import React, { useState } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import type { NetworkId } from '@midnight-ntwrk/wallet-sdk-abstractions';
import { validateAddress } from '../../../utils/addressValidation.js';
import { formatBalance } from '../../../utils/balance.js';

const NIGHT_TOKEN_ID = '0000000000000000000000000000000000000000000000000000000000000000';

interface Props {
  tokenType: 'shielded' | 'unshielded';
  tokenId: string;
  amount: bigint;
  networkId: NetworkId.NetworkId;
  onSubmit: (address: string) => void;
  error?: string;
}

function getTokenDisplayName(tokenId: string): string {
  if (tokenId === NIGHT_TOKEN_ID) {
    return 'NIGHT';
  }
  return tokenId.substring(0, 8) + '...';
}

export const AddressInput: React.FC<Props> = ({ tokenType, tokenId, amount, networkId, onSubmit, error }) => {
  const [value, setValue] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = (input: string) => {
    setLocalError('');

    const trimmed = input.trim();
    if (!trimmed) {
      setLocalError('Please enter an address');
      return;
    }

    const validation = validateAddress(trimmed, tokenType, networkId);
    if (!validation.valid) {
      setLocalError(validation.error);
      return;
    }

    onSubmit(validation.address);
  };

  const displayError = error || localError;
  const expectedPrefix = tokenType === 'shielded' ? 'mn_shield-addr...' : 'mn_addr...';

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text dimColor>
          Amount: <Text bold>{formatBalance(amount)}</Text> {getTokenDisplayName(tokenId)}
        </Text>
      </Box>
      <Box marginBottom={1}>
        <Text dimColor>Enter receiver address ({expectedPrefix}):</Text>
      </Box>
      <Box>
        <Text dimColor>› </Text>
        <TextInput value={value} onChange={setValue} onSubmit={handleSubmit} placeholder={expectedPrefix} />
      </Box>
      {displayError && (
        <Box marginTop={1} paddingLeft={2}>
          <Text color="red">✗ {displayError}</Text>
        </Box>
      )}
    </Box>
  );
};
