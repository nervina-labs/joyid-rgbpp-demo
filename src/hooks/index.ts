import { atomWithStorage } from 'jotai/utils';
import { useAtomValue, useSetAtom } from 'jotai';
import { AuthResponse } from '@joyid/ckb';

export const accountAtom = atomWithStorage<NonNullable<
  AuthResponse['data'] & { callbackType: 'redirect' | 'popup' }
> | null>('_demo_account_v2_', null);

export const useAccount = () => useAtomValue(accountAtom);

export const useSetAccountInfo = () => useSetAtom(accountAtom);
