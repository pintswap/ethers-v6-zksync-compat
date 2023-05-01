"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZkSyncProvider = exports.formatTransactionReceipt = exports.formatReceiptLog = exports.formatUint256 = exports.formatHash = exports.formatData = exports.formatBoolean = exports.object = exports.arrayOf = exports.allowNull = void 0;
require("ethers");
const ethers_1 = require("ethers");
function allowNull(format, nullValue) {
    return function (value) {
        if (value == null) {
            return nullValue;
        }
        return format(value);
    };
}
exports.allowNull = allowNull;
function arrayOf(format) {
    return (array) => {
        if (!Array.isArray(array)) {
            throw new Error("not an array");
        }
        return array.map((i) => format(i));
    };
}
exports.arrayOf = arrayOf;
// Requires an object which matches a fleet of other formatters
// Any FormatFunc may return `undefined` to have the value omitted
// from the result object. Calls preserve `this`.
function object(format, altNames) {
    return (value) => {
        const result = {};
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
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "not-an-error";
                (0, ethers_1.assert)(false, `invalid value for value.${key} (${message})`, "BAD_DATA", { value });
            }
        }
        return result;
    };
}
exports.object = object;
function formatBoolean(value) {
    switch (value) {
        case true:
        case "true":
            return true;
        case false:
        case "false":
            return false;
    }
    (0, ethers_1.assertArgument)(false, `invalid boolean; ${JSON.stringify(value)}`, "value", value);
}
exports.formatBoolean = formatBoolean;
function formatData(value) {
    (0, ethers_1.assertArgument)((0, ethers_1.isHexString)(value, true), "invalid data", "value", value);
    return value;
}
exports.formatData = formatData;
function formatHash(value) {
    (0, ethers_1.assertArgument)((0, ethers_1.isHexString)(value, 32), "invalid hash", "value", value);
    return value;
}
exports.formatHash = formatHash;
function formatUint256(value) {
    if (!(0, ethers_1.isHexString)(value)) {
        throw new Error("invalid uint256");
    }
    return (0, ethers_1.zeroPadValue)(value, 32);
}
exports.formatUint256 = formatUint256;
exports.formatReceiptLog = object({
    transactionIndex: ethers_1.getNumber,
    blockNumber: ethers_1.getNumber,
    transactionHash: formatHash,
    address: ethers_1.getAddress,
    topics: arrayOf(formatHash),
    data: formatData,
    index: ethers_1.getNumber,
    blockHash: formatHash,
}, {
    index: ["logIndex"],
});
exports.formatTransactionReceipt = object({
    to: allowNull(ethers_1.getAddress, null),
    from: allowNull(ethers_1.getAddress, null),
    contractAddress: allowNull(ethers_1.getAddress, null),
    // should be allowNull(hash), but broken-EIP-658 support is handled in receipt
    index: ethers_1.getNumber,
    root: allowNull(ethers_1.hexlify),
    gasUsed: ethers_1.getBigInt,
    logsBloom: allowNull(formatData),
    blockHash: allowNull(formatHash),
    hash: allowNull(formatHash),
    logs: arrayOf(exports.formatReceiptLog),
    blockNumber: allowNull(ethers_1.getNumber),
    cumulativeGasUsed: ethers_1.getBigInt,
    effectiveGasPrice: allowNull(ethers_1.getBigInt),
    status: allowNull(ethers_1.getNumber),
    type: allowNull(ethers_1.getNumber, 0),
}, {
    effectiveGasPrice: ["gasPrice"],
    hash: ["transactionHash"],
    index: ["transactionIndex"],
});
class ZkSyncProvider extends ethers_1.JsonRpcProvider {
    constructor() {
        super("https://mainnet.era.zksync.io");
    }
    _wrapTransactionReceipt(value, network) {
        return new ethers_1.TransactionReceipt((0, exports.formatTransactionReceipt)(value), this);
    }
}
exports.ZkSyncProvider = ZkSyncProvider;
//# sourceMappingURL=provider.js.map