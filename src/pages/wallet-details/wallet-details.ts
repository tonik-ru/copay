import { Component, NgZone } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  Events,
  ModalController,
  NavController,
  NavParams,
  Platform
} from 'ionic-angular';
import * as _ from 'lodash';
import { Observable, Subscription } from 'rxjs';

// providers
import { AddressBookProvider } from '../../providers/address-book/address-book';
import { CurrencyProvider } from '../../providers/currency/currency';
import { ExternalLinkProvider } from '../../providers/external-link/external-link';
import { GiftCardProvider } from '../../providers/gift-card/gift-card';
import { CardConfigMap } from '../../providers/gift-card/gift-card.types';
import { ActionSheetProvider } from '../../providers/index';
import { Logger } from '../../providers/logger/logger';
import { OnGoingProcessProvider } from '../../providers/on-going-process/on-going-process';
import { ProfileProvider } from '../../providers/profile/profile';
import { TimeProvider } from '../../providers/time/time';
import { WalletProvider } from '../../providers/wallet/wallet';

// pages
import { BackupKeyPage } from '../../pages/backup/backup-key/backup-key';
import { ProposalsPage } from '../../pages/home/proposals/proposals';
import { WalletAddressesPage } from '../../pages/settings/wallet-settings/wallet-settings-advanced/wallet-addresses/wallet-addresses';
import { TxDetailsPage } from '../../pages/tx-details/tx-details';
import { WalletTabsChild } from '../wallet-tabs/wallet-tabs-child';
import { WalletTabsProvider } from '../wallet-tabs/wallet-tabs.provider';
import { SearchTxModalPage } from './search-tx-modal/search-tx-modal';
import { WalletBalancePage } from './wallet-balance/wallet-balance';

import { DatafeedPage } from '../trader/datafeed/datafeed';

const HISTORY_SHOW_LIMIT = 10;
const MIN_UPDATE_TIME = 2000;
const TIMEOUT_FOR_REFRESHER = 1000;

@Component({
  selector: 'page-wallet-details',
  templateUrl: 'wallet-details.html'
})
export class WalletDetailsPage extends WalletTabsChild {
  private currentPage: number = 0;
  private showBackupNeededMsg: boolean = true;
  private onResumeSubscription: Subscription;
  private analyzeUtxosDone: boolean;
  private zone;

  public hiddenBalance: boolean;

  public requiresMultipleSignatures: boolean;
  public wallet;
  public history = [];
  public groupedHistory = [];
  public walletNotRegistered: boolean;
  public updateError: boolean;
  public updateStatusError;
  public updatingStatus: boolean;
  public updatingTxHistory: boolean;
  public updateTxHistoryError: boolean;
  public updatingTxHistoryProgress: number = 0;
  public showNoTransactionsYetMsg: boolean;
  public showBalanceButton: boolean = false;
  public addressbook = {};
  public txps = [];
  public txpsPending: any[];
  public lowUtxosWarning: boolean;
  public associatedWallet: string;

  public qrAddress: string;
  public address: string;

  public supportedCards: Promise<CardConfigMap>;
  public loading: boolean;

  constructor(
    private currencyProvider: CurrencyProvider,
    navCtrl: NavController,
    private navParams: NavParams,
    profileProvider: ProfileProvider,
    private walletProvider: WalletProvider,
    private addressbookProvider: AddressBookProvider,
    private events: Events,
    public giftCardProvider: GiftCardProvider,
    private logger: Logger,
    private timeProvider: TimeProvider,
    private translate: TranslateService,
    private modalCtrl: ModalController,
    private onGoingProcessProvider: OnGoingProcessProvider,
    private externalLinkProvider: ExternalLinkProvider,
    walletTabsProvider: WalletTabsProvider,
    private actionSheetProvider: ActionSheetProvider,
    private platform: Platform
  ) {
    super(navCtrl, profileProvider, walletTabsProvider);
    this.zone = new NgZone({ enableLongStackTrace: false });
  }

  ionViewDidLoad() {
    // Getting info from cache
    if (this.navParams.data.clearCache) {
      this.clearHistoryCache();
    } else {
      this.wallet.status = this.wallet.cachedStatus || {};
      if (this.wallet.completeHistory) this.showHistory();
    }

    this.hiddenBalance = this.wallet.balanceHidden;

    this.requiresMultipleSignatures = this.wallet.credentials.m > 1;
    this.supportedCards = this.giftCardProvider.getSupportedCardMap();

    this.addressbookProvider
      .list()
      .then(ab => {
        this.addressbook = ab;
      })
      .catch(err => {
        this.logger.error(err);
      });
  }

