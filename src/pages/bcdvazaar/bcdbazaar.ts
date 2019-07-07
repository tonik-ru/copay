import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { Logger } from '../../providers/logger/logger';
import { ShopTargetPage } from './shop-target/shop-target';

import * as _ from 'lodash';
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
  private shopDirectory: any[];
  public cats = [];
  public items = [];

  public selectedCat: string = 'all';
  public filter: string;

  constructor(
    private navCtrl: NavController,
    private logger: Logger,
    private shopsProvider: ShopsProvider,
    private iab: InAppBrowser
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
    this.cats = _.uniqBy(this.shopDirectory, 'cat');
    this.items = this.shopDirectory;
    this.applyFilter();
  }

  public applyFilterCat() {
    let val = this.selectedCat; // v.target.value;

    if (val && val.trim() != 'all') {
      this.items = this.shopDirectory.filter(item => {
        return item.cat.toLowerCase().indexOf(val.toLowerCase()) > -1;
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

    this.items = this.shopDirectory.filter(item => {
      return (
        (item.company.toLowerCase().indexOf(searchStr) > -1 ||
          item.desc.toLowerCase().indexOf(searchStr) > -1 ||
          searchStr == '') &&
        (item.cat.toLowerCase().indexOf(searchCategory) > -1 ||
          searchCategory == 'all')
      );
    });
  }

  ionViewDidLoad() {}
  clearSearch() {
    this.selectedCat = 'all';
  }

  openBrowser(url: string) {
    const options: InAppBrowserOptions = {
      zoom: 'no',
      location: 'no',
      toolbar: 'no'
    };
    this.iab.create(url, '_self', options);
  }
}
