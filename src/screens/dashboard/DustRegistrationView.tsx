import React, { useState, useCallback, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';
import type { FacadeState, WalletFacade, UtxoWithMeta } from '@midnight-ntwrk/wallet-sdk-facade';
import type { NetworkId } from '@midnight-ntwrk/wallet-sdk-abstractions';
import type { UnshieldedKeystore } from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';
import { executeDustRegistration } from '../../lib/dustRegistration.js';
import { BackHint } from '../../components/BackHint.js';
import { UtxoSelect } from '../../components/UtxoSelect.js';
import { TransactionProcessing, TransactionSuccess, TransactionError } from '../../components/TransactionResult.js';
import { DustAddressInput, RegistrationConfirm } from './dustRegistration/index.js';
import type { TransactionResult } from '../../types.js';

type DustRegistrationStep = 'selectUtxos' | 'enterAddress' | 'confirm' | 'processing' | 'result';

interface DustRegistrationData {
  selectedUtxos: UtxoWithMeta[];
  dustReceiverAddress: string;
  estimatedFee: bigint | null;
}

interface Props {
  state: FacadeState;
  networkId: NetworkId.NetworkId;
  facade: WalletFacade;
  unshieldedKeystore: UnshieldedKeystore;
  onBack: () => void;
}

export const DustRegistrationView: React.FC<Props> = ({ state, networkId, facade, unshieldedKeystore, onBack }) => {
  const [step, setStep] = useState<DustRegistrationStep>('selectUtxos');
  const [data, setData] = useState<DustRegistrationData>({
    selectedUtxos: [],
    dustReceiverAddress: state.dust.dustAddress,
    estimatedFee: null,
  });
  const [processingStage, setProcessingStage] = useState('');
  const [result, setResult] = useState<TransactionResult>(null);

  // Get available NIGHT UTXOs that are not already registered
  const availableUtxos = useMemo(() => {
    return state.unshielded.availableCoins.filter((utxo) => utxo.meta.registeredForDustGeneration === false);
  }, [state.unshielded.availableCoins]);

  // Handle Escape key for back navigation
  useInput((input, key) => {
    if (key.escape) {
      switch (step) {
        case 'selectUtxos':
          onBack();
          break;
        case 'enterAddress':
          setStep('selectUtxos');
          setData((d) => ({ ...d, selectedUtxos: [] }));
          break;
        case 'confirm':
          setStep('enterAddress');
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
      void handleExecuteRegistration();
    }
  });

  const handleSelectUtxos = useCallback((selectedUtxos: UtxoWithMeta[]) => {
    setData((d) => ({ ...d, selectedUtxos }));
    setStep('enterAddress');
  }, []);

  const handleAddressSubmit = useCallback(
    async (address: string) => {
      setData((d) => ({ ...d, dustReceiverAddress: address }));

      // Estimate fee
      try {
        const { fee } = await facade.estimateRegistration(data.selectedUtxos);
        setData((d) => ({ ...d, estimatedFee: fee }));
      } catch {
        // Fee estimation failed, continue without it
        setData((d) => ({ ...d, estimatedFee: null }));
      }

      setStep('confirm');
    },
    [facade, data.selectedUtxos],
  );

  const handleExecuteRegistration = useCallback(async () => {
    if (data.selectedUtxos.length === 0) {
      return;
    }

    setStep('processing');
    setProcessingStage('Building registration transaction...');

    const registrationResult = await executeDustRegistration(
      facade,
      {
        nightUtxos: data.selectedUtxos,
        dustReceiverAddress: data.dustReceiverAddress !== state.dust.dustAddress ? data.dustReceiverAddress : undefined, // Use undefined to let facade use default
      },
      unshieldedKeystore,
    );

    setResult(registrationResult);
    setStep('result');
  }, [data, facade, unshieldedKeystore, state.dust.dustAddress]);

  const renderStep = () => {
    switch (step) {
      case 'selectUtxos':
        return (
          <UtxoSelect
            utxos={availableUtxos}
            instruction="Select NIGHT UTXOs to register for dust generation:"
            emptyState={{
              title: 'No unregistered NIGHT UTXOs available.',
              description: 'All your NIGHT UTXOs are already registered for dust generation.',
            }}
            onSubmit={handleSelectUtxos}
          />
        );

      case 'enterAddress':
        return (
          <DustAddressInput
            defaultAddress={state.dust.dustAddress}
            networkId={networkId}
            onSubmit={(addr) => void handleAddressSubmit(addr)}
          />
        );

      case 'confirm':
        return (
          <RegistrationConfirm
            selectedUtxos={data.selectedUtxos}
            dustReceiverAddress={data.dustReceiverAddress}
            estimatedFee={data.estimatedFee}
          />
        );

      case 'processing':
        return <TransactionProcessing action="Dust Registration" stage={processingStage} />;

      case 'result':
        if (result?.success) {
          return <TransactionSuccess action="Dust Registration" txId={result.txId} />;
        }
        return <TransactionError action="Dust Registration" error={result?.error || 'Unknown error'} />;
    }
  };

  return (
    <Box flexDirection="column">
      <Box borderStyle="round" borderColor="gray" paddingX={1} marginBottom={1}>
        <Text bold>Dust Registration</Text>
      </Box>

      {renderStep()}

      {step !== 'processing' && step !== 'result' && <BackHint />}
    </Box>
  );
};