  private async updateQrAddress(address, newAddr?: boolean): Promise<void> {
    if (newAddr) {
      await Observable.timer(400).toPromise();
    }
    this.address = address;
    await Observable.timer(200).toPromise();
    // this.playAnimation = false;
  }

  public async setAddress(newAddr?: boolean, failed?: boolean): Promise<void> {
    this.loading = newAddr || _.isEmpty(this.address) ? true : false;

    const addr: string = (await this.walletProvider
      .getAddress(this.wallet, newAddr)
      .catch(err => {
        this.loading = false;
        if (err == 'INVALID_ADDRESS') {
          // Generate a new address if the first one is invalid
          if (!failed) {
            this.setAddress(newAddr, true);
          }
          return;
        }
      })) as string;
    this.loading = false;
    if (!addr) return;
    const address = this.walletProvider.getAddressView(
      this.wallet.coin,
      this.wallet.network,
      addr
    );

    if (this.address && this.address != address) {
      //  this.playAnimation = true;
    }
    this.updateQrAddress(addr, newAddr);

    this.qrAddress = this.walletProvider.getAddressView(
      this.wallet.coin,
      this.wallet.network,
      addr
    );
  }

  // private walletSetAddressHandler: any = (newAddr?: boolean) => {
  //   this.setAddress(newAddr);
  // };

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

