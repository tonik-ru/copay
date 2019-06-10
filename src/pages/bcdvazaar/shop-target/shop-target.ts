import { Component  } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { Logger } from '../../../providers';

import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

/**
 * Generated class for the ShopTargetPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-shop-target',
  templateUrl: 'shop-target.html',
})
export class ShopTargetPage {
private shop: SafeResourceUrl;
private url: string = '';
private logo: string = '';
  constructor(public navCtrl: NavController, public navParams: NavParams, public logger: Logger, public sanitizer:DomSanitizer) {
    
    this.url = navParams.get('shop');
    this.logo = navParams.get('logo');
    this.shop;
    this.logo;

  }

  ionViewDidLoad() {
    
  }

  ngOnInit() {
    this.shop = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);      
}

}
