export function formatBalance(balance: bigint): string {
  const denomination = BigInt(10 ** 6);
  const value = balance / denomination;
  const fractionalPart = balance % denomination;

  // Use BigInt for thresholds to avoid precision loss
  const trillion = BigInt(1_000_000_000_000);
  const billion = BigInt(1_000_000_000);
  const million = BigInt(1_000_000);

  let result: string;

  if (value >= trillion) {
    // For trillions, divide and format
    const wholeTrillions = value / trillion;
    const remainderAfterTrillions = value % trillion;
    // Calculate decimal part (2 decimal places)
    const decimalPart = Number((remainderAfterTrillions * 100n) / trillion);

    if (decimalPart === 0 && fractionalPart === 0n) {
      result = `${wholeTrillions.toLocaleString('en-US')}T`;
    } else {
      const decimalStr = (decimalPart / 100).toFixed(2).substring(1); // Get ".XX" part
      result = `${wholeTrillions.toLocaleString('en-US')}${decimalStr.replace(/\.?0+$/, '')}T`;
    }
  } else if (value >= billion) {
    const wholeBillions = value / billion;
    const remainderAfterBillions = value % billion;
    const decimalPart = Number((remainderAfterBillions * 100n) / billion);

    if (decimalPart === 0 && fractionalPart === 0n) {
      result = `${wholeBillions.toLocaleString('en-US')}B`;
    } else {
      const decimalStr = (decimalPart / 100).toFixed(2).substring(1);
      result = `${wholeBillions.toLocaleString('en-US')}${decimalStr.replace(/\.?0+$/, '')}B`;
    }
  } else if (value >= million) {
    const wholeMillions = value / million;
    const remainderAfterMillions = value % million;
    const decimalPart = Number((remainderAfterMillions * 100n) / million);

    if (decimalPart === 0 && fractionalPart === 0n) {
      result = `${wholeMillions.toLocaleString('en-US')}M`;
    } else {
      const decimalStr = (decimalPart / 100).toFixed(2).substring(1);
      result = `${wholeMillions.toLocaleString('en-US')}${decimalStr.replace(/\.?0+$/, '')}M`;
    }
  } else {
    // For values less than 1 million, show with thousands separators and decimals
    const wholeStr = value.toLocaleString('en-US');
    if (fractionalPart > 0n) {
      const fractionalStr = fractionalPart.toString().padStart(6, '0').replace(/0+$/, '');
      result = `${wholeStr}.${fractionalStr}`;
    } else {
      result = wholeStr;
    }
  }

  return result;
}
