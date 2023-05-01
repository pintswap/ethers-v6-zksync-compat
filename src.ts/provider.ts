import "ethers";
import path from "path";
import {
  getAddress,
  getNumber,
  getBigInt,
  isHexString,
  zeroPadValue,
  hexlify,
  assertArgument,
  assert,
  JsonRpcProvider,
  TransactionReceipt
} from "ethers";

export type FormatFunc = (value: any) => any;

export function allowNull(format: FormatFunc, nullValue?: any): FormatFunc {
  return function (value: any) {
    if (value == null) {
      return nullValue;
    }
    return format(value);
  };
}

export function arrayOf(format: FormatFunc): FormatFunc {
  return (array: any) => {
    if (!Array.isArray(array)) {
      throw new Error("not an array");
    }
    return array.map((i) => format(i));
  };
}

// Requires an object which matches a fleet of other formatters
// Any FormatFunc may return `undefined` to have the value omitted
// from the result object. Calls preserve `this`.
export function object(
  format: Record<string, FormatFunc>,
  altNames?: Record<string, Array<string>>
): FormatFunc {
  return (value: any) => {
    const result: any = {};
    for (const key in format) {
      let srcKey = key;
      if (altNames && key in altNames && !(srcKey in value)) {
        for (const altKey of altNames[key]) {
          if (altKey in value) {
            srcKey = altKey;
            break;
          }
        }
      }

      try {
        const nv = format[key](value[srcKey]);
        if (nv !== undefined) {
          result[key] = nv;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "not-an-error";
        assert(
          false,
          `invalid value for value.${key} (${message})`,
          "BAD_DATA",
          { value }
        );
      }
    }
    return result;
  };
}

export function formatBoolean(value: any): boolean {
  switch (value) {
    case true:
    case "true":
      return true;
    case false:
    case "false":
      return false;
  }
  assertArgument(
    false,
    `invalid boolean; ${JSON.stringify(value)}`,
    "value",
    value
  );
}
export function formatData(value: string): string {
  assertArgument(isHexString(value, true), "invalid data", "value", value);
  return value;
}

export function formatHash(value: any): string {
  assertArgument(isHexString(value, 32), "invalid hash", "value", value);
  return value;
}

export function formatUint256(value: any): string {
  if (!isHexString(value)) {
    throw new Error("invalid uint256");
  }
  return zeroPadValue(value, 32);
}

export const formatReceiptLog = object(
  {
    transactionIndex: getNumber,
    blockNumber: getNumber,
    transactionHash: formatHash,
    address: getAddress,
    topics: arrayOf(formatHash),
    data: formatData,
    index: getNumber,
    blockHash: formatHash,
  },
  {
    index: ["logIndex"],
  }
);

export const formatTransactionReceipt = object(
  {
    to: allowNull(getAddress, null),
    from: allowNull(getAddress, null),
    contractAddress: allowNull(getAddress, null),
    // should be allowNull(hash), but broken-EIP-658 support is handled in receipt
    index: getNumber,
    root: allowNull(hexlify),
    gasUsed: getBigInt,
    logsBloom: allowNull(formatData),
    blockHash: allowNull(formatHash),
    hash: allowNull(formatHash),
    logs: arrayOf(formatReceiptLog),
    blockNumber: allowNull(getNumber),
    cumulativeGasUsed: getBigInt,
    effectiveGasPrice: allowNull(getBigInt),
    status: allowNull(getNumber),
    type: allowNull(getNumber, 0),
  },
  {
    effectiveGasPrice: ["gasPrice"],
    hash: ["transactionHash"],
    index: ["transactionIndex"],
  }
);

export class ZkSyncProvider extends JsonRpcProvider {
  constructor() {
    super("https://mainnet.era.zksync.io");
  }
  _wrapTransactionReceipt(value, network) {
    return new TransactionReceipt(formatTransactionReceipt(value), this as any);
  }
}
