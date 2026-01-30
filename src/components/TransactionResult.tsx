import React from 'react';
import { Box, Text } from 'ink';
import { Loader } from './Loader.js';

interface ProcessingProps {
  action: string;
  stage: string;
}

export const TransactionProcessing: React.FC<ProcessingProps> = ({ action, stage }) => {
  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold>Processing {action}</Text>
      </Box>
      <Loader text={stage} />
    </Box>
  );
};

interface SuccessProps {
  action: string;
  txId: string;
}

export const TransactionSuccess: React.FC<SuccessProps> = ({ action, txId }) => {
  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold color="green">
          {action} Submitted
        </Text>
      </Box>
      <Box marginLeft={2}>
        <Text dimColor>TX: </Text>
        <Text>{txId}</Text>
      </Box>
      <Box marginTop={1}>
        <Text dimColor>Press any key to return to dashboard</Text>
      </Box>
    </Box>
  );
};

interface ErrorProps {
  action: string;
  error: string;
}

export const TransactionError: React.FC<ErrorProps> = ({ action, error }) => {
  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold color="red">
          {action} Failed
        </Text>
      </Box>
      <Box marginLeft={2}>
        <Text color="red">{error}</Text>
      </Box>
      <Box marginTop={1}>
        <Text dimColor>Press any key to return</Text>
      </Box>
    </Box>
  );
};
