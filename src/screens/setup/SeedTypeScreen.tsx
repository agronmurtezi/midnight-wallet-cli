import React from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import { BackHint } from '../../components/BackHint.js';
import type { Route, Navigator } from '../../navigation/index.js';
import type { SeedType } from '../../types.js';
import { randomBytes } from 'node:crypto';

interface Props {
  route: Route<'seedType'>;
  nav: Navigator;
  onSeedSubmit: (seed: Uint8Array) => Promise<void>;
}

interface Item {
  label: string;
  value: SeedType;
}

const seedTypes: Item[] = [
  { label: 'Mnemonic (24 words)', value: 'mnemonic' as SeedType },
  { label: 'Hex Seed (64 characters)', value: 'hex' as SeedType },
  { label: 'Random Seed', value: 'randomHex' as SeedType },
];

export const SeedTypeScreen: React.FC<Props> = ({ route, nav, onSeedSubmit }) => {
  const handleSelectSeedType = (seedType: SeedType) => {
    if (seedType === 'randomHex') {
      void onSeedSubmit(randomBytes(32));
    } else {
      nav.push('seed', {
        environment: route.params.environment,
        seedType,
      });
    }
  };

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text dimColor>Select seed input method:</Text>
      </Box>
      <SelectInput items={seedTypes} onSelect={(item) => handleSelectSeedType(item.value)} />
      <BackHint />
    </Box>
  );
};
