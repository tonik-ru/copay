import { Injectable } from '@angular/core';
import { Logger } from '../../providers/logger/logger';
import { PersistenceProvider } from '../persistence/persistence';

import * as _ from 'lodash';

export interface CoinOpts {
  btc: Partial<Config['wallet']['settings']>;
  bch: Partial<Config['wallet']['settings']>;
  eth: Partial<Config['wallet']['settings']>;
  bcd: Partial<Config['wallet']['settings']>;
}

export interface Config {
  limits: {
    totalCopayers: number;
    mPlusN: number;
  };

  wallet: {
    requiredCopayers: number;
    totalCopayers: number;
    spendUnconfirmed: boolean;
    reconnectDelay: number;
    idleDurationMin: number;
    settings: {
      unitName: string;
      unitToSatoshi: number;
      unitDecimals: number;
      unitCode: string;
      alternativeName: string;
      alternativeIsoCode: string;
      defaultLanguage: string;
      feeLevel: string;
    };
  };

  bws: {
    url: string;
  };

  download: {
    bitpay: {
      url: string;
    };
    copay: {
      url: string;
    };
  };

  rateApp: {
    bitpay: {
      ios: string;
      android: string;
      wp: string;
    };
    copay: {
      ios: string;
      android: string;
      wp: string;
    };
  };

  lock: {
    method: any;
    value: any;
    bannedUntil: any;
  };

  showIntegration: {
    coinbase: boolean;
    debitcard: boolean;
    amazon: boolean;
    mercadolibre: boolean;
    shapeshift: boolean;
    giftcards: boolean;
  };

  pushNotificationsEnabled: boolean;

  desktopNotificationsEnabled: boolean;

  confirmedTxsNotifications: {
    enabled: boolean;
  };

  emailNotifications: {
    enabled: boolean;
    email: string;
  };

  emailFor?: any;
  bwsFor?: any;
  aliasFor?: any;
  colorFor?: any;
  touchIdFor?: any;

  log: {
    weight: number;
  };

  blockExplorerUrl: {
    btc: string;
    bch: string;
    bcd: string;
    eth: string;
  };

  trader: {
    baseUrl: string;
  };
  lastNotificationsFor?: any;
}

@Injectable()
export class ConfigProvider {
  public configCache: Config;
  public readonly configDefault: Config;
  public coinOpts: CoinOpts;

  constructor(
    private logger: Logger,
    private persistence: PersistenceProvider
  ) {
    this.logger.debug('ConfigProvider initialized');
    this.coinOpts = {
      btc: {
        unitName: 'BTC',
        unitToSatoshi: 100000000,
        unitDecimals: 8,
        unitCode: 'btc'
      },
      bch: {
        unitName: 'BCH',
        unitToSatoshi: 100000000,
        unitDecimals: 8,
        unitCode: 'bch'
      },
      // BCD HACK
      bcd: {
        unitName: 'BCD',
        unitToSatoshi: 10000000,
        unitDecimals: 8,
        unitCode: 'bcd'
      },
      eth: {
        unitName: 'ETH',
        unitToSatoshi: 1e18,
        unitDecimals: 18,
        unitCode: 'eth'
      }
    };
    this.configDefault = {
      // wallet limits
      limits: {
        totalCopayers: 6,
        mPlusN: 100
      },

      // wallet default config
      wallet: {
        requiredCopayers: 2,
        totalCopayers: 3,
        spendUnconfirmed: false,
        reconnectDelay: 5000,
        idleDurationMin: 4,
        settings: {
          unitName: 'BTC',
          unitToSatoshi: 100000000,
          unitDecimals: 8,
          unitCode: 'btc',
          alternativeName: 'US Dollar',
          alternativeIsoCode: 'USD',
          defaultLanguage: '',
          feeLevel: 'normal'
        }
      },

      // Bitcore wallet service URL
      bws: {
        url: 'https://wallet.bitcoindiamond.org/bws/api'
      },

      download: {
        bitpay: {
          url: 'https://www.bitcoindiamond.org/bcd-pay/'
        },
        copay: {
          url: 'https://www.bitcoindiamond.org/bcd-pay/'
        }
      },

      rateApp: {
        bitpay: {
          ios: 'https://apps.apple.com/us/app/bcd-pay/id1464896069?l=ru&ls=1',
          android:
            'https://play.google.com/store/apps/details?id=com.chimpion.bcdpay',
          wp: ''
        },
        copay: {
          ios: 'https://apps.apple.com/us/app/bcd-pay/id1464896069?l=ru&ls=1',
          android:
            'https://play.google.com/store/apps/details?id=com.chimpion.bcdpay',
          wp: ''
        }
      },

      lock: {
        method: null,
        value: null,
        bannedUntil: null
      },

      // External services
      showIntegration: {
        coinbase: false,
        debitcard: true,
        amazon: true,
        mercadolibre: true,
        shapeshift: true,
        giftcards: true
      },

      pushNotificationsEnabled: true,

      desktopNotificationsEnabled: true,

      confirmedTxsNotifications: {
        enabled: true
      },

      emailNotifications: {
        enabled: false,
        email: ''
      },

      log: {
        weight: 3
      },

      blockExplorerUrl: {
        btc: 'insight.bitcore.io/#/BTC/',
        bch: 'insight.bitcore.io/#/BCH/',
        bcd: 'explorer.btcd.io/#/',
        eth: 'insight.bitcore.io/#/ETH/'
      },

      trader: {
        baseUrl: 'http://websocket.rekdeck.com/'
      }
    };
  }

