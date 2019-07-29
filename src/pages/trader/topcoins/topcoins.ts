import { Component, ElementRef, Renderer, ViewChild } from '@angular/core';
import {
  ItemSliding,
  List,
  ModalController,
  NavController,
  NavParams,
  ToastController
} from 'ionic-angular';

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

import { Storage } from '@ionic/storage';

import { InstructionsPage } from '../instructions/instructions';

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
  @ViewChild('tabletitle') tabletitleId: ElementRef;
  @ViewChild(List) coinsList: List;
  fabToHide;
  oldScrollTop: number = 0;

  public items = [];

  public topCoins = [];
  public filter = '';
  public altCurrencyList = [];
  public selectedCurrency;
  public currencySymbol = '$';

  private completeAlternativeList = [];
  private pairs = [];

  private refreshTimer;

  public SearchOpened: boolean = false;
  public fav: any = [];
  public favorite: boolean = false;
  public showfavriteslist: boolean = false;
  public showInstruction: boolean = true;
  safeSvg;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private logger: Logger,
    private traderProvider: TraderProvider,
    private rate: RateProvider,
    private persistenceProvider: PersistenceProvider,
    private renderer: Renderer,
    public storage: Storage,
    public modal: ModalController,
    public toastCtrl: ToastController
  ) {
    this.loadPairs();
    this.toggled = false;

    // this.storage.get('bcdremove').then(val => {
    //   if (val !== null) {
    //     this.favorite = val;
    //   }
    // });

    // if (!this.favorite) {
    //   this.storage.set('favList', [{ id: 76 }]);
    // }

    // this.storage.get('favList').then(val => {
    //   if (val !== null) {
    //     this.fav = val;
    //   }
    // });
  }

  onContentScroll(e) {
    if (e.scrollTop - this.oldScrollTop > 10) {
      this.logger.log('DOWN');

      this.renderer.setElementStyle(
        this.tabletitleId.nativeElement,
        'display',
        'flex'
      );
    } else if (e.scrollTop - this.oldScrollTop <= 10) {
      this.renderer.setElementStyle(
        this.tabletitleId.nativeElement,
        'display',
        'none'
      );
    }
    this.oldScrollTop = e.scrollTop;
  }

  public toggled: boolean = false;

  public toggle(): void {
    this.toggled = !this.toggled;
  }

  goToSearch() {
    this.logger.log('OpenSearch');
    this.SearchOpened = !this.SearchOpened;
    this.filter = '';
    this.applyFilter();
  }

  getTopics() {
    this.applyFilter();
  }

  applyFilter() {
    let val = this.filter;

    if (val && val.trim() != '') {
      this.items = this.topCoins.filter(item => {
        return item.Symbol.toLowerCase().indexOf(val.toLowerCase()) > -1;
      });
    } else this.items = this.topCoins;
  }

  showToast(msg: string) {
    const toast = this.toastCtrl.create({
      message: msg,
      duration: 3000
    });
    toast.present();
  }

  addToFavorite(id: number, slideId: ItemSliding) {
    this.showToast('Coin was added to favorites');
    /*this.favoriteservice.addtoFavorite(id);
  this.fav.push({'id': id, 'IsFav': true});*/
    this.logger.log('id', id);
    this.fav.push({ id });
    this.storage.set('favList', this.fav);
    slideId.close();
  }

  removeFavorite(id: number, slideId: ItemSliding) {
    this.coinsList.closeSlidingItems();
    this.showToast('Coin was removed from favorites');
    if (this.fav.find(x => x.id == id)) {
      this.fav.splice(this.fav.findIndex(x => x.id == id), 1);
    }
    if (id == 76) {
      this.favorite = true;
    } else if (id == 3) {
      this.favorite = true;
    } else if (id == 1) {
      this.favorite = true;
    } else if (id == 1653) {
      this.favorite = true;
    }

    this.storage.set('favList', this.fav);
    this.storage.set('bcdremove', this.favorite);
    slideId.close();
  }

  isFav(id: number): boolean {
    return this.fav.find(x => x.id === id);
  }

  goToFavariites() {
    this.showfavriteslist = !this.showfavriteslist;
    if (this.showfavriteslist == true) {
      setTimeout(() => {
        if (this.showInstruction == true) {
          this.openModal();
        }
      }, 300);
    }
  }

  ionViewDidLoad() {}
  ionViewDidEnter() {
    // this.slider.onlyExternal = true;
    this.logger.log('1fav', this.favorite);
    this.logger.log('topcoins will enter');
  }

  openModal() {
    const modalInst = this.modal.create(InstructionsPage);
    modalInst.present();

    modalInst.onDidDismiss(data => {
      this.storage.set('instruction', data.inst);
      this.showInstruction = data.inst;
      this.logger.log(data.inst);
    });
  }

  ionViewWillEnter() {
    this.storage.get('instruction').then(val => {
      if (val !== null) {
        this.showInstruction = val;
      }
    });

    this.logger.log('Show Instuctions:', this.showInstruction);

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
          this.loadTopCoins();
        });
      })
      .catch(err => {
        this.logger.error(err);
      });

    this.logger.log('added to fav from datafeed');
    this.storage.get('bcdremove').then(val => {
      if (val !== null) {
        this.favorite = val;
        this.logger.log('2fav', this.favorite);
        if (this.favorite == false) {
          this.storage.set('favList', [
            { id: 76 },
            { id: 1 },
            { id: 3 },
            { id: 1653 }
          ]);
        }
      } else {
        this.storage.set('bcdremove', false);

        this.logger.log('BCDREMOVE null');
        this.storage.set('favList', [
          { id: 76 },
          { id: 1 },
          { id: 3 },
          { id: 1653 }
        ]);
        this.fav = [{ id: 76 }, { id: 1 }, { id: 3 }, { id: 1653 }];
      }
    });

    this.storage.get('favList').then(val => {
      if (val !== null) {
        this.fav = val;
      }
    });
  }

  private resolveSelectedCurrency(cur) {
    let code = cur ? cur.isoCode : 'USD';
    if (this.altCurrencyList.length == 0)
      this.selectedCurrency = { isoCode: code };
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
          // this.topCoins = res;
          this.updateTopCoinsFromList(res);
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

  private updateTopCoinsFromList(data: any[]) {
    _.forEach(data, x => {
      var match = _.find(this.topCoins, y => y.Symbol == x.Symbol);
      if (match) {
        for (var p in x) match[p] = x[p];
      } else {
        var index = _.indexOf(data, x);
        this.topCoins.splice(index, 0, x);
      }
    });
  }

  public selectCurrency(save: boolean = false) {
    if (save)
      this.persistenceProvider.setLastTopCoinsCurrencyUsed(
        this.selectedCurrency
      );
    let res = this.topCoins;
    this.currencySymbol =
      this.selectedCurrency.isoCode == 'USD'
        ? '$'
        : this.selectedCurrency.isoCode;

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
