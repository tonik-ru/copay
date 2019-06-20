import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { Logger } from '../../providers/logger/logger';
import { ShopTargetPage } from './shop-target/shop-target';

import * as _ from 'lodash';
import { ShopsProvider } from '../../providers/shops/shops';

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
  private shopDirectory = [];
  public cats: any = [];
  public items: any = [];

  public selectedCat: string;
  public filter: string;

  constructor(
    private navCtrl: NavController,
    private logger: Logger,
    private shopsProvider: ShopsProvider
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
    this.filter = '';
    this.applyFilterCat();
  }
  public getStroes() {
    this.applyFilter();
  }

  public searhclick() {
    this.selectedCat = 'all';
  }

  applyFilter() {
    let val = this.filter; // v.target.value;

    if (val && val.trim() != '') {
      this.items = this.shopDirectory.filter(item => {
        return item.company.toLowerCase().indexOf(val.toLowerCase()) > -1;
      });
    } else this.items = this.shopDirectory;
  }

  ionViewDidLoad() {}
  clearSearch() {
    this.selectedCat = 'all';
  }
}
