import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import env from '../../environments';
import { CoinsMap, CurrencyProvider } from '../../providers/currency/currency';
import { Logger } from '../../providers/logger/logger';

@Injectable()
export class RateProvider {
  private alternatives;
  private rates = {} as CoinsMap<{}>;
  private ratesAvailable = {} as CoinsMap<boolean>;
  private rateServiceUrl = {} as CoinsMap<string>;

  private fiatRateAPIUrl = 'https://bws.bitpay.com/bws/api/v1/fiatrates';

  constructor(
    private currencyProvider: CurrencyProvider,
    private http: HttpClient,
    private logger: Logger
  ) {
    this.logger.debug('RateProvider initialized');
    this.alternatives = {};
    for (const coin of this.currencyProvider.getAvailableCoins()) {
      this.rateServiceUrl[coin] = env.ratesAPI[coin];
      this.ratesAvailable[coin] = false;
      this.rates[coin] = { USD: 1 };
      if (coin == 'bcd') continue;
      let p = this.updateRates(coin);
      if (coin == 'btc')
        p.then(() => this.updateRatesBcd());
    }
  }

  private updateRatesBcd(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.logger.debug('Updating BCD rates');
      this.getBCD()
        .then(dataBCD => {
          for (var code in this.rates['btc']) {
            this.rates['bcd'][code] = this.rates['btc'][code] * dataBCD.rate;
          }
          this.rates['bcd']['bcd'] = 1;
          this.ratesAvailable['bcd'] = true;
          resolve();
        })
        .catch(errorBCD => {
          this.logger.error(errorBCD);
          reject(errorBCD);
        });
    });
  }

  public updateRates(chain: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getCoin(chain)
        .then(dataCoin => {
          _.each(dataCoin, currency => {
            if (currency && currency.code && currency.rate) {
              this.rates[chain][currency.code] = currency.rate;
              if (currency.name)
                this.alternatives[currency.code] = { name: currency.name };
            }
          });
          this.ratesAvailable[chain] = true;
          resolve();
        })
        .catch(errorCoin => {
          this.logger.error(errorCoin);
          reject(errorCoin);
        });
    });
  }

  public getCoin(chain: string): Promise<any> {
    return new Promise(resolve => {
      this.http.get(this.rateServiceUrl[chain]).subscribe(data => {
        resolve(data);
      });
    });
  }

  public getBCD(): Promise<any> {
    return new Promise(resolve => {
      this.http.get(this.rateServiceUrl['bcd']).subscribe(data => {
        resolve(data);
      });
    });
  }

  public getRate(code: string, chain?: string): number {
    return this.rates[chain][code];
  }

  public getUsdRate(code: string): number {
    if (!this.isCoinAvailable('btc')) return 0;
    let btcToCodeRate = this.rates['btc'][code];
    let btcUsdRate = this.rates['btc']['USD'];
    if (btcToCodeRate == 0 || btcUsdRate == 0) return 0;
    return btcToCodeRate / btcUsdRate;
  } 

  private getAlternatives(): any[] {
    const alternatives: any[] = [];
    for (let key in this.alternatives) {
      alternatives.push({ isoCode: key, name: this.alternatives[key].name });
    }
    return alternatives;
  }

  public isCoinAvailable(chain: string) {
    return this.ratesAvailable[chain];
  }

  public toFiat(satoshis: number, code: string, chain): number {
    if (!this.isCoinAvailable(chain)) {
      return null;
    }
    return (
      satoshis *
      (1 / this.currencyProvider.getPrecision(chain).unitToSatoshi) *
      this.getRate(code, chain)
    );
  }

  public fromFiat(amount: number, code: string, chain): number {
    if (!this.isCoinAvailable(chain)) {
      return null;
    }
    return (
      (amount / this.getRate(code, chain)) *
      this.currencyProvider.getPrecision(chain).unitToSatoshi
    );
  }

  public listAlternatives(sort: boolean) {
    const alternatives = this.getAlternatives();
    if (sort) {
      alternatives.sort((a, b) => {
        return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
      });
    }
    return _.uniqBy(alternatives, 'isoCode');
  }

  public whenRatesAvailable(chain: string): Promise<any> {
    return new Promise(resolve => {
      if (this.ratesAvailable[chain]) resolve();
      else {
        if (chain) {
          this.updateRates(chain).then(() => {
            resolve();
          });
        }
      }
    });
  }

  public getHistoricFiatRate(
    currency: string,
    coin: string,
    ts: string
  ): Promise<any> {
    return new Promise(resolve => {
      const url =
        this.fiatRateAPIUrl + '/' + currency + '?coin=' + coin + '&ts=' + ts;
      this.http.get(url).subscribe(data => {
        resolve(data);
      });
    });
  }
}
