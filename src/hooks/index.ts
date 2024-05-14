import { atomWithStorage } from 'jotai/utils';
import { useAtomValue, useSetAtom } from 'jotai';
import { AuthResponse } from '@joyid/ckb';

export const accountAtom = atomWithStorage<NonNullable<
  AuthResponse['data'] & { callbackType: 'redirect' | 'popup' }
> | null>('_demo_account_v2_', null);

export const useAccount = () => useAtomValue(accountAtom);

export const useSetAccountInfo = () => useSetAtom(accountAtom);

export type BTCAddressType = 'p2tr' | 'p2wpkh';
export const btcAddressTypeAtom = atomWithStorage<BTCAddressType>('_demo_btc_address_type_', 'p2tr');

export const useBtcAddressType = () => useAtomValue(btcAddressTypeAtom);

export const useSetBtcAddressType = () => useSetAtom(btcAddressTypeAtom);
