import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { Logger, ShopsProvider } from '../../../providers';

import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import {
  InAppBrowser,
  InAppBrowserOptions
} from '@ionic-native/in-app-browser';

/**
 * Generated class for the ShopTargetPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-shop-target',
  templateUrl: 'shop-target.html'
})
export class ShopTargetPage {
  public shop: SafeResourceUrl;
  public url: string = '';
  public logo: string = '';
  public filter: string;
  public items = [];
  private shopDirectory: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public logger: Logger,
    public sanitizer: DomSanitizer,
    private shopsProvider: ShopsProvider,
    private iab: InAppBrowser
  ) {
    this.url = navParams.get('shop');
    this.logo = navParams.get('lg');
    this.shop;
    this.logo;
  }

  ionViewDidLoad() {}

  ngOnInit() {
    this.url = this.navParams.get('shop');
    this.logo = this.navParams.get('logo');
    this.logger.log('SHOP:', this.navParams.get('shop'));
    this.logger.log('LG:', this.navParams.get('logo'));
    this.shop = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
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
    this.items = this.shopDirectory.Stores;
  }

  public applyFilter() {
    // var searchCategory = (this.selectedCat || '').toLowerCase();
    var searchStr = (this.filter || '').toLowerCase();

    this.items = this.shopDirectory.Stores.filter(item => {
      return (
        item.company.toLowerCase().indexOf(searchStr) > -1 ||
        item.desc.toLowerCase().indexOf(searchStr) > -1 ||
        searchStr == ''
      );
    });
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
