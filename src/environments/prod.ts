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
    bcd: 'http://localhost:3232/bws/api/v1/fiatrates/BCD?provider=Binance',
  },
  activateScanner: true
};

export default env;