    const infoSheet = this.actionSheetProvider.createInfoSheet(
      'address-copied',
      { address: this.address, coin: this.wallet.coin }
    );
    infoSheet.present();
  }

  subscribeEvents() {
    this.events.subscribe('Local/WalletUpdate', this.updateStatus);
    this.events.subscribe('Local/WalletHistoryUpdate', this.updateHistory);
  }

  // Event handling
  ionViewWillLoad() {
    this.subscribeEvents();
  }

  ionViewWillEnter() {
    this.onResumeSubscription = this.platform.resume.subscribe(() => {
      this.profileProvider.setFastRefresh(this.wallet);
      this.setAddress();
      this.subscribeEvents();
    });
    this.setAddress();
    this.logger.log('coin',this.wallet.coin);
  }

  // Start by firing a walletFocus event.
  ionViewDidEnter() {
    this.profileProvider.setFastRefresh(this.wallet);
    this.events.publish('Local/WalletFocus', {
      walletId: this.wallet.credentials.walletId
    });
  }

  ionViewWillUnload() {
    this.profileProvider.setSlowRefresh(this.wallet);
    this.events.unsubscribe('Local/WalletUpdate', this.updateStatus);
    this.events.unsubscribe('Local/WalletHistoryUpdate', this.updateHistory);
    this.onResumeSubscription.unsubscribe();
  }

  shouldShowZeroState() {
    return this.showNoTransactionsYetMsg && !this.updateStatusError;
  }

  shouldShowSpinner() {
    return (
      (this.updatingStatus || this.updatingTxHistory) &&
      !this.walletNotRegistered &&
      !this.updateStatusError &&
      !this.updateTxHistoryError
    );
  }

  public isUtxoCoin(): boolean {
    return this.currencyProvider.isUtxoCoin(this.wallet.coin);
  }

  private clearHistoryCache() {
    this.history = [];
    this.currentPage = 0;
  }

  private groupHistory(history) {
    return history.reduce((groups, tx, txInd) => {
      this.isFirstInGroup(txInd)
        ? groups.push([tx])
        : groups[groups.length - 1].push(tx);
      return groups;
    }, []);
  }

  private showHistory(loading?: boolean) {
    if (!this.wallet.completeHistory) return;

    this.history = this.wallet.completeHistory.slice(
      0,
      (this.currentPage + 1) * HISTORY_SHOW_LIMIT
    );
    this.zone.run(() => {
      this.groupedHistory = this.groupHistory(this.history);
    });
    if (loading) this.currentPage++;
  }

  private setPendingTxps(txps) {
    this.txps = !txps ? [] : _.sortBy(txps, 'createdOn').reverse();
    this.txpsPending = [];

    this.txps.forEach(txp => {
      const action = _.find(txp.actions, {
        copayerId: txp.wallet.copayerId
      });

      if (!action && txp.status == 'pending') {
        this.txpsPending.push(txp);
      }

      // For unsent transactions
      if (action && txp.status == 'accepted') {
        this.txpsPending.push(txp);
      }
    });
  }

  public openProposalsPage(): void {
    this.navCtrl.push(ProposalsPage, { walletId: this.wallet.id });
  }

  private updateAll = _.debounce(
    (opts?) => {
      opts = opts || {};
      this.events.publish('Local/WalletFocus', {
        walletId: this.wallet.credentials.walletId,
        force: true
      });
    },
    MIN_UPDATE_TIME,
    {
      leading: true
    }
  );

  public toggleBalance() {
    this.profileProvider.toggleHideBalanceFlag(
      this.wallet.credentials.walletId
    );
  }

  public hiddenBalanceChange(): void {
    this.profileProvider.toggleHideBalanceFlag(
      this.wallet.credentials.walletId
    );
  }

  public loadHistory(loading) {
    if (
      this.history &&
      this.wallet.completeHistory &&
      this.history.length === this.wallet.completeHistory.length
    ) {
      loading.complete();
      return;
    }
    setTimeout(() => {
      this.showHistory(true); // loading in true
      loading.complete();
    }, 300);
  }

  private analyzeUtxos(): void {
    if (this.analyzeUtxosDone) return;

    this.walletProvider
      .getLowUtxos(this.wallet)
      .then(resp => {
        if (!resp) return;
        this.analyzeUtxosDone = true;
        this.lowUtxosWarning = !!resp.warning;
        // this.logger.debug('Low UTXOs warning: ', this.lowUtxosWarning);
      })
      .catch(err => {
        this.logger.warn('Analyze UTXOs: ', err);
      });
  }

  // no network //
  private updateHistory = opts => {
    this.logger.debug('RECV Local/WalletHistoryUpdate @walletDetails', opts);
    if (opts.walletId != this.wallet.id) return;

    if (opts.finished) {
      this.updatingTxHistoryProgress = 0;
      this.updatingTxHistory = false;
      this.updateTxHistoryError = false;

      const hasTx = !!this.wallet.completeHistory[0];

      this.showNoTransactionsYetMsg = !hasTx;

      if (this.wallet.needsBackup && hasTx && this.showBackupNeededMsg)
        this.openBackupModal();

      this.showHistory();
    } else {
      if (opts.error) {
        this.updatingTxHistory = false;
        this.updateTxHistoryError = true;

        // show what we have.
        this.showHistory();
      } else {
        this.updatingTxHistory = true;
        this.updatingTxHistoryProgress = opts.progress;
        this.updateTxHistoryError = false;

        // show what we have
        this.showHistory();

        // Hide prev history if long downlad is happending...
        //  if (opts.progress > 5) {
        //  this.history = null;
        //  }
      }
    }
  };

  // no network //
  private updateStatus = opts => {
    if (opts.walletId != this.wallet.id) return;
    this.logger.debug('RECV Local/WalletUpdate @walletDetails', opts);

    if (!opts.finished) {
      this.updatingStatus = true;
      return;
    }

    this.updatingStatus = false;

    if (!this.wallet.error) {
      this.logger.debug(
        ' Updating wallet with amount ',
        this.wallet.cachedStatus.balance.totalAmount
      );
      let status = this.wallet.cachedStatus;
      this.setPendingTxps(status.pendingTxps);
      this.showBalanceButton = status.totalBalanceSat != status.spendableAmount;

      if (this.isUtxoCoin()) {
        this.analyzeUtxos();
      }

      this.updateStatusError = null;
      this.walletNotRegistered = false;
    } else {
      this.showBalanceButton = false;

      let err = this.wallet.errorObj;
      if (err.name && err.name.match(/WALLET_NOT_FOUND/)) {
        this.walletNotRegistered = true;
      }
      if (err === 'WALLET_NOT_REGISTERED') {
        this.walletNotRegistered = true;
      } else {
        this.updateStatusError = this.wallet.errorObj;
      }
    }
  };

  public recreate() {
    this.onGoingProcessProvider.set('recreating');
    this.walletProvider
      .recreate(this.wallet)
      .then(() => {
        this.onGoingProcessProvider.clear();
        setTimeout(() => {
          this.walletProvider.startScan(this.wallet).then(() => {
            this.updateAll({ force: true });
          });
        });
      })
      .catch(err => {
        this.onGoingProcessProvider.clear();
        this.logger.error(err);
      });
  }

  public goToTxDetails(tx) {
    this.navCtrl.push(TxDetailsPage, {
      walletId: this.wallet.credentials.walletId,
      txid: tx.txid
    });
  }

  public openBackupModal(): void {
    this.showBackupNeededMsg = false;
    const infoSheet = this.actionSheetProvider.createInfoSheet(
      'backup-needed-with-activity'
    );
    infoSheet.present();
    infoSheet.onDidDismiss(option => {
      if (option) this.openBackup();
    });
  }

  public openBackup() {
    this.navCtrl.push(BackupKeyPage, {
      keyId: this.wallet.credentials.keyId
    });
  }

  public openAddresses() {
    this.navCtrl.push(WalletAddressesPage, {
      walletId: this.wallet.credentials.walletId
    });
  }

  public getDate(txCreated) {
    const date = new Date(txCreated * 1000);
    return date;
  }

  public trackByFn(index) {
    return index;
  }

  public isFirstInGroup(index) {
    if (index === 0) {
      return true;
    }
    const curTx = this.history[index];
    const prevTx = this.history[index - 1];
    return !this.createdDuringSameMonth(curTx, prevTx);
  }

  private createdDuringSameMonth(curTx, prevTx) {
    return this.timeProvider.withinSameMonth(
      curTx.time * 1000,
      prevTx.time * 1000
    );
  }

  public isDateInCurrentMonth(date) {
    return this.timeProvider.isDateInCurrentMonth(date);
  }

  public createdWithinPastDay(time) {
    return this.timeProvider.withinPastDay(time);
  }

  public isUnconfirmed(tx) {
    return !tx.confirmations || tx.confirmations === 0;
  }

  public openBalanceDetails(): void {
    this.navCtrl.push(WalletBalancePage, {
      status: this.wallet.cachedStatus
    });
  }

  public back(): void {
    this.navCtrl.pop();
  }

  public openSearchModal(): void {
    const modal = this.modalCtrl.create(
      SearchTxModalPage,
      {
        addressbook: this.addressbook,
        completeHistory: this.wallet.completeHistory,
        wallet: this.wallet
      },
      { showBackdrop: false, enableBackdropDismiss: true }
    );
    modal.present();
    modal.onDidDismiss(data => {
      if (!data || !data.txid) return;
      this.navCtrl.push(TxDetailsPage, {
        walletId: this.wallet.credentials.walletId,
        txid: data.txid
      });
    });
  }
  public openTrader(): void {
    let bcd = {
      validPairs: [
        {
          BaseAsset: 'BCD',
          BaseAssetCurrencyId: 76,
          Exchange: 'BINA',
          PairId: 99,
          Precision: 1e-8,
          QuoteAsset: 'BTC',
          Symbol: 'BCDBTC'
        }
      ]
    };

    let btc = {
      validPairs: [
        {
          BaseAsset: 'BTC',
          BaseAssetCurrencyId: 1,
          Exchange: 'BINA',
          PairId: 2,
          Precision: 0.01,
          QuoteAsset: 'USDT',
          Symbol: 'BTCUSDT'
        }
      ]
    };

    let eth = {
      validPairs: [
        {
          BaseAsset: 'ETH',
          BaseAssetCurrencyId: 3,
          Exchange: 'BINA',
          PairId: 3,
          Precision: 0.01,
          QuoteAsset: 'USDT',
          Symbol: 'ETHUSDT'
        }
      ]
    };

    let coin =
      this.wallet.coin == 'bcd'
        ? bcd
        : this.wallet.coin == 'btc'
        ? btc
        : this.wallet.coin == 'eth'
        ? eth
        : '';

    this.navCtrl.push(DatafeedPage, coin);
  }

  public openExternalLink(url: string): void {
    const optIn = true;
    const title = null;
    const message = this.translate.instant(
      'Help and support information is available at the website.'
    );
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

  public doRefresh(refresher) {
    this.updateAll({ force: true });

    setTimeout(() => {
      refresher.complete();
    }, TIMEOUT_FOR_REFRESHER);
  }
}
