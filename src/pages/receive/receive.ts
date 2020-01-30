import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Events, NavController, Platform } from 'ionic-angular';
import { Observable, Subscription } from 'rxjs';
import { Logger } from '../../providers/logger/logger';

// Native
import { SocialSharing } from '@ionic-native/social-sharing';

// Pages
import { BackupKeyPage } from '../backup/backup-key/backup-key';
import { AmountPage } from '../send/amount/amount';

// Providers
import { ActionSheetProvider } from '../../providers/action-sheet/action-sheet';
import { BwcErrorProvider } from '../../providers/bwc-error/bwc-error';
import { ExternalLinkProvider } from '../../providers/external-link/external-link';
import { PlatformProvider } from '../../providers/platform/platform';
import { ProfileProvider } from '../../providers/profile/profile';
import { Coin, WalletProvider } from '../../providers/wallet/wallet';

import * as _ from 'lodash';
import { WalletTabsChild } from '../wallet-tabs/wallet-tabs-child';
import { WalletTabsProvider } from '../wallet-tabs/wallet-tabs.provider';

import { CoinOpts, Config, ConfigProvider } from '../../providers/config/config';
import { RateProvider } from '../../providers/rate/rate';
import { TxFormatProvider } from '../../providers/tx-format/tx-format';
 

@Component({
  selector: 'page-receive',
  templateUrl: 'receive.html'
})
export class ReceivePage extends WalletTabsChild {
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
  public coinAmount:string;
  public alternativeUnit: string;
  private availableUnits;
  private altUnitIndex: number;
  public fiatCode: string;
  public config: Config;
  public unit: string;
  public unitIndex: number;
  private unitToSatoshi: number;
  private satToUnit: number;
  private unitDecimals: number;
  public coinOpts: CoinOpts;
  public amountUnitStr:string;
  public altAmountStr:string;
  constructor(
    private actionSheetProvider: ActionSheetProvider,
    navCtrl: NavController,
    private logger: Logger,
    profileProvider: ProfileProvider,
    private walletProvider: WalletProvider,
    private platformProvider: PlatformProvider,
    private events: Events,
    private socialSharing: SocialSharing,
    private bwcErrorProvider: BwcErrorProvider,
    private translate: TranslateService,
    private externalLinkProvider: ExternalLinkProvider,
    walletTabsProvider: WalletTabsProvider,
    private platform: Platform,
    private configProvider: ConfigProvider,
    private rateProvider: RateProvider,
    private txFormatProvider: TxFormatProvider
  ) {
    super(navCtrl, profileProvider, walletTabsProvider);
    this.showShareButton = this.platformProvider.isCordova;
    this.config = this.configProvider.get();
    this.coinOpts = this.configProvider.getCoinOpts();
  }

  ionViewWillEnter() {
    this.onResumeSubscription = this.platform.resume.subscribe(() => {
      this.setAddress();
      this.events.subscribe('bwsEvent', this.bwsEventHandler);
    });
    this.setAddress();
    // this.coinAmount = this.unit;
    this.availableUnits = [];
     
   
    
  }

  ionViewWillLeave() {
    this.onResumeSubscription.unsubscribe();
  }

