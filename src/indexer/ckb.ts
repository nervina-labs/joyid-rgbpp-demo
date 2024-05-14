import axios from 'axios';
import { addressToScript } from '@nervosnetwork/ckb-sdk-utils';
import { CKB_INDEXER_URL } from '../env';

type Hex = string;
interface IndexerSearchKey {
  script?: {
    code_hash: Hex;
    hash_type: CKBComponents.ScriptHashType;
    args: Hex;
  };
  script_type?: 'lock' | 'type';
  script_search_mode?: 'prefix' | 'exact';
}

export const CKB_DECIMAL = BigInt(10 ** 8);

export const getCellsCapacity = async (address: string) => {
  const lock = addressToScript(address);
  const searchKey: IndexerSearchKey = {
    script_search_mode: 'exact',
    script: {
      code_hash: lock.codeHash,
      hash_type: lock.hashType,
      args: lock.args,
    },
    script_type: 'lock',
  };
  const payload = {
    id: Math.floor(Math.random() * 100000),
    jsonrpc: '2.0',
    method: 'get_cells_capacity',
    params: [searchKey],
  };
  const body = JSON.stringify(payload, null, '  ');
  const response = (
    await axios({
      method: 'post',
      url: CKB_INDEXER_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 20000,
      data: body,
    })
  ).data;
  if (response.error) {
    console.error(response.error);
    throw new Error('Get cells capacity from indexer error');
  } else {
    const balance = BigInt(response.result.capacity);
    const integer = balance / CKB_DECIMAL;
    const fraction = balance % CKB_DECIMAL;
    return `${integer}.${fraction}`;
  }
};
