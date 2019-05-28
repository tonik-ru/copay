import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

// import { ProfileProvider } from '../../../providers';
import { timer } from 'rxjs/observable/timer';
import { Logger } from '../../../providers/logger/logger';
import { TraderProvider } from '../../../providers/trader/trader';

import { SettingsPage } from '../../settings/settings';

import { DatafeedPage } from '../datafeed/datafeed';
import { FormatUtils } from './formatutils';

import { RateProvider } from '../../../providers/rate/rate';

import { PersistenceProvider } from '../../../providers/persistence/persistence';

import * as _ from 'lodash';
/**
 * Generated class for the TopcoinsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-topcoins',
  templateUrl: 'topcoins.html'
})
export class TopcoinsPage {
  public items = [];

  public topCoins = [];
  public filter = '';
  public altCurrencyList = [];
  public selectedCurrency;
  public currencySymbol = '$';

  private completeAlternativeList = [];
  private pairs = [];

  private refreshTimer;

  // @ViewChild('slider') slider: Slides;
  // showlook = '0';

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private logger: Logger,
    private traderProvider: TraderProvider,
    private rate: RateProvider,
    private persistenceProvider: PersistenceProvider
  ) {
    this.loadTopCoins();
    // this.showlook = '0';
    this.loadPairs();
    this.toggled = false;
  }
  // selectedTab(index) {
  //   this.slider.slideTo(index);
  // }

  public toggled: boolean = false;

  public toggle(): void {
    this.toggled = !this.toggled;
  }

  initializeItems() {
    // this.items = this.topCoins;
  }

  getTopics() {
    this.applyFilter();
  }

  applyFilter() {
    let val = this.filter; // v.target.value;

    if (val && val.trim() != '') {
      this.items = this.topCoins.filter(item => {
        return item.Symbol.toLowerCase().indexOf(val.toLowerCase()) > -1;
      });
    } else this.items = this.topCoins;
  }

  ionViewDidLoad() {}
  ionViewDidEnter() {
    // this.slider.onlyExternal = true;
    this.logger.log('topcoins will enter');
  }

  ionViewWillEnter() {
    this.refreshTimer = timer(15000, 15000).subscribe(() =>
      this.loadTopCoins()
    );

    this.rate
      .whenRatesAvailable('btc')
      .then(() => {
        this.completeAlternativeList = this.rate.listAlternatives(true);
        this.completeAlternativeList = _.orderBy(this.completeAlternativeList, [
          x => (x.isoCode == 'USD' || x.isoCode == 'BTC' ? 0 : 1),
          x => x.IsoCode
        ]);
        // let idx = _.keyBy(this.unusedCurrencyList, 'isoCode');
        // let idx2 = _.keyBy(this.lastUsedAltCurrencyList, 'isoCode');

        // this.completeAlternativeList = _.reject(
        //   this.completeAlternativeList,
        //   c => {
        //     return idx[c.isoCode] || idx2[c.isoCode];
        //   }
        // );
        // this.altCurrencyList = this.completeAlternativeList.slice(0, 20);

        // we need this dummy field, othervise ngModel failes to bind correctly on second view show
        this.altCurrencyList.forEach(x => (x.dummy = Math.random()));
        this.altCurrencyList = this.completeAlternativeList;
        this.resolveSelectedCurrency(this.selectedCurrency);
      })
      .catch(err => {
        this.logger.error(err);
      });

    this.persistenceProvider
      .getLastTopCoinsCurrencyUsed()
      .then(cur => {
        this.persistenceProvider.getLastTopCoinsCurrencyList().then(list => {
          if (list && this.altCurrencyList.length == 0)
            this.altCurrencyList = list;

          if (cur) this.selectedCurrency = cur;

          this.resolveSelectedCurrency(cur);
        });
      })
      .catch(err => {
        this.logger.error(err);
      });

    // this.refreshTimer = timer(5000, 5000).subscribe(() =>
    //   this.initializeItems()
    // );
  }

  private resolveSelectedCurrency(cur) {
    let code = cur ? cur.isoCode : 'USD';
    this.selectedCurrency = _.find(
      this.altCurrencyList,
      x => x.isoCode == code
    );
  }

  private loadTopCoins(): Promise<any> {
    return new Promise(resolve => {
      this.traderProvider
        .getTopCoins()
        .then(res => {
          this.logger.log('Loaded ' + res.length + ' top coins');
          this.topCoins = res;
          this.selectCurrency();
          return resolve();
        })
        .then(() => this.applyFilter())
        .catch(error => {
          this.logger.error(error);
          // reject(error);
        });
    });
  }

  public selectCurrency(save: boolean = false) {
    if (save)
      this.persistenceProvider.setLastTopCoinsCurrencyUsed(
        this.selectedCurrency
      );
    let res = this.topCoins;
    this.currencySymbol =
      this.selectedCurrency.isoCode == 'USD' ? (this.currencySymbol = '$') : '';

    let curRate = this.rate.getUsdRate(this.selectedCurrency.isoCode);
    for (let i = 0; i < res.length; i++) {
      res[i].PriceAlternative = res[i].PriceUSD * curRate;
      let decimals = 2;

      if (res[i].PriceAlternative < 0.000001) decimals = 8;
      else if (res[i].PriceAlternative < 0.0001) decimals = 6;
      else if (res[i].PriceAlternative < 1) decimals = 4;

      res[i].PriceFormatted = FormatUtils.formatPrice(
        res[i].PriceAlternative,
        decimals
      );
      res[i].PriceUSDFormatted = FormatUtils.formatPrice(
        res[i].PriceUSD,
        decimals
      );
    }
  }

  public settings(): void {
    this.navCtrl.push(SettingsPage);
  }

  loadPairs() {
    this.traderProvider
      .getPairs()
      .then(res => {
        this.pairs = res;
      })
      .catch(error => {
        this.logger.error(error);
      });
  }

  public selectCoin(coin) {
    this.logger.log('Selected ' + coin);
    let validPairs = this.pairs.filter(
      x => x.BaseAssetCurrencyId == coin.CurrencyId
    );

    this.navCtrl.push(DatafeedPage, { coin, validPairs });
  }

  ionViewWillLeave() {
    this.refreshTimer.unsubscribe();
  }
  ngOnDestroy() {
    this.refreshTimer.unsubscribe();
  }

  public doRefresh(event) {
    this.logger.log('Refreshing...');
    this.loadTopCoins().then(() => {
      event.complete();
    });
  }
}