  ionViewDidLoad() {
    this.events.subscribe('bwsEvent', this.bwsEventHandler);
    this.setAvailableUnits();
    this.updateUnitUI();
    const coinOpts = this.availableUnits[this.unitIndex].isFiat
      ? this.coinOpts[this.availableUnits[this.altUnitIndex].id]
      : this.coinOpts[this.unit.toLowerCase()];
    const { unitToSatoshi, unitDecimals } = coinOpts;
    this.unitToSatoshi = unitToSatoshi;
    this.satToUnit = 1 / this.unitToSatoshi;
    this.unitDecimals = unitDecimals;

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

  public requestSpecificAmount(): void {
    this.navCtrl.push(AmountPage, {
      toAddress: this.address,
      id: this.wallet.credentials.walletId,
      recipientType: 'wallet',
      name: this.wallet.name,
      color: this.wallet.color,
      coin: this.wallet.coin,
      nextPage: 'CustomAmountPage',
      network: this.wallet.network
    });
  }

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
    const infoSheetTitle = this.translate.instant('Error');
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

  public shareAddress(): void {
    if (!this.showShareButton) return;
    this.socialSharing.share(this.address);
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

  public showMoreOptions(): void {
    const showShare =
      this.showShareButton &&
      this.wallet &&
      this.wallet.isComplete() &&
      !this.wallet.needsBackup;
    const optionsSheet = this.actionSheetProvider.createOptionsSheet(
      'address-options',
      { showShare }
    );
    optionsSheet.present();

    optionsSheet.onDidDismiss(option => {
      if (option == 'request-amount') this.requestSpecificAmount();
      if (option == 'share-address') this.shareAddress();
    });
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
   let amount = this.wallet.coin == 'eth' ? '?value=' : '?amount=';
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
     // this.logger.log('->', this.coinAmount, this.specAmount, this.chanageRate,  this.mainAddress);
     if (this.coinAmount !== this.wallet.coin.toUpperCase()){

      // this.qrAddress= (protoAddr ? protoAddr : this.mainAddress) + 
      // '?amount=' + (Number(this.specAmount) /  this.chanageRate) ;
      let a = this.fromFiat(this.specAmount);
      this.logger.log('A->',a, this.unitToSatoshi);
      if (a) {
        var fiat = this.txFormatProvider.formatAmount(
            this.wallet.coin,
            a * this.unitToSatoshi,
            true
          );
          var tst = this.txFormatProvider.parseAmount(
            this.wallet.coin,
            fiat,
            this.wallet.coin.toUpperCase()
          );

        this.qrAddress = (protoAddr ? protoAddr : this.mainAddress) +
        amount + ((isNaN(tst.amountSat) || this.wallet.coin !== 'eth') ? fiat : tst.amountSat);
        
        this.logger.log('show:', this.unitToSatoshi, a, tst);
        // show price in CRYPTO after price on qr 
        this.amountUnitStr= this.specAmount + this.coinAmount;
        this.altAmountStr = fiat + this.wallet.coin;

       // this.checkAmountForBitpaycard(this.specAmount);
      } else {
        this.qrAddress = (protoAddr ? protoAddr : this.mainAddress) +amount+ this.specAmount ? 'N/A' : null;
       //  this.allowSend = false;
      }

     } else{
      this.qrAddress =
        (protoAddr ? protoAddr : this.mainAddress) +
        amount +
        Number(this.specAmount);
        var fiat_ = this.toFiat(Number(this.specAmount));
        this.logger.log('FIAT',fiat_);
        this.amountUnitStr= this.specAmount + this.coinAmount;
        this.altAmountStr = fiat_ + this.alternativeUnit;
      }
    } else {
      this.showSpecInfo = false;
      this.address = this.mainAddress;
      this.qrAddress = this.mainAddress;
      this.altAmountStr = '';
      this.amountUnitStr='';
    }
    if (parseFloat(this.specAmount) < 0) {
      this.specAmount = Math.abs(parseFloat(this.specAmount)).toString();
      this.processInput();
    }
  }

  private setAvailableUnits(): void {
    this.availableUnits = [];

    const parentWalletCoin = this.wallet
      ? this.wallet.coin
      : this.wallet && this.wallet.coin;

    if (parentWalletCoin === 'btc' || !parentWalletCoin) {
      this.availableUnits.push({
        name: 'Bitcoin',
        id: 'btc',
        shortName: 'BTC'
      });
    }

    if (parentWalletCoin === 'bch' || !parentWalletCoin) {
      this.availableUnits.push({
        name: 'Bitcoin Cash',
        id: 'bch',
        shortName: 'BCH'
      });
    }

    if (parentWalletCoin === 'bcd' || !parentWalletCoin) {
      this.availableUnits.push({
        name: 'Bitcoin Diamond',
        id: 'bcd',
        shortName: 'BCD'
      });
    }

    if (parentWalletCoin === 'eth' || !parentWalletCoin) {
      this.availableUnits.push({
        name: 'Ethereum',
        id: 'eth',
        shortName: 'ETH'
      });
    }

    this.unitIndex = 0;
   // var unitIndex = 0;

    if (this.wallet.coin) {
       

      let coins = this.wallet.coin.split(',');
      let newAvailableUnits = [];

      _.each(coins, (c: string) => {
        let coin = _.find(this.availableUnits, {
          id: c
        });
        if (!coin) {
          this.logger.warn(
            'Could not find desired coin:' + this.wallet.coin
          );
        } else {
          newAvailableUnits.push(coin);
        }
      });

      if (newAvailableUnits.length > 0) {
        this.availableUnits = newAvailableUnits;
      }
    }
 //  currency have preference
 this.logger.log('Wallet',this.wallet);
 let fiatName;
 if (this.wallet.currency !== undefined || this.wallet.currency) {
   this.fiatCode = this.wallet.data.currency;
   this.altUnitIndex = this.unitIndex;
   this.unitIndex = this.availableUnits.length;
 } else {
   this.fiatCode = this.config.wallet.settings.alternativeIsoCode || 'USD';
   fiatName = this.config.wallet.settings.alternativeName || this.fiatCode;
   this.altUnitIndex = this.availableUnits.length;
 }

 this.availableUnits.push({
   name: fiatName || this.fiatCode,
   // TODO
   id: this.fiatCode,
   shortName: this.fiatCode,
   isFiat: true
 });

//  if (this.wallet.fixedUnit) {
//    this.fixedUnit = true;
//  }
}
private updateUnitUI(): void {
  this.unit = this.availableUnits[this.unitIndex].shortName;
  this.alternativeUnit = this.availableUnits[this.altUnitIndex].shortName;
  this.coinAmount = this.unit;
}
public changeUnit(ev){
  this.specAmount = '';
  this.amountUnitStr= '';
        this.altAmountStr ='';
        this.qrAddress = this.mainAddress;
 this.logger.log('changed', ev);
}

private fromFiat(val, coin?: string): number {
  coin = coin || this.wallet.coin;
  return parseFloat(
    (
      this.rateProvider.fromFiat(val, this.fiatCode, coin) * this.satToUnit
    ).toFixed(this.unitDecimals)
  );
}

public toFiat(val: number, coin?: Coin): number {
  if (
    !this.rateProvider.getRate(
      this.fiatCode,
      coin || this.wallet.coin
    )
  )
    return undefined;

  return parseFloat(
    this.rateProvider
      .toFiat(
        val * this.unitToSatoshi,
        this.fiatCode,
        coin || this.wallet.coin
      )
      .toFixed(2)
  );
}
public clearAmount(){
  this.specAmount = '';
  this.amountUnitStr= '';
        this.altAmountStr ='';
        this.qrAddress = this.mainAddress;
}

}
