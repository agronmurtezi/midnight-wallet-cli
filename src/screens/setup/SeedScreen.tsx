import React, { useState } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import * as bip39 from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english.js';
import { BackHint } from '../../components/BackHint.js';
import type { Route, Navigator } from '../../navigation/index.js';

interface Props {
  route: Route<'seed'>;
  nav: Navigator;
  onSeedSubmit: (seed: Uint8Array) => Promise<void>;
}

function isValidHexSeed(seed: string): boolean {
  return /^[0-9a-fA-F]{64}$/.test(seed);
}

function isValidMnemonic(mnemonic: string): boolean {
  return bip39.validateMnemonic(mnemonic, wordlist);
}

async function mnemonicToSeed(mnemonic: string): Promise<Uint8Array> {
  return bip39.mnemonicToSeed(mnemonic);
}

export const SeedScreen: React.FC<Props> = ({ route, onSeedSubmit }) => {
  const { seedType } = route.params;
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (input: string): Promise<void> => {
    if (seedType === 'mnemonic') {
      // Handle mnemonic input (comma-separated or space-separated)
      const normalized = input.replace(/,/g, ' ').replace(/\s+/g, ' ').trim();

      if (!isValidMnemonic(normalized)) {
        setError('Invalid mnemonic. Must be 24 valid BIP39 words (comma or space separated).');
        setValue('');
        return;
      }

      try {
        const seed = await mnemonicToSeed(normalized);
        await onSeedSubmit(seed);
      } catch {
        setError('Failed to convert mnemonic to seed. Please check your words.');
        setValue('');
      }
    } else {
      // Handle hex seed input
      if (!isValidHexSeed(input)) {
        setError('Invalid seed format. Must be exactly 64 hexadecimal characters (0-9, a-f).');
        setValue('');
        return;
      }

      try {
        await onSeedSubmit(Buffer.from(input, 'hex'));
      } catch {
        setError('Failed to initialize wallet. Please try again.');
        setValue('');
      }
    }
  };

  const promptText =
    seedType === 'mnemonic'
      ? 'Enter 24-word mnemonic (comma or space separated):'
      : 'Enter wallet seed (64 hex characters):';

  const placeholder = seedType === 'mnemonic' ? 'word1, word2, word3...' : 'Enter seed...';

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text dimColor>{promptText}</Text>
      </Box>
      <Box>
        <Text dimColor>› </Text>
        <TextInput
          value={value}
          onChange={setValue}
          onSubmit={() => void handleSubmit(value)}
          placeholder={placeholder}
          {...(seedType === 'hex' && { mask: '*' })}
        />
      </Box>
      {error && (
        <Box marginTop={1} paddingLeft={2}>
          <Text color="red">✗ {error}</Text>
        </Box>
      )}
      <BackHint />
    </Box>
  );
};
