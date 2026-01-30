import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import type { UtxoWithMeta } from '@midnight-ntwrk/wallet-sdk-facade';
import { formatBalance } from '../utils/balance.js';

interface EmptyStateMessages {
  title: string;
  description: string;
}

interface Props {
  utxos: UtxoWithMeta[];
  instruction: string;
  emptyState: EmptyStateMessages;
  onSubmit: (selectedUtxos: UtxoWithMeta[]) => void;
}

export const UtxoSelect: React.FC<Props> = ({ utxos, instruction, emptyState, onSubmit }) => {
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [cursorIndex, setCursorIndex] = useState(0);

  const hasSelectAll = utxos.length > 1;
  const totalItems = hasSelectAll ? utxos.length + 1 : utxos.length;

  useInput((input, key) => {
    if (key.upArrow) {
      setCursorIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
    } else if (key.downArrow) {
      setCursorIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
    } else if (input === ' ') {
      // Toggle selection
      if (hasSelectAll && cursorIndex === 0) {
        // Toggle select all
        if (selectedIndices.size === utxos.length) {
          setSelectedIndices(new Set());
        } else {
          setSelectedIndices(new Set(utxos.map((_, i) => i)));
        }
      } else {
        const utxoIndex = hasSelectAll ? cursorIndex - 1 : cursorIndex;
        setSelectedIndices((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(utxoIndex)) {
            newSet.delete(utxoIndex);
          } else {
            newSet.add(utxoIndex);
          }
          return newSet;
        });
      }
    } else if (key.return) {
      if (selectedIndices.size > 0) {
        const selected = utxos.filter((_, i) => selectedIndices.has(i));
        onSubmit(selected);
      }
    }
  });

  if (utxos.length === 0) {
    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text color="yellow">{emptyState.title}</Text>
        </Box>
        <Text dimColor>{emptyState.description}</Text>
      </Box>
    );
  }

  const allSelected = selectedIndices.size === utxos.length;
  const totalValue = Array.from(selectedIndices).reduce((sum, i) => sum + utxos[i].utxo.value, 0n);

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text dimColor>{instruction}</Text>
      </Box>

      {/* Select All option */}
      {hasSelectAll && (
        <Box>
          {cursorIndex === 0 ? <Text color="cyan">{'> '}</Text> : <Text>{'  '}</Text>}
          <Text>{allSelected ? '[x]' : '[ ]'} </Text>
          <Text bold>Select All</Text>
          <Text dimColor> ({utxos.length} UTXOs)</Text>
        </Box>
      )}

      {/* Individual UTXOs */}
      {utxos.map((utxo, index) => {
        const itemIndex = hasSelectAll ? index + 1 : index;
        const isSelected = selectedIndices.has(index);
        const isCursor = cursorIndex === itemIndex;

        return (
          <Box key={index}>
            {isCursor ? <Text color="cyan">{'> '}</Text> : <Text>{'  '}</Text>}
            <Text>{isSelected ? '[x]' : '[ ]'} </Text>
            <Text>UTXO {index + 1}: </Text>
            <Text bold>{formatBalance(utxo.utxo.value)}</Text>
            <Text dimColor> NIGHT</Text>
          </Box>
        );
      })}

      {/* Selection summary */}
      <Box marginTop={1} flexDirection="column">
        <Box>
          <Text dimColor>Selected: </Text>
          {selectedIndices.size > 0 ? (
            <Text bold color="green">
              {selectedIndices.size}
            </Text>
          ) : (
            <Text bold>{selectedIndices.size}</Text>
          )}
          <Text dimColor> UTXO{selectedIndices.size !== 1 ? 's' : ''}</Text>
          {selectedIndices.size > 0 && (
            <>
              <Text dimColor> (</Text>
              <Text bold>{formatBalance(totalValue)}</Text>
              <Text dimColor> NIGHT)</Text>
            </>
          )}
        </Box>

        <Box marginTop={1}>
          <Text dimColor>
            <Text bold color="cyan">
              Space
            </Text>{' '}
            toggle ·{' '}
            <Text bold color="cyan">
              Enter
            </Text>{' '}
            continue
          </Text>
        </Box>
      </Box>
    </Box>
  );
};
