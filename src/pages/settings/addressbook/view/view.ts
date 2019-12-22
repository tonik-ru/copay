import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NavController, NavParams } from 'ionic-angular';

// Pages
import { AmountPage } from '../../../../pages/send/amount/amount';

// Providers
import { AddressBookProvider } from '../../../../providers/address-book/address-book';
import { AddressProvider } from '../../../../providers/address/address';
import { PopupProvider } from '../../../../providers/popup/popup';

import { Logger } from '../../../../providers/logger/logger';
@Component({
  selector: 'page-addressbook-view',
  templateUrl: 'view.html'
})
export class AddressbookViewPage {
  public contact;
  public address: string;
  public coin: string;
  public email: string;
  public name: string;
  public network: string;
  public photo: string;
  constructor(
    private addressBookProvider: AddressBookProvider,
    private addressProvider: AddressProvider,
    private navCtrl: NavController,
    private navParams: NavParams,
    private popupProvider: PopupProvider,
    private translate: TranslateService,
    public logger: Logger,    
  ) {
    this.address = this.navParams.data.contact.address;
    const addrData = this.addressProvider.getCoinAndNetwork(this.address);
    // this.coin = addrData.coin;
    this.coin = this.address.includes('bitcoindiamond') ? 'bcd' : this.address.includes('bitcoin') ? "btc":  this.address.includes('bitcoincash') ? "bch" :  this.address.includes('eth') ? "eth" : addrData.coin;
    this.network = addrData.network;
    this.name = this.navParams.data.contact.name;
    this.email = this.navParams.data.contact.email;
    this.photo = ((this.navParams.data.contact.photo !== null) && (this.navParams.data.contact.photo !== undefined)) ? this.navParams.data.contact.photo : 'assets/img/contact-placeholder-add.svg';
    this.logger.log('coin:', this.coin);
    this.logger.log('address:', this.address);
  }

  ionViewDidLoad() {}

  public sendTo(): void {
    this.navCtrl.push(AmountPage, {
      toAddress: this.addressProvider.extractAddress(this.address),
      name: this.name,
      email: this.email,
      coin: this.coin,
      recipientType: 'contact',
      network: this.network,
      showBalance: false
    });
  }

  public remove(addr: string): void {
    const title = this.translate.instant('Warning!');
    const message = this.translate.instant(
      'Are you sure you want to delete this contact?'
    );
    this.popupProvider.ionicConfirm(title, message, null, null).then(res => {
      if (!res) return;
      this.addressBookProvider
        .remove(addr)
        .then(() => {
          this.navCtrl.pop();
        })
        .catch(err => {
          this.popupProvider.ionicAlert(this.translate.instant('Error'), err);
          return;
        });
    });
  }
}
