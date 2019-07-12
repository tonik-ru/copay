import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { Logger } from '../../providers/logger/logger';
import { ShopTargetPage } from './shop-target/shop-target';

// import * as _ from 'lodash';
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
  private shopDirectory: any;
  public cats = [];
  public items = [];

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
  }

  ionViewDidLoad() {}

  openCategory(id: string, title: string) {
    this.navCtrl.push(ShopTargetPage, { shop: id, logo: title });
  }
}
