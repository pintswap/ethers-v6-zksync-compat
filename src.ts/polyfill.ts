import "ethers";
import path from "path";
const format = require.cache[path.join(require.resolve('ethers'), '..', 'providers', 'format.js')].exports;
const address = require.cache[path.join(require.resolve('ethers'), '..', 'address', 'index.js')].exports;
const utils = require.cache[path.join(require.resolve('ethers'), '..', 'utils', 'index.js')].exports;

const { formatTransactionReceipt } = format;
export { formatTransactionReceipt }
export const formatTransactionReceiptShim = format.object({
    to: format.allowNull(address.getAddress, null),
    from: format.allowNull(address.getAddress, null),
    contractAddress: format.allowNull(address.getAddress, null),
    // should be allowNull(hash), but broken-EIP-658 support is handled in receipt
    index: utils.getNumber,
    root: format.allowNull(utils.hexlify),
    gasUsed: utils.getBigInt,
    logsBloom: format.allowNull(format.formatData),
    blockHash: format.allowNull(format.formatHash),
    hash: format.allowNull(format.formatHash),
    logs: format.arrayOf(format.formatReceiptLog),
    blockNumber: format.allowNull(utils.getNumber),
    cumulativeGasUsed: utils.getBigInt,
    effectiveGasPrice: format.allowNull(utils.getBigInt),
    status: format.allowNull(utils.getNumber),
    type: format.allowNull(utils.getNumber, 0)
}, {
    effectiveGasPrice: ["gasPrice"],
    hash: ["transactionHash"],
    index: ["transactionIndex"],
});

format.formatTransactionReceipt = formatTransactionReceiptShim;