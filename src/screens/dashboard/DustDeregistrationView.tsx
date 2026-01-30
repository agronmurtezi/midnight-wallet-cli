import React, { useState, useCallback, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';
import type { FacadeState, WalletFacade, UtxoWithMeta } from '@midnight-ntwrk/wallet-sdk-facade';
import type { UnshieldedKeystore } from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';
import { executeDustDeregistration } from '../../lib/dustDeregistration.js';
import { BackHint } from '../../components/BackHint.js';
import { UtxoSelect } from '../../components/UtxoSelect.js';
import { TransactionProcessing, TransactionSuccess, TransactionError } from '../../components/TransactionResult.js';
import { DeregistrationConfirm } from './dustDeregistration/index.js';
import type { TransactionResult } from '../../types.js';

type DustDeregistrationStep = 'selectUtxos' | 'confirm' | 'processing' | 'result';

interface DustDeregistrationData {
  selectedUtxos: UtxoWithMeta[];
}

interface Props {
  state: FacadeState;
  facade: WalletFacade;
  unshieldedKeystore: UnshieldedKeystore;
  onBack: () => void;
}

export const DustDeregistrationView: React.FC<Props> = ({ state, facade, unshieldedKeystore, onBack }) => {
  const [step, setStep] = useState<DustDeregistrationStep>('selectUtxos');
  const [data, setData] = useState<DustDeregistrationData>({
    selectedUtxos: [],
  });
  const [processingStage, setProcessingStage] = useState('');
  const [result, setResult] = useState<TransactionResult>(null);

  // Get registered NIGHT UTXOs (those that are registered for dust generation)
  const registeredUtxos = useMemo(() => {
    return state.unshielded.availableCoins.filter((utxo) => utxo.meta.registeredForDustGeneration === true);
  }, [state.unshielded.availableCoins]);

  const handleExecuteDeregistration = useCallback(async () => {
    if (data.selectedUtxos.length === 0) {
      return;
    }

    setStep('processing');
    setProcessingStage('Building deregistration transaction...');

    const deregistrationResult = await executeDustDeregistration(
      facade,
      {
        nightUtxos: data.selectedUtxos,
      },
      unshieldedKeystore,
    );

    setResult(deregistrationResult);
    setStep('result');
  }, [data, facade, unshieldedKeystore]);

  // Handle Escape key for back navigation
  useInput((input, key) => {
    if (key.escape) {
      switch (step) {
        case 'selectUtxos':
          onBack();
          break;
        case 'confirm':
          setStep('selectUtxos');
          setData((d) => ({ ...d, selectedUtxos: [] }));
          break;
        case 'result':
          onBack();
          break;
        // Don't handle escape during processing
      }
    }

    // Any key returns from result screen
    if (step === 'result' && !key.escape) {
      onBack();
    }

    // Enter to confirm on confirm screen
    if (step === 'confirm' && key.return) {
      void handleExecuteDeregistration();
    }
  });

  const handleSelectUtxos = useCallback((selectedUtxos: UtxoWithMeta[]) => {
    setData((d) => ({ ...d, selectedUtxos }));
    setStep('confirm');
  }, []);

  const renderStep = () => {
    switch (step) {
      case 'selectUtxos':
        return (
          <UtxoSelect
            utxos={registeredUtxos}
            instruction="Select NIGHT UTXOs to deregister from dust generation:"
            emptyState={{
              title: 'No registered NIGHT UTXOs available.',
              description: 'You have no NIGHT UTXOs registered for dust generation.',
            }}
            onSubmit={handleSelectUtxos}
          />
        );

      case 'confirm':
        return <DeregistrationConfirm selectedUtxos={data.selectedUtxos} />;

      case 'processing':
        return <TransactionProcessing action="Dust Deregistration" stage={processingStage} />;

      case 'result':
        if (result?.success) {
          return <TransactionSuccess action="Dust Deregistration" txId={result.txId} />;
        }
        return <TransactionError action="Dust Deregistration" error={result?.error || 'Unknown error'} />;
    }
  };

  return (
    <Box flexDirection="column">
      <Box borderStyle="round" borderColor="gray" paddingX={1} marginBottom={1}>
        <Text bold>Dust Deregistration</Text>
      </Box>

      {renderStep()}

      {step !== 'processing' && step !== 'result' && <BackHint />}
    </Box>
  );
};
