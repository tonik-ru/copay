import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import env from '../../environments';
import { Logger } from '../../providers/logger/logger';

@Injectable()
export class RateProvider {
  private rates;
  private alternatives;
  private ratesBCH;
  private ratesBCD;
  private ratesBtcAvailable: boolean;
  private ratesBchAvailable: boolean;
  private ratesBcdAvailable: boolean;

  private SAT_TO_BTC: number;
  private BTC_TO_SAT: number;

  private rateServiceUrl = env.ratesAPI.btc;
  private bchRateServiceUrl = env.ratesAPI.bch;
  private bcdRateServiceUrl = env.ratesAPI.bcd;

  constructor(private http: HttpClient, private logger: Logger) {
    this.logger.debug('RateProvider initialized');
    this.rates = {};
    this.alternatives = [];
    this.ratesBCH = {};
    this.ratesBCD = {};
    this.SAT_TO_BTC = 1 / 1e8;
    this.BTC_TO_SAT = 1e8;
    this.ratesBtcAvailable = false;
    this.ratesBchAvailable = false;
    this.ratesBcdAvailable = false;
    this.updateRatesBtc();
    this.updateRatesBch();
  }

  public updateRatesBtc(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getBTC()
        .then(dataBTC => {
          _.each(dataBTC, currency => {
            this.rates[currency.code] = currency.rate;
            this.alternatives.push({
              name: currency.name,
              isoCode: currency.code,
              rate: currency.rate
            });
          });
          this.ratesBtcAvailable = true;
          this.logger.debug('BTC rates updated');

          resolve();
        })
        .then(() => {
          this.updateRatesBcd();
          resolve();
        })
        .catch(errorBTC => {
          this.logger.error(errorBTC);
          reject(errorBTC);
        });
    });
  }

  public updateRatesBcd(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.logger.debug('Updating BCD rates');
      this.getBCD()
        .then(dataBCD => {
          for (var code in this.rates) {
            this.ratesBCD[code] = this.rates[code] * dataBCD.rate;
          }
          this.ratesBCD['bcd'] = 1;
          this.ratesBcdAvailable = true;
          resolve();
        })
        .catch(errorBCD => {
          this.logger.error(errorBCD);
          reject(errorBCD);
        });
    });
  }

  public updateRatesBch(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getBCH()
        .then(dataBCH => {
          _.each(dataBCH, currency => {
            this.ratesBCH[currency.code] = currency.rate;
          });
          this.ratesBchAvailable = true;
          resolve();
        })
        .catch(errorBCH => {
          this.logger.error(errorBCH);
          reject(errorBCH);
        });
    });
  }

  public getBTC(): Promise<any> {
    return new Promise(resolve => {
      this.http.get(this.rateServiceUrl).subscribe(data => {
        resolve(data);
      });
    });
  }

  public getBCH(): Promise<any> {
    return new Promise(resolve => {
      this.http.get(this.bchRateServiceUrl).subscribe(data => {
        resolve(data);
      });
    });
  }

  public getBCD(): Promise<any> {
    return new Promise(resolve => {
      this.http.get(this.bcdRateServiceUrl).subscribe(data => {
        resolve(data);
      });
    });
  }

  public getRate(code: string, chain?: string): number {
    if (chain == 'bch') return this.ratesBCH[code];
    if (chain == 'bcd') return this.ratesBCD[code];
    else return this.rates[code];
  }

  public getUsdRate(code: string): number {
    if (!this.isBtcAvailable()) return 0;
    let btcToCodeRate = this.rates[code];
    let btcUsdRate = this.rates['USD'];
    if (btcToCodeRate == 0 || btcUsdRate == 0) return 0;
    return btcToCodeRate / btcUsdRate;
  }

  public getAlternatives() {
    return this.alternatives;
  }

  public isBtcAvailable() {
    return this.ratesBtcAvailable;
  }

  public isBchAvailable() {
    return this.ratesBchAvailable;
  }

  public isBcdAvailable() {
    return this.ratesBcdAvailable;
  }

  public toFiat(satoshis: number, code: string, chain: string): number {
    if (
      (!this.isBtcAvailable() && chain == 'btc') ||
      (!this.isBchAvailable() && chain == 'bch') ||
      (!this.isBcdAvailable() && chain == 'bcd')
    ) {
      return null;
    }
    return satoshis * this.SAT_TO_BTC * this.getRate(code, chain);
  }

  public fromFiat(amount: number, code: string, chain: string): number {
    if (
      (!this.isBtcAvailable() && chain == 'btc') ||
      (!this.isBchAvailable() && chain == 'bch') ||
      (!this.isBcdAvailable() && chain == 'bcd')
    ) {
      return null;
    }
    return (amount / this.getRate(code, chain)) * this.BTC_TO_SAT;
  }

  public listAlternatives(sort: boolean) {
    let alternatives = _.map(this.getAlternatives(), (item: any) => {
      return {
        name: item.name,
        isoCode: item.isoCode
      };
    });
    if (sort) {
      alternatives.sort((a, b) => {
        return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
      });
    }
    return _.uniqBy(alternatives, 'isoCode');
  }

  public whenRatesAvailable(chain: string): Promise<any> {
    return new Promise(resolve => {
      if (
        (this.ratesBtcAvailable && chain == 'btc') ||
        (this.ratesBchAvailable && chain == 'bch') ||
        (this.ratesBcdAvailable && chain == 'bcd')
      )
        resolve();
      else {
        if (chain == 'btc') {
          this.updateRatesBtc().then(() => {
            resolve();
          });
        }
        if (chain == 'bch') {
          this.updateRatesBch().then(() => {
            resolve();
          });
        }
      }
    });
  }
}
