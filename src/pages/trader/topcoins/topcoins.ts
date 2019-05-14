import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Slides } from 'ionic-angular';

// import { ProfileProvider } from '../../../providers';
import { timer } from 'rxjs/observable/timer';
import { Logger } from '../../../providers/logger/logger';
import { TraderProvider } from '../../../providers/trader/trader';

import { SettingsPage } from '../../settings/settings';

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
  public items = [];

  public topCoins = [];
  public filter = '';
  private pairs = [];

  private refreshTimer;

  @ViewChild('slider') slider: Slides;
  showlook = '0';

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private logger: Logger,
    private traderProvider: TraderProvider
  ) {
    this.loadTopCoins();
    this.showlook = '0';
    this.loadPairs();
    this.toggled = false;
  }
  selectedTab(index) {
    this.slider.slideTo(index);
  }

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
    this.slider.onlyExternal = true;
  }

  ionViewWillEnter() {
    this.refreshTimer = timer(15000, 15000).subscribe(() =>
      this.loadTopCoins()
    );
    // this.refreshTimer = timer(5000, 5000).subscribe(() =>
    //   this.initializeItems()
    // );
  }

  private loadTopCoins(): Promise<any> {
    return new Promise(resolve => {
      this.traderProvider
        .getTopCoins()
        .then(res => {
          this.logger.log('Loaded ' + res.length + ' top coins');
          for (let i = 0; i < res.length; i++) {
            let decimals = 4;
            if(res[i].PriceUSD < 0.000001)
              decimals = 8;
            if(res[i].PriceUSD < 0.0001)
            decimals = 6; 
            res[i].PriceUSD = FormatUtils.formatPrice(res[i].PriceUSD, decimals);
          }
          this.topCoins = res;
          return resolve();
        })
        .then(() => this.applyFilter())
        .catch(error => {
          this.logger.error(error);
          // reject(error);
        });
    });
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
