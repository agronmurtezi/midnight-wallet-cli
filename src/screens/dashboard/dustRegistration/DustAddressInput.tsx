import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import type { NetworkId } from '@midnight-ntwrk/wallet-sdk-abstractions';
import { validateDustAddress } from '../../../utils/addressValidation.js';

interface Props {
  defaultAddress: string;
  networkId: NetworkId.NetworkId;
  onSubmit: (address: string) => void;
}

export const DustAddressInput: React.FC<Props> = ({ defaultAddress, networkId, onSubmit }) => {
  const [address, setAddress] = useState(defaultAddress);
  const [error, setError] = useState<string | undefined>();
  const [useDefault, setUseDefault] = useState(true);

  // Clear error when address changes
  useEffect(() => {
    setError(undefined);
  }, [address]);

  useInput((input, _key) => {
    // Toggle between default and custom address
    if (input === 'c' && useDefault) {
      setUseDefault(false);
      setAddress('');
    } else if (input === 'd' && !useDefault) {
      setUseDefault(true);
      setAddress(defaultAddress);
    }
  });

  const handleSubmit = (value: string) => {
    const trimmed = value.trim();

    if (trimmed === '') {
      setError('Address is required');
      return;
    }

    const validation = validateDustAddress(trimmed, networkId);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    onSubmit(trimmed);
  };

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text dimColor>Enter dust receiver address:</Text>
      </Box>

      {useDefault ? (
        <Box flexDirection="column">
          <Box>
            <Text dimColor>Using your dust address: </Text>
          </Box>
          <Box marginTop={1}>
            <Text color="green">{defaultAddress}</Text>
          </Box>
          <Box marginTop={1}>
            <Text dimColor>
              Press{' '}
              <Text bold color="cyan">
                c
              </Text>{' '}
              to enter a custom address, or{' '}
              <Text bold color="cyan">
                Enter
              </Text>{' '}
              to continue
            </Text>
          </Box>
          <TextInput value={defaultAddress} onChange={() => {}} onSubmit={() => onSubmit(defaultAddress)} />
        </Box>
      ) : (
        <Box flexDirection="column">
          <Box>
            <Text dimColor>Custom address: </Text>
            <TextInput value={address} onChange={setAddress} onSubmit={handleSubmit} placeholder="mn_dust..." />
          </Box>
          {error && (
            <Box marginTop={1}>
              <Text color="red">{error}</Text>
            </Box>
          )}
          <Box marginTop={1}>
            <Text dimColor>
              Press{' '}
              <Text bold color="cyan">
                d
              </Text>{' '}
              to use your default dust address
            </Text>
          </Box>
        </Box>
      )}
    </Box>
  );
};
