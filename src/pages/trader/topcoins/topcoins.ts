import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

// import { ProfileProvider } from '../../../providers';
import { timer } from 'rxjs/observable/timer';
import { Logger } from '../../../providers/logger/logger';
import { TraderProvider } from '../../../providers/trader/trader';

import { DatafeedPage } from '../datafeed/datafeed';
import { FormatUtils } from './formatutils';

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
  public topCoins = [];
  private pairs = [];

  private refreshTimer;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private logger: Logger,
    private traderProvider: TraderProvider
  ) {
    this.loadTopCoins();

    this.loadPairs();
  }

  ionViewDidLoad() {}

  ionViewWillEnter() {
    this.refreshTimer = timer(5000, 5000).subscribe(() => this.loadTopCoins());
  }

  private loadTopCoins(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.traderProvider
        .getTopCoins()
        .then(res => {
          this.logger.log('Loaded ' + res.length + ' top coins');
          for (let i = 0; i < res.length; i++)
            res[i].PriceUSD = FormatUtils.formatPrice(res[i].PriceUSD);
          this.topCoins = res;
          return resolve();
        })
        .catch(error => {
          this.logger.error(error);
          reject(error);
        });
    });
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
