import React, { useState, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';
import type { FacadeState, WalletFacade } from '@midnight-ntwrk/wallet-sdk-facade';
import type { NetworkId } from '@midnight-ntwrk/wallet-sdk-abstractions';
import type { WalletSecretKeys } from '../../lib/wallet.js';
import type { UnshieldedKeystore } from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';
import { executeTransfer } from '../../lib/transfer.js';
import { BackHint } from '../../components/BackHint.js';
import { TransactionProcessing, TransactionSuccess, TransactionError } from '../../components/TransactionResult.js';
import {
  TokenTypeSelect,
  TokenSelect,
  AmountInput,
  AddressInput,
  TransferConfirm,
  type TokenType,
} from './transfer/index.js';
import type { TransactionResult } from '../../types.js';

type TransferStep = 'selectType' | 'selectToken' | 'enterAmount' | 'enterAddress' | 'confirm' | 'processing' | 'result';

interface TransferData {
  tokenType: TokenType | null;
  tokenId: string | null;
  amount: bigint | null;
  receiverAddress: string | null;
}

interface Props {
  state: FacadeState;
  networkId: NetworkId.NetworkId;
  facade: WalletFacade;
  secretKeys: WalletSecretKeys;
  unshieldedKeystore: UnshieldedKeystore;
  onBack: () => void;
}

export const TransferView: React.FC<Props> = ({ state, networkId, facade, secretKeys, unshieldedKeystore, onBack }) => {
  const [step, setStep] = useState<TransferStep>('selectType');
  const [data, setData] = useState<TransferData>({
    tokenType: null,
    tokenId: null,
    amount: null,
    receiverAddress: null,
  });
  const [processingStage, setProcessingStage] = useState('');
  const [result, setResult] = useState<TransactionResult>(null);

  // Handle Escape key for back navigation
  useInput((input, key) => {
    if (key.escape) {
      switch (step) {
        case 'selectType':
          onBack();
          break;
        case 'selectToken':
          setStep('selectType');
          setData((d) => ({ ...d, tokenType: null }));
          break;
        case 'enterAmount':
          setStep('selectToken');
          setData((d) => ({ ...d, tokenId: null }));
          break;
        case 'enterAddress':
          setStep('enterAmount');
          setData((d) => ({ ...d, amount: null }));
          break;
        case 'confirm':
          setStep('enterAddress');
          setData((d) => ({ ...d, receiverAddress: null }));
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
      void handleExecuteTransfer();
    }
  });

  const handleSelectType = useCallback((type: TokenType) => {
    setData((d) => ({ ...d, tokenType: type }));
    setStep('selectToken');
  }, []);

  const handleSelectToken = useCallback((tokenId: string) => {
    setData((d) => ({ ...d, tokenId }));
    setStep('enterAmount');
  }, []);

  const handleAmountSubmit = useCallback((amount: bigint) => {
    setData((d) => ({ ...d, amount }));
    setStep('enterAddress');
  }, []);

  const handleAddressSubmit = useCallback((address: string) => {
    setData((d) => ({ ...d, receiverAddress: address }));
    setStep('confirm');
  }, []);

  const handleExecuteTransfer = useCallback(async () => {
    if (!data.tokenType || !data.tokenId || !data.amount || !data.receiverAddress) {
      return;
    }

    setStep('processing');
    setProcessingStage('Building transaction...');

    const transferResult = await executeTransfer(
      facade,
      {
        tokenType: data.tokenType,
        tokenId: data.tokenId,
        amount: data.amount,
        receiverAddress: data.receiverAddress,
      },
      secretKeys,
      unshieldedKeystore,
    );

    setResult(transferResult);
    setStep('result');
  }, [data, facade, secretKeys, unshieldedKeystore]);

  const getBalances = (): Record<string, bigint> => {
    if (data.tokenType === 'shielded') {
      return state.shielded.balances;
    }
    if (data.tokenType === 'unshielded') {
      return state.unshielded.balances;
    }
    return {};
  };

  const getAvailableBalance = (): bigint => {
    if (!data.tokenId || !data.tokenType) return 0n;
    const balances = getBalances();
    return balances[data.tokenId] ?? 0n;
  };

  const renderStep = () => {
    switch (step) {
      case 'selectType':
        return <TokenTypeSelect onSelect={handleSelectType} />;

      case 'selectToken':
        return <TokenSelect tokenType={data.tokenType!} balances={getBalances()} onSelect={handleSelectToken} />;

      case 'enterAmount':
        return (
          <AmountInput tokenId={data.tokenId!} availableBalance={getAvailableBalance()} onSubmit={handleAmountSubmit} />
        );

      case 'enterAddress':
        return (
          <AddressInput
            tokenType={data.tokenType!}
            tokenId={data.tokenId!}
            amount={data.amount!}
            networkId={networkId}
            onSubmit={handleAddressSubmit}
          />
        );

      case 'confirm':
        return (
          <TransferConfirm
            tokenType={data.tokenType!}
            tokenId={data.tokenId!}
            amount={data.amount!}
            receiverAddress={data.receiverAddress!}
          />
        );

      case 'processing':
        return <TransactionProcessing action="Transfer" stage={processingStage} />;

      case 'result':
        if (result?.success) {
          return <TransactionSuccess action="Transfer" txId={result.txId} />;
        }
        return <TransactionError action="Transfer" error={result?.error || 'Unknown error'} />;
    }
  };

  const getBreadcrumb = (): string => {
    const parts = ['Transfer'];
    if (data.tokenType) {
      parts.push(data.tokenType === 'shielded' ? 'Shielded' : 'Unshielded');
    }
    return parts.join(' > ');
  };

  return (
    <Box flexDirection="column">
      <Box borderStyle="round" borderColor="gray" paddingX={1} marginBottom={1}>
        <Text bold>{getBreadcrumb()}</Text>
      </Box>

      {renderStep()}

      {step !== 'processing' && step !== 'result' && <BackHint />}
    </Box>
  );
};
