import React from 'react';
import { Box, Text } from 'ink';
import type { FacadeState } from '@midnight-ntwrk/wallet-sdk-facade';
import { ShieldedAddress, UnshieldedAddress } from '@midnight-ntwrk/wallet-sdk-address-format';
import { NetworkId } from '@midnight-ntwrk/wallet-sdk-abstractions';
import { formatBalance } from '../../utils/balance.js';
import { formatTimeRemaining } from '../../utils/display.js';

interface Props {
  state: FacadeState;
  networkId: NetworkId.NetworkId;
}

export const WalletStateView: React.FC<Props> = ({ state, networkId }) => {
  const shieldedAddressStr = ShieldedAddress.codec.encode(networkId, state.shielded.address).asString();
  const unshieldedAddressStr = UnshieldedAddress.codec.encode(networkId, state.unshielded.address).asString();

  const shieldedBalances = Object.entries(state.shielded.balances);
  const unshieldedBalances = Object.entries(state.unshielded.balances);

  return (
    <Box flexDirection="column">
      <Box borderStyle="round" borderColor="gray" paddingX={1} marginBottom={1}>
        <Text bold>Wallet State</Text>
      </Box>

      {/* Shielded Wallet */}
      <Box flexDirection="column" marginBottom={1}>
        <Box>
          <Text color="magenta">▸ </Text>
          <Text bold color="magenta">
            Shielded Wallet
          </Text>
        </Box>
        <Box marginLeft={2} flexDirection="column" marginTop={1}>
          <Box>
            <Text dimColor>Address </Text>
            <Text>{shieldedAddressStr}</Text>
          </Box>

          {shieldedBalances.length > 0 ? (
            <Box flexDirection="column" marginTop={1}>
              <Text dimColor>Balances</Text>
              {shieldedBalances.map(([token, balance]) => (
                <Box key={token} marginLeft={2}>
                  <Text>
                    <Text dimColor>· </Text>
                    <Text>{token}: </Text>
                    <Text bold>{formatBalance(balance)}</Text>
                  </Text>
                </Box>
              ))}
            </Box>
          ) : (
            <Box marginTop={1}>
              <Text>
                <Text dimColor>Balances </Text>
                <Text dimColor>0</Text>
              </Text>
            </Box>
          )}

          <Box marginTop={1}>
            <Text dimColor>Coins </Text>
            <Text>
              {state.shielded.availableCoins.length} available
              {state.shielded.pendingCoins.length > 0 && (
                <Text dimColor> · {state.shielded.pendingCoins.length} pending</Text>
              )}
            </Text>
          </Box>

          {state.shielded.availableCoins.length > 0 && (
            <Box flexDirection="column" marginTop={1}>
              <Text dimColor>Coin Details</Text>
              {state.shielded.availableCoins.map((coin, idx) => (
                <Box key={idx} marginLeft={2}>
                  <Text>
                    <Text dimColor>· Coin {idx + 1}: </Text>
                    <Text bold>{formatBalance(coin.coin.value)}</Text>
                    <Text dimColor> ({coin.coin.type})</Text>
                  </Text>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>

      {/* Unshielded Wallet */}
      <Box flexDirection="column" marginBottom={1}>
        <Box>
          <Text color="blue">▸ </Text>
          <Text bold color="blue">
            Unshielded Wallet
          </Text>
        </Box>
        <Box marginLeft={2} flexDirection="column" marginTop={1}>
          <Box>
            <Text dimColor>Address </Text>
            <Text>{unshieldedAddressStr}</Text>
          </Box>

          {unshieldedBalances.length > 0 ? (
            <Box flexDirection="column" marginTop={1}>
              <Text dimColor>Balances</Text>
              {unshieldedBalances.map(([token, balance]) => (
                <Box key={token} marginLeft={2}>
                  <Text>
                    <Text dimColor>· </Text>
                    <Text>
                      {token === '0000000000000000000000000000000000000000000000000000000000000000' ? 'NIGHT: ' : token}
                    </Text>
                    <Text bold>{formatBalance(balance)}</Text>
                  </Text>
                </Box>
              ))}
            </Box>
          ) : (
            <Box marginTop={1}>
              <Text>
                <Text dimColor>Balances </Text>
                <Text dimColor>0</Text>
              </Text>
            </Box>
          )}

          <Box marginTop={1}>
            <Text dimColor>Coins </Text>
            <Text>
              {state.unshielded.availableCoins.length} available
              {state.unshielded.pendingCoins.length > 0 && (
                <Text dimColor> · {state.unshielded.pendingCoins.length} pending</Text>
              )}
            </Text>
          </Box>

          {state.unshielded.availableCoins.length > 0 && (
            <Box flexDirection="column" marginTop={1}>
              <Text dimColor>Coin Details</Text>
              {state.unshielded.availableCoins.map((coin, idx) => (
                <Box key={idx} marginLeft={2} flexDirection="column">
                  <Text>
                    <Text dimColor>· Coin {idx + 1}: </Text>
                    <Text bold>{formatBalance(coin.utxo.value)}</Text>
                    <Text dimColor>
                      {' '}
                      (
                      {coin.utxo.type === '0000000000000000000000000000000000000000000000000000000000000000'
                        ? 'NIGHT'
                        : coin.utxo.type}
                      )
                    </Text>
                    {coin.meta.registeredForDustGeneration && <Text color="yellow"> [Registered for Dust]</Text>}
                  </Text>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>

      {/* Dust Wallet */}
      <Box flexDirection="column">
        <Box>
          <Text color="yellow">▸ </Text>
          <Text bold color="yellow">
            Dust Wallet
          </Text>
        </Box>
        <Box marginLeft={2} flexDirection="column" marginTop={1}>
          <Box>
            <Text dimColor>Address </Text>
            <Text>{state.dust.dustAddress}</Text>
          </Box>

          <Box marginTop={1}>
            <Text dimColor>Balance (DUST): </Text>
            <Text bold>{formatBalance(state.dust.walletBalance(new Date()))}</Text>
          </Box>

          <Box marginTop={1}>
            <Text dimColor>Coins </Text>
            <Text>
              {state.dust.availableCoins.length} available
              {state.dust.pendingCoins.length > 0 && <Text dimColor> · {state.dust.pendingCoins.length} pending</Text>}
            </Text>
          </Box>

          {state.dust.availableCoins.length > 0 && (
            <Box flexDirection="column" marginTop={1}>
              <Text dimColor>Coin Details</Text>
              {state.dust.availableCoinsWithFullInfo(new Date()).map((coinInfo, idx) => {
                const now = new Date();
                const timeRemaining = formatTimeRemaining(coinInfo.maxCapReachedAt, now);
                const isComplete = coinInfo.generatedNow >= coinInfo.maxCap;
                return (
                  <Box key={idx} marginLeft={2} flexDirection="column">
                    <Text>
                      <Text dimColor>· Coin {idx + 1}: </Text>
                      <Text bold>{formatBalance(coinInfo.generatedNow)}</Text>
                      <Text dimColor> / {formatBalance(coinInfo.maxCap)} max</Text>
                      {!coinInfo.dtime && <Text color={isComplete ? 'green' : 'cyan'}> ({timeRemaining})</Text>}
                    </Text>
                    {coinInfo.dtime && (
                      <Box marginLeft={2}>
                        <Text dimColor>Deregistered: {new Date(coinInfo.dtime).toLocaleString()}</Text>
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};
