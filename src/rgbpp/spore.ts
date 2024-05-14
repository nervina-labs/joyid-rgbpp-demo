import { addressToScript, getTransactionSize } from '@nervosnetwork/ckb-sdk-utils';
import {
  MAX_FEE,
  NoLiveCellError,
  SECP256K1_WITNESS_LOCK_SIZE,
  append0x,
  buildRgbppLockArgs,
  calculateRgbppClusterCellCapacity,
  calculateTransactionFee,
  genRgbppLockScript,
  getSecp256k1CellDep,
} from 'rgbpp/ckb';
import { collector } from './utils';

export const prepareClusterCell = async ({
  ckbAddress,
  outIndex,
  btcTxId,
}: {
  ckbAddress: string;
  outIndex: number;
  btcTxId: string;
}) => {
  const isMainnet = false;
  const masterLock = addressToScript(ckbAddress);

  // The capacity required to launch cells is determined by the token info cell capacity, and transaction fee.
  const clusterCellCapacity = calculateRgbppClusterCellCapacity({
    name: 'Test Cluster',
    description: 'CKB Test Cluster',
  });

  let emptyCells = await collector.getCells({
    lock: masterLock,
  });
  if (!emptyCells || emptyCells.length === 0) {
    throw new NoLiveCellError('The address has no empty cells');
  }
  emptyCells = emptyCells.filter((cell) => !cell.output.type);

  const txFee = MAX_FEE;
  const { inputs, sumInputsCapacity } = collector.collectInputs(emptyCells, clusterCellCapacity, txFee);

  const outputs: CKBComponents.CellOutput[] = [
    {
      lock: genRgbppLockScript(buildRgbppLockArgs(outIndex, btcTxId), isMainnet),
      capacity: append0x(clusterCellCapacity.toString(16)),
    },
  ];
  let changeCapacity = sumInputsCapacity - clusterCellCapacity;
  outputs.push({
    lock: masterLock,
    capacity: append0x(changeCapacity.toString(16)),
  });
  const outputsData = ['0x', '0x'];

  const emptyWitness = { lock: '', inputType: '', outputType: '' };
  const witnesses = inputs.map((_, index) => (index === 0 ? emptyWitness : '0x'));

  const cellDeps = [getSecp256k1CellDep(isMainnet)];

  const unsignedTx = {
    version: '0x0',
    cellDeps,
    headerDeps: [],
    inputs,
    outputs,
    outputsData,
    witnesses,
  };

  const txSize = getTransactionSize(unsignedTx) + SECP256K1_WITNESS_LOCK_SIZE;
  const estimatedTxFee = calculateTransactionFee(txSize);
  changeCapacity -= estimatedTxFee;
  unsignedTx.outputs[unsignedTx.outputs.length - 1].capacity = append0x(changeCapacity.toString(16));

  return unsignedTx;
};
