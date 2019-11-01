import { EnvironmentSchema } from './schema';

/**
 * Environment: prod
 */
const env: EnvironmentSchema = {
  name: 'production',
  enableAnimations: true,
  ratesAPI: {
    btc: 'https://bitpay.com/api/rates',
    bch: 'https://bitpay.com/api/rates/bch',
    bcd: 'https://wallet.bitcoindiamond.org/bws/api/v1/fiatrates/BCD?provider=Binance',
    eth: 'https://bitpay.com/api/rates/eth'
  },
  activateScanner: true
};

export default env;
