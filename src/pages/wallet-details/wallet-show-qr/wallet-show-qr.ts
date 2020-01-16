import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {  Events, NavController, NavParams, Platform, ViewController} from 'ionic-angular';
import { Observable, Subscription } from 'rxjs';
import { Logger } from '../../../providers/logger/logger';

// Providers
import { ActionSheetProvider } from '../../../providers/action-sheet/action-sheet';
import { BwcErrorProvider } from '../../../providers/bwc-error/bwc-error';
import { ExternalLinkProvider } from '../../../providers/external-link/external-link';
import { PlatformProvider } from '../../../providers/platform/platform';
import { WalletProvider } from '../../../providers/wallet/wallet';

import * as _ from 'lodash';


// Pages
import { BackupKeyPage } from '../../backup/backup-key/backup-key';

/**
 * Generated class for the WalletShowQrPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-wallet-show-qr',
  templateUrl: 'wallet-show-qr.html',
})
export class WalletShowQrPage {
  public protocolHandler: string;
  public address: string;
  public qrAddress: string;
  public wallet;
  public showShareButton: boolean;
  public loading: boolean;
  public playAnimation: boolean;
  public newAddressError: boolean;
  public specAmount: string;
  public showSpecInfo: boolean = false;
  public mainAddress: string;

  private onResumeSubscription: Subscription;
  private retryCount: number = 0;


  constructor(
    // public navCtrl: NavController, public navParams: NavParams,  private logger: Logger
    private actionSheetProvider: ActionSheetProvider, 
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    private logger: Logger,
    
    private walletProvider: WalletProvider,
    private platformProvider: PlatformProvider,
    private events: Events,
    private translate: TranslateService,
    private bwcErrorProvider: BwcErrorProvider,
    
    private externalLinkProvider: ExternalLinkProvider,
  
    private platform: Platform
    
    ) {
     // super(navCtrl, profileProvider, walletTabsProvider);
      this.showShareButton = this.platformProvider.isCordova;
      this.wallet = this.navParams.data.wallet;
  }

  ionViewWillEnter() {
    this.onResumeSubscription = this.platform.resume.subscribe(() => {
      this.setAddress();
      this.events.subscribe('bwsEvent', this.bwsEventHandler);
    });
    this.setAddress();
  }

  ionViewWillLeave() {
    this.onResumeSubscription.unsubscribe();
  }

  ionViewDidLoad() {
    this.events.subscribe('bwsEvent', this.bwsEventHandler);
  }

  private bwsEventHandler: any = (walletId, type, n) => {
    if (
      this.wallet.credentials.walletId == walletId &&
      type == 'NewIncomingTx' &&
      n.data
    ) {
      let addr =
        this.address.indexOf(':') > -1
          ? this.address.split(':')[1]
          : this.address;
      if (n.data.address == addr) this.setAddress(true);
    }
  };

 

  public async setAddress(newAddr?: boolean, failed?: boolean): Promise<void> {
    if (
      !this.wallet ||
      !this.wallet.isComplete() ||
      (this.wallet.needsBackup && this.wallet.network == 'livenet')
    )
      return;

    this.loading = newAddr || _.isEmpty(this.address) ? true : false;

    this.walletProvider
      .getAddress(this.wallet, newAddr)
      .then(addr => {
        this.newAddressError = false;
        this.loading = false;
        if (!addr) return;
        const address = this.walletProvider.getAddressView(
          this.wallet.coin,
          this.wallet.network,
          addr
        );
        this.mainAddress = address;
        if (this.address && this.address != address) {
          this.playAnimation = true;
        }
        this.updateQrAddress(address, newAddr);
      })
      .catch(err => {
        this.logger.warn('Retrying to create new adress:' + ++this.retryCount);
        if (this.retryCount > 3) {
          this.retryCount = 0;
          this.loading = false;
          this.showErrorInfoSheet(err);
        } else if (err == 'INVALID_ADDRESS') {
          // Generate new address if the first one is invalid ( fix for concatenated addresses )
          if (!failed) {
            this.setAddress(newAddr, true);
            this.logger.warn(this.bwcErrorProvider.msg(err, 'Receive'));
            return;
          }
          this.setAddress(false); // failed to generate new address -> get last saved address
        } else {
          this.setAddress(false); // failed to generate new address -> get last saved address
        }
        this.logger.warn(this.bwcErrorProvider.msg(err, 'Receive'));
      });
  }

  public showErrorInfoSheet(error: Error | string): void {
    this.newAddressError = true;
    const infoSheetTitle = 'Error';
    const errorInfoSheet = this.actionSheetProvider.createInfoSheet(
      'default-error',
      { msg: this.bwcErrorProvider.msg(error), title: infoSheetTitle }
    );
    errorInfoSheet.present();
  }

  private async updateQrAddress(address, newAddr?: boolean): Promise<void> {
    if (newAddr) {
      await Observable.timer(400).toPromise();
    }
    this.address = address;
    await Observable.timer(200).toPromise();
    this.playAnimation = false;
    this.qrAddress = address;
  }

 
  public goToBackup(): void {
    this.navCtrl.push(BackupKeyPage, {
      keyId: this.wallet.credentials.keyId
    });
  }

  public openWikiBackupNeeded(): void {
    const url =
      'https://support.bitpay.com/hc/en-us/articles/115002989283-Why-don-t-I-have-an-online-account-for-my-BitPay-wallet-';
    const optIn = true;
    const title = null;
    const message = this.translate.instant('Read more in our Wiki');
    const okText = this.translate.instant('Open');
    const cancelText = this.translate.instant('Go Back');
    this.externalLinkProvider.open(
      url,
      optIn,
      title,
      message,
      okText,
      cancelText
    );
  }

 
  public showFullAddr(): void {
    // let data = document
    //  .getElementsByTagName('ngx-qrcode')[0]
    //  .children[0].children[0].getAttribute('src');
    // let p1 = data.indexOf(',');
    // let binData = atob(data.substr(p1 + 1));
    let addrs = this.qrAddress !== '' ? this.qrAddress : this.address;
    const infoSheet = this.actionSheetProvider.createInfoSheet(
      'address-copied',
      { address: addrs, coin: this.wallet.coin }
    );
    infoSheet.present();
  }

  processInput() {
    this.logger.log('spec:', this.specAmount);
    // this.address = '';
    if (parseFloat(this.specAmount) > 0 && this.specAmount !== '') {
      this.logger.log('adrs', this.mainAddress);
      this.showSpecInfo = true;
      let protoAddr;
      if (this.wallet.coin != 'bch') {
        protoAddr = this.walletProvider.getProtoAddress(
          this.wallet.coin,
          this.wallet.network,
          this.mainAddress
        );
      }
     // this.address =
      //  (protoAddr ? protoAddr : this.mainAddress) +
     //   '?amount=' +
     //   Number(this.specAmount);
      this.qrAddress =
        (protoAddr ? protoAddr : this.mainAddress) +
        '?amount=' +
        Number(this.specAmount);
    } else {
      this.showSpecInfo = false;
      this.address = this.mainAddress;
      this.qrAddress = this.mainAddress;
    }
    if (parseFloat(this.specAmount) < 0) {
      this.specAmount = Math.abs(parseFloat(this.specAmount)).toString();
      this.processInput();
    }
  }
  public close(){
    this.viewCtrl.dismiss();
  }
}

