import React from 'react';
import { Box, Text } from 'ink';

export const BackHint: React.FC = () => {
  return (
    <Box marginTop={1}>
      <Text dimColor>Press Esc to go back</Text>
    </Box>
  );
};
