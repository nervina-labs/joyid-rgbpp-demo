import {
  Collector,
  RGBPP_TX_WITNESS_MAX_SIZE,
  append0x,
  buildAppendingIssuerCellToSporesCreateTx,
} from '@rgbpp-sdk/ckb';
import { AGGREGATOR_URL, CKB_INDEXER_URL, CKB_RPC_URL } from '../env';
import { getJoyIDCellDep, ConnectResponseData, getCotaTypeScript, getSubkeyUnlock } from '@joyid/ckb';
import { addressToScript } from '@nervosnetwork/ckb-sdk-utils';

export const collector: Collector = new Collector({
  ckbIndexerUrl: CKB_INDEXER_URL,
  ckbNodeUrl: CKB_RPC_URL,
});

// The ckbRawTx is from the spore creattion
export const buildJoyIDCellToSporeCreation = async (
  account: ConnectResponseData,
  ckbRawTx: CKBComponents.RawTransaction,
) => {
  let sumInputsCapacity = BigInt(0);
  for await (const input of ckbRawTx.inputs) {
    const liveCell = await collector.getLiveCell(input.previousOutput!);
    if (!liveCell) {
      throw new Error('The cell with the specific out point is dead');
    }
    sumInputsCapacity += BigInt(liveCell.output.capacity);
  }

  const rawTx = await buildAppendingIssuerCellToSporesCreateTx({
    issuerAddress: account.address,
    collector,
    ckbRawTx,
    sumInputsCapacity: sumInputsCapacity.toString(16),
    witnessLockPlaceholderSize: RGBPP_TX_WITNESS_MAX_SIZE,
  });

  rawTx.cellDeps = [...rawTx.cellDeps, getJoyIDCellDep(false)];

  const rgbppInputsLength = ckbRawTx.inputs.length;

  const emptyWitness = {
    lock: '',
    inputType: '',
    outputType: '',
  };
  let issuerWitnesses = rawTx.inputs.slice(rgbppInputsLength).map((_, index) => (index === 0 ? emptyWitness : '0x'));

  if (account.keyType === 'sub_key') {
    const lock = addressToScript(account.address);
    const unlockEntry = await getSubkeyUnlock(AGGREGATOR_URL, account);
    const emptyWitness = {
      lock: '',
      inputType: '',
      outputType: append0x(unlockEntry),
    };
    issuerWitnesses = rawTx.inputs.slice(rgbppInputsLength).map((_, index) => (index === 0 ? emptyWitness : '0x'));

    const cotaCells = await collector.getCells({ lock: lock, type: getCotaTypeScript(false) });
    if (!cotaCells || cotaCells.length === 0) {
      throw new Error("Cota cell doesn't exist");
    }
    const cotaCell = cotaCells[0];
    const cotaCellDep: CKBComponents.CellDep = {
      outPoint: cotaCell.outPoint,
      depType: 'code',
    };
    // Please make sure that the cotaCellDep is at the first position of the cellDeps
    rawTx.cellDeps = [cotaCellDep, ...rawTx.cellDeps];
  }

  const lastRawTxWitnessIndex = rawTx.witnesses.length - 1;
  rawTx.witnesses = [
    ...rawTx.witnesses.slice(0, lastRawTxWitnessIndex),
    ...issuerWitnesses,
    // The cobuild witness will be placed to the tail of the witnesses
    rawTx.witnesses[lastRawTxWitnessIndex],
  ];

  return { unsignedTx: rawTx, witnessIndex: rgbppInputsLength };
};
