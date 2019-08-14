import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';

import { Logger } from '../../providers/logger/logger';
import { ShopTargetPage } from './shop-target/shop-target';

// import * as _ from 'lodash';
import { ShopsProvider } from '../../providers/shops/shops';

import {
  InAppBrowser,
  InAppBrowserOptions
} from '@ionic-native/in-app-browser';

/**
 * Generated class for the Tab4Page page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-bcdbazaar',
  templateUrl: 'bcdbazaar.html'
})
export class TabBcdbazaar {
  private shopDirectory: any;
  public cats = [];
  public items = [];
  public categorySelected: boolean = false;
  public catid: string;
  public selectedCat: string = 'all';
  public filter: string;

  public Title: string = 'Shopping';

  options: InAppBrowserOptions = {
    location: 'yes',
    hidden: 'no',
    clearcache: 'yes',
    clearsessioncache: 'yes',
    zoom: 'yes',
    hardwareback: 'yes',
    mediaPlaybackRequiresUserAction: 'no',
    shouldPauseOnSuspend: 'no',
    closebuttoncaption: 'Close',
    disallowoverscroll: 'no',
    toolbar: 'yes',
    enableViewportScale: 'no',
    allowInlineMediaPlayback: 'no',
    presentationstyle: 'pagesheet',
    hidenavigationbuttons: 'no',
    fullscreen: 'yes'
  };

  constructor(
    private navCtrl: NavController,
    private logger: Logger,
    private shopsProvider: ShopsProvider,
    private iab: InAppBrowser,
    public plt: Platform
  ) {
    this.cats;
    this.items;
  }

  public selectShop(e, lg) {
    this.navCtrl.push(ShopTargetPage, { shop: e, logo: lg });
  }

  ionViewWillEnter() {
    this.shopDirectory = this.shopsProvider.shopDirectory;
    this.populateData();

    this.selectedCat = 'all';

    this.shopsProvider
      .getDirectory()
      .then(data => {
        if (!data) return;
        this.shopDirectory = data;
        this.populateData();
      })
      .catch(ex => {
        this.logger.error(ex);
      });
  }

  private populateData() {
    this.cats = this.shopDirectory.Categories;
    this.items = this.shopDirectory.Stores;

    this.applyFilter();
  }

  public applyFilterCat() {
    let val = this.selectedCat; // v.target.value;

    if (val && val.trim() != 'all') {
      this.items = this.shopDirectory.Stores.filter(item => {
        return item.categoryId == val;
      });
    } else this.items = this.shopDirectory;
  }

  public selectCat() {
    this.logger.log(this.selectedCat);
    // this.filter = '';
    // this.applyFilterCat();
    this.applyFilter();
  }

  public searhclick() {
    // this.selectedCat = 'all';
  }

  public applyFilter() {
    var searchCategory = (this.selectedCat || '').toLowerCase();
    var searchStr = (this.filter || '').toLowerCase();

    this.items = this.shopDirectory.Stores.filter(item => {
      return (
        (item.company.toLowerCase().indexOf(searchStr) > -1 ||
          item.desc.toLowerCase().indexOf(searchStr) > -1 ||
          searchStr == '') &&
        (item.categoryId.toLowerCase == searchCategory ||
          searchCategory == 'all')
      );
    });
  }

  ionViewDidLoad() {}
  clearSearch() {
    this.selectedCat = 'all';
  }

  openBrowser(url: string) {
    // const options: InAppBrowserOptions = {
    //   zoom: 'no',
    //   location: 'no',
    //   toolbar: 'yes'
    // };
    // this.iab.create(url, '_self', options);
    if (this.plt.is('ios')) {
      let target = '_system';
      this.iab.create(url, target, this.options);
      this.logger.log('ios');
    }
    // else   if (this.plt.is('windows')) {
    //   let target = "_system";
    //   this.iab.create(url, target, this.options);
    //   this.logger.log('windows');
    // }
    else {
      this.selectShop(url, '');
      this.logger.log('android or windows');
    }
  }

  openCategory(id: string, title: string) {
    this.categorySelected = !this.categorySelected;
    this.catid = id;
    title !== 'exit' ? (this.Title = title) : (this.Title = 'Shopping');
  }
}
