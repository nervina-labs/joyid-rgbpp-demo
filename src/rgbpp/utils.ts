import { Collector } from 'rgbpp/ckb';
import { CKB_INDEXER_URL, CKB_RPC_URL } from '../env';

export const collector: Collector = new Collector({
  ckbIndexerUrl: CKB_INDEXER_URL,
  ckbNodeUrl: CKB_RPC_URL,
});
