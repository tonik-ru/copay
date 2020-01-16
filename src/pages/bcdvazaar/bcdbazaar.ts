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

import { BrowserTab } from '@ionic-native/browser-tab';
import { ExternalLinkProvider } from '../../providers/external-link/external-link';

import { SafariViewController } from '@ionic-native/safari-view-controller';


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
    public plt: Platform,
    private browserTab: BrowserTab,
    private safariViewController: SafariViewController,
    private externalLinkProvider: ExternalLinkProvider,
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
      this.useSafariTab(url);
      this.logger.log('ios');
    } else if (this.plt.is('android')) {
      // let target = '_system';
      // this.iab.create(url, target, this.options);
      // this.logger.log('android');
      this.useBrowserTab(url);
    } else {
     // this.selectShop(url, '');
     this.externalLinkProvider.openBrowser(true, url);
      this.logger.log('windows');
    }
  }

  openCategory(id: string, title: string) {
    this.categorySelected = !this.categorySelected;
    this.catid = id;
    title !== 'exit' ? (this.Title = title) : (this.Title = 'Shopping');
  }

  useBrowserTab(site: string) {
    this.browserTab.isAvailable().then(isAvailable => {
      if (isAvailable) {
        this.browserTab.openUrl(site);
      } else {
        // open URL with InAppBrowser instead or SafariViewController
        this.logger.log('Failed open browserTab');
      }
    });
  }

  useSafariTab(myurl: string) {
    this.safariViewController.isAvailable().then((available: boolean) => {
      if (available) {
        this.safariViewController
          .show({
            url: myurl,
            hidden: false,
            animated: false,
            transition: 'curl',
            enterReaderModeIfAvailable: true,
            tintColor: '#ff0000'
          })
          .toPromise()
          .then(
            (result: any) => {
              if (result.event === 'opened') this.logger.log('Opened');
              else if (result.event === 'loaded') this.logger.log('Loaded');
              else if (result.event === 'closed') this.logger.log('Closed');
            },
            (error: any) => this.logger.error(error)
          );
      } else {
        let target = '_system';
        this.iab.create(myurl, target, this.options);
        this.logger.log('ios not safari');
      }
    });
  }
}
