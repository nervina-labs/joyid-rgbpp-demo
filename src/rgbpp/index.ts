import { Collector, buildAppendingIssuerCellToSporesCreateTx } from '@rgbpp-sdk/ckb';
import { CKB_INDEXER_URL, CKB_RPC_URL } from '../env';
import { getJoyIDCellDep } from '@joyid/ckb';

export const collector: Collector = new Collector({
  ckbIndexerUrl: CKB_INDEXER_URL,
  ckbNodeUrl: CKB_RPC_URL,
});

export const buildJoyIDCellToSporeCreation = async (issuerAddress: string, ckbRawTx: CKBComponents.RawTransaction) => {
  let sumInputsCapacity = BigInt(0);
  for await (const input of ckbRawTx.inputs) {
    const liveCell = await collector.getLiveCell(input.previousOutput!);
    if (!liveCell) {
      throw new Error('The cell with the specific out point is dead');
    }
    sumInputsCapacity += BigInt(liveCell.output.capacity);
  }

  const rawTx = await buildAppendingIssuerCellToSporesCreateTx({
    issuerAddress,
    collector,
    ckbRawTx,
    sumInputsCapacity: sumInputsCapacity.toString(16),
  });

  rawTx.cellDeps = [...rawTx.cellDeps, getJoyIDCellDep(false)];

  const rgbppInputsLength = ckbRawTx.inputs.length;

  const emptyWitness = { lock: '', inputType: '', outputType: '' };
  const issuerWitnesses = rawTx.inputs.slice(rgbppInputsLength).map((_, index) => (index === 0 ? emptyWitness : '0x'));

  const lastRawTxWitnessIndex = rawTx.witnesses.length - 1;
  rawTx.witnesses = [
    ...rawTx.witnesses.slice(0, lastRawTxWitnessIndex),
    ...issuerWitnesses,
    // The cobuild witness will be placed to the tail of the witnesses
    rawTx.witnesses[lastRawTxWitnessIndex],
  ];

  return { unsignedTx: rawTx, witnessIndex: rgbppInputsLength };
};
