import { BtcAssetsApi, DataSource } from 'rgbpp';
import { NetworkType } from 'rgbpp/btc';
import { BTC_SERVICE_ORIGIN, BTC_SERVICE_TOKEN, BTC_SERVICE_URL } from '../env';

const networkType = NetworkType.TESTNET;
export const btcService = BtcAssetsApi.fromToken(BTC_SERVICE_URL, BTC_SERVICE_TOKEN, BTC_SERVICE_ORIGIN);
export const btcDataSource = new DataSource(btcService, networkType);

export const BTC_DECIMAL = 10 ** 8;

export const getBtcBalance = async (btcAddress: string) => {
  const { satoshi } = await btcService.getBtcBalance(btcAddress);
  const integer = satoshi / BTC_DECIMAL;
  const fraction = satoshi % BTC_DECIMAL;
  return `${integer}.${fraction}`;
};