  public load() {
    return new Promise((resolve, reject) => {
      let strData;
      this.persistence
        .getConfig()
        .then((config: Config) => {
          if (_.isString(config)) {
            strData = config.toString();
            this.logger.warn('Bad config found. ' + strData);
            let p1 = strData.lastIndexOf('{"limits"');
            if (p1 > -1) {
              config = JSON.parse(strData.substring(p1));
              this.logger.warn('Config restored from string');
            }
          }

          if (!_.isEmpty(config)) {
            this.configCache = _.clone(config);
            this.backwardCompatibility();
          } else {
            this.configCache = _.clone(this.configDefault);
          }
          this.logImportantConfig(this.configCache);
          resolve();
        })
        .catch(() => {
          this.logger.error('Error Loading Config');
          reject(strData);
        });
    });
  }

  private logImportantConfig(config: Config): void {
    const spendUnconfirmed = config.wallet.spendUnconfirmed;
    const lockMethod = config && config.lock ? config.lock.method : null;

    this.logger.debug(
      'Config | spendUnconfirmed: ' +
        spendUnconfirmed +
        ' - lockMethod: ' +
        lockMethod
    );
  }

  /**
   * @param newOpts object or string (JSON)
   */
  public set(newOpts) {
    const config = _.cloneDeep(this.configDefault);

    if (_.isString(newOpts)) {
      newOpts = JSON.parse(newOpts);
    }
    _.merge(config, this.configCache, newOpts);
    this.configCache = config;
    this.persistence.storeConfig(this.configCache).then(() => {
      this.logger.info('Config saved');
    });
  }

  public getCoinOpts(): CoinOpts {
    return this.coinOpts;
  }

  public get(): Config {
    return this.configCache;
  }

  public getDefaults(): Config {
    return this.configDefault;
  }

  private backwardCompatibility() {
    // these ifs are to avoid migration problems
    if (this.configCache.bws) {
      this.configCache.bws = this.configDefault.bws;
    }
    if (!this.configCache.wallet) {
      this.configCache.wallet = this.configDefault.wallet;
    }
    if (!this.configCache.wallet.settings.unitCode) {
      this.configCache.wallet.settings.unitCode = this.configDefault.wallet.settings.unitCode;
    }
    if (!this.configCache.showIntegration) {
      this.configCache.showIntegration = this.configDefault.showIntegration;
    } else {
      if (this.configCache.showIntegration.giftcards !== false) {
        this.configCache.showIntegration.giftcards = this.configDefault.showIntegration.giftcards;
      }
    }
    if (!this.configCache.pushNotificationsEnabled) {
      this.configCache.pushNotificationsEnabled = this.configDefault.pushNotificationsEnabled;
    }
    if (!this.configCache.desktopNotificationsEnabled) {
      this.configCache.desktopNotificationsEnabled = this.configDefault.desktopNotificationsEnabled;
    }
    if (!this.configCache.emailNotifications) {
      this.configCache.emailNotifications = this.configDefault.emailNotifications;
    }
    if (!this.configCache.lock) {
      this.configCache.lock = this.configDefault.lock;
    }
    if (!this.configCache.confirmedTxsNotifications) {
      this.configCache.confirmedTxsNotifications = this.configDefault.confirmedTxsNotifications;
    }

    if (this.configCache.wallet.settings.unitCode == 'bit') {
      // Convert to BTC. Bits will be disabled
      this.configCache.wallet.settings.unitName = this.configDefault.wallet.settings.unitName;
      this.configCache.wallet.settings.unitToSatoshi = this.configDefault.wallet.settings.unitToSatoshi;
      this.configCache.wallet.settings.unitDecimals = this.configDefault.wallet.settings.unitDecimals;
      this.configCache.wallet.settings.unitCode = this.configDefault.wallet.settings.unitCode;
    }

    if (!this.configCache.trader) {
      this.configCache.trader = this.configDefault.trader;
    }
  }
}
