import {
  animate,
  Component,
  ElementRef,
  NgZone,
  Renderer,
  state,
  style,
  transition,
  trigger,
  ViewChild
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  Content,
  Events,
  NavController,
  NavParams,
  Platform
} from 'ionic-angular';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Observable, Subscription } from 'rxjs';

// Pages
import { AddPage } from '../add/add';
import { BitPayCardPage } from '../integrations/bitpay-card/bitpay-card';
import { BitPayCardIntroPage } from '../integrations/bitpay-card/bitpay-card-intro/bitpay-card-intro';
import { CoinbasePage } from '../integrations/coinbase/coinbase';
import { ShapeshiftPage } from '../integrations/shapeshift/shapeshift';
import { PaperWalletPage } from '../paper-wallet/paper-wallet';
import { AmountPage } from '../send/amount/amount';
import { AddressbookAddPage } from '../settings/addressbook/add/add';
import { ProposalsPage } from './proposals/proposals';

// Providers
import { AppProvider } from '../../providers/app/app';
import { BitPayCardProvider } from '../../providers/bitpay-card/bitpay-card';
import { BwcErrorProvider } from '../../providers/bwc-error/bwc-error';
import { ClipboardProvider } from '../../providers/clipboard/clipboard';
import { EmailNotificationsProvider } from '../../providers/email-notifications/email-notifications';
import { ExternalLinkProvider } from '../../providers/external-link/external-link';
import { FeedbackProvider } from '../../providers/feedback/feedback';
import { HomeIntegrationsProvider } from '../../providers/home-integrations/home-integrations';
import { IncomingDataProvider } from '../../providers/incoming-data/incoming-data';
import { Logger } from '../../providers/logger/logger';
import { OnGoingProcessProvider } from '../../providers/on-going-process/on-going-process';
import { PersistenceProvider } from '../../providers/persistence/persistence';
import { PlatformProvider } from '../../providers/platform/platform';
import { PopupProvider } from '../../providers/popup/popup';
import { ProfileProvider } from '../../providers/profile/profile';
import { PushNotificationsProvider } from '../../providers/push-notifications/push-notifications';
import {
  Coin,
  WalletOptions,
  WalletProvider
} from '../../providers/wallet/wallet';
import { SettingsPage } from '../settings/settings';

import { TopcoinsPage } from '../trader/topcoins/topcoins';
import { UserstatsPage } from '../trader/userstats/userstats';

import { BwcProvider } from '../../providers/bwc/bwc';
import { ScanPage } from '../scan/scan';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',

  animations: [
    trigger('fadeInUp', [
      state('void', style({ opacity: '0' })),
      state('*', style({ opacity: '1' })),
      transition('void <=> *', animate('150ms ease-in'))
    ])
  ]
})
export class HomePage {
  @ViewChild('pageTop') pageTop: Content;
  @ViewChild('showCard') showCard;
  @ViewChild('userNameId') userNameId: ElementRef;
  @ViewChild('scan') scanId: ElementRef;
  @ViewChild('balance') balanceId: ElementRef;
  
  

  fabToHide;
  oldScrollTop: number = 0;

  public vault;
  public vaultWallets;
  public wallets: any[];
  public walletsBtc;
  public walletsBch;
  public walletsBcd;
  public cachedBalanceUpdateOn: string;
  public txpsN: number;
  public serverMessages: any[];
  public homeIntegrations;
  public bitpayCardItems;
  public showBitPayCard: boolean = false;
  public showAnnouncement: boolean = false;
  public validDataFromClipboard;
  public payProDetailsData;
  public remainingTimeStr: string;
  public slideDown: boolean;

  public showRateCard: boolean;
  public showReorderBtc: boolean;
  public showReorderBch: boolean;
  public showReorderBcd: boolean;
  public showReorderVaultWallets: boolean;
  public showIntegration;
  public hideHomeIntegrations: boolean;
  public showGiftCards: boolean;
  public showBitpayCardGetStarted: boolean;
  public accessDenied: boolean;

  public bcdExists: boolean = false;
  public status;

  private isElectron: boolean;
  private updatingWalletId: object;
  private zone;
  private countDown;
  private onResumeSubscription: Subscription;
  private onPauseSubscription: Subscription;

  constructor(
    private plt: Platform,
    private navCtrl: NavController,
    private profileProvider: ProfileProvider,
    private walletProvider: WalletProvider,
    private bwcErrorProvider: BwcErrorProvider,
    private logger: Logger,
    private events: Events,
    private externalLinkProvider: ExternalLinkProvider,
    private popupProvider: PopupProvider,
    private appProvider: AppProvider,
    private platformProvider: PlatformProvider,
    private homeIntegrationsProvider: HomeIntegrationsProvider,
    private persistenceProvider: PersistenceProvider,
    private feedbackProvider: FeedbackProvider,
    private bitPayCardProvider: BitPayCardProvider,
    private translate: TranslateService,
    private emailProvider: EmailNotificationsProvider,
    private clipboardProvider: ClipboardProvider,
    private incomingDataProvider: IncomingDataProvider,
    private bwcProvider: BwcProvider,
    private navParams: NavParams,
    private onGoingProcessProvider: OnGoingProcessProvider,
    private pushNotificationsProvider: PushNotificationsProvider,
    private renderer: Renderer
  ) {
    this.status = this.navParams.data.status;
    this.slideDown = false;
    this.updatingWalletId = {};
    this.cachedBalanceUpdateOn = '';
    this.isElectron = this.platformProvider.isElectron;
    this.showReorderBtc = false;
    this.showReorderBch = false;
    this.showReorderBcd = false;
    this.showReorderVaultWallets = false;
    this.zone = new NgZone({ enableLongStackTrace: false });
    this.events.subscribe('Home/reloadStatus', () => {
      this._willEnter();
      this._didEnter();
    });

    this.bcdExists =
      this.bwcProvider.getBitcoreDiamond() == undefined ? false : true;
  }

  expandBalance() {
    // this.userNameId = this.element.nativeElement.getElementbyClassName(
    //   'header-extend'
    // )[0];
    setTimeout(() => {
      if ( this.wallets.length !== 0 && this.totalb() !== 'none') {
        this.renderer.setElementStyle(
          this.userNameId.nativeElement,  'webkitTransition', 'ease 0.5s' );
          this.renderer.setElementStyle(
            this.scanId.nativeElement,  'webkitTransition', 'ease 0.5s' );
          this.renderer.setElementStyle(
              this.balanceId.nativeElement,  'webkitTransition', 'ease 0.5s' );

        this.renderer.setElementStyle(this.userNameId.nativeElement, 'opacity', '1');
        }
    }, 500);
    
   
  }

  onContentScroll(e) {
    if ( this.wallets.length !== 0 && this.totalb() !== 'none') {
    if (e.scrollTop - this.oldScrollTop > 10) {
      this.logger.log('DOWN');
      
      this.renderer.setElementStyle(this.userNameId.nativeElement, 'height', '60px');
      this.renderer.setElementStyle(this.userNameId.nativeElement, 'padding-bottom', '15px');
  
      this.renderer.setElementStyle(this.scanId.nativeElement, 'margin-top', '5px');
      this.renderer.setElementStyle(this.scanId.nativeElement, 'width', '20px');
      this.renderer.setElementStyle(this.balanceId.nativeElement, 'padding-top', '0px');
      
    } else if (e.scrollTop - this.oldScrollTop < 0) {
      this.renderer.setElementStyle(this.userNameId.nativeElement, 'height', '100px');
      this.renderer.setElementStyle(this.userNameId.nativeElement, 'padding-bottom', '0px');
     this.renderer.setElementStyle(this.scanId.nativeElement, 'margin-top', '0px');
     this.renderer.setElementStyle(this.scanId.nativeElement, 'width', '28.5px')
      this.renderer.setElementStyle(this.balanceId.nativeElement, 'padding-top', '27px');
      
      this.logger.log('UP');
    }
    this.oldScrollTop = e.scrollTop;
  }
  }

  ionViewWillEnter() {
    this._willEnter();
  }

  ionViewDidEnter() {
    this._didEnter();
  }

  private _willEnter() {
    this.events.publish('InitWallets');
    // Update list of wallets, status and TXPs
    this.setWallets();

    // Update Wallet on Focus
    if (this.isElectron) {
      this.updateDesktopOnFocus();
    }
    this.expandBalance()
  }

  private _didEnter() {
    this.profileProvider
      .isDisclaimerAccepted()
      .then(() => {
        if (!this.profileProvider.profile.defaultWalletCreated) {
          this.createWallets();
        }

        this.checkClipboard();

        // Show integrations
        const integrations = _.filter(this.homeIntegrationsProvider.get(), {
          show: true
        }).filter(i => i.name !== 'giftcards' && i.name !== 'debitcard');

        this.showGiftCards = this.homeIntegrationsProvider.shouldShowInHome(
          'giftcards'
        );

        this.showBitpayCardGetStarted = this.homeIntegrationsProvider.shouldShowInHome(
          'debitcard'
        );

        // Hide BitPay if linked
        setTimeout(() => {
          this.homeIntegrations = _.remove(_.clone(integrations), x => {
            if (x.name == 'debitcard' && x.linked) return;
            else return x;
          });
        }, 200);

        // Only BitPay Wallet
        this.bitPayCardProvider.get({}, (_, cards) => {
          this.zone.run(() => {
            this.showBitPayCard = this.appProvider.info._enabledExtensions
              .debitcard
              ? true
              : false;
            this.bitpayCardItems = cards;
          });
        });
      })
      .catch(() => {
        this.logger.log('terms not accepted yet');
      });
  }

  ionViewDidLoad() {
    this.logger.info('Loaded: HomePage');

    this.checkFeedbackInfo();

    this.checkEmailLawCompliance();

    this.subscribeIncomingDataMenuEvent();

    this.subscribeBwsEvents();

    this.subscribeStatusEvents();

    this.subscribeLocalTxAction();

    this.onResumeSubscription = this.plt.resume.subscribe(() => {
      this.setWallets();
      this.checkClipboard();
      this.subscribeIncomingDataMenuEvent();
      this.subscribeBwsEvents();
      this.subscribeStatusEvents();
      this.subscribeLocalTxAction();
    });

    this.onPauseSubscription = this.plt.pause.subscribe(() => {
      this.events.unsubscribe(
        'finishIncomingDataMenuEvent',
        this.finishIncomingDataMenuEventHandler
      );
      this.events.unsubscribe('bwsEvent', this.bwsEventHandler);
      this.events.unsubscribe('status:updated', this.statusUpdateEventHandler);
      this.events.unsubscribe('Local/TxAction', this.localTxActionEventHandler);
    });
  }

  ngOnDestroy() {
    this.onResumeSubscription.unsubscribe();
    this.onPauseSubscription.unsubscribe();
  }

  ionViewWillLeave() {
    this.resetValuesForAnimationCard();
  }

  private async resetValuesForAnimationCard() {
    await Observable.timer(50).toPromise();
    this.validDataFromClipboard = null;
    this.slideDown = false;
  }

  private subscribeBwsEvents() {
    // BWS Events: Update Status per Wallet -> Update txps
    // NewBlock, NewCopayer, NewAddress, NewTxProposal, TxProposalAcceptedBy, TxProposalRejectedBy, txProposalFinallyRejected,
    // txProposalFinallyAccepted, TxProposalRemoved, NewIncomingTx, NewOutgoingTx
    this.events.subscribe('bwsEvent', this.bwsEventHandler);
  }

  private bwsEventHandler: any = (walletId: string) => {
    this.updateWallet({ walletId });
  };

  private subscribeStatusEvents() {
    // Create, Join, Import and Delete -> Get Wallets -> Update Status for All Wallets -> Update txps
    this.events.subscribe('status:updated', this.statusUpdateEventHandler);
  }

  private statusUpdateEventHandler: any = () => {
    this.setWallets();
  };

  private subscribeLocalTxAction() {
    // Reject, Remove, OnlyPublish and SignAndBroadcast -> Update Status per Wallet -> Update txps
    this.events.subscribe('Local/TxAction', this.localTxActionEventHandler);
  }

  private localTxActionEventHandler: any = opts => {
    this.updateWallet(opts);
  };

  private subscribeIncomingDataMenuEvent() {
    this.events.subscribe(
      'finishIncomingDataMenuEvent',
      this.finishIncomingDataMenuEventHandler
    );
  }

  private finishIncomingDataMenuEventHandler: any = data => {
    switch (data.redirTo) {
      case 'AmountPage':
        this.sendPaymentToAddress(data.value, data.coin);
        break;
      case 'AddressBookPage':
        this.addToAddressBook(data.value);
        break;
      case 'OpenExternalLink':
        this.goToUrl(data.value);
        break;
      case 'PaperWalletPage':
        this.scanPaperWallet(data.value);
        break;
    }
  };

  private goToUrl(url: string): void {
    this.externalLinkProvider.open(url);
  }

  private sendPaymentToAddress(bitcoinAddress: string, coin: string): void {
    this.navCtrl.push(AmountPage, { toAddress: bitcoinAddress, coin });
  }

  private addToAddressBook(bitcoinAddress: string): void {
    this.navCtrl.push(AddressbookAddPage, { addressbookEntry: bitcoinAddress });
  }

  private scanPaperWallet(privateKey: string) {
    this.navCtrl.push(PaperWalletPage, { privateKey });
  }

  private updateDesktopOnFocus() {
    const { remote } = (window as any).require('electron');
    const win = remote.getCurrentWindow();
    win.on('focus', () => {
      this.checkClipboard();
      this.setWallets();
    });
  }

  private openEmailDisclaimer() {
    const message = this.translate.instant(
      'By providing your email address, you give explicit consent to BitPay to use your email address to send you email notifications about payments.'
    );
    const title = this.translate.instant('Privacy Policy update');
    const okText = this.translate.instant('Accept');
    const cancelText = this.translate.instant('Disable notifications');
    this.popupProvider
      .ionicConfirm(title, message, okText, cancelText)
      .then(ok => {
        if (ok) {
          // Accept new Privacy Policy
          this.persistenceProvider.setEmailLawCompliance('accepted');
        } else {
          // Disable email notifications
          this.persistenceProvider.setEmailLawCompliance('rejected');
          this.emailProvider.updateEmail({
            enabled: false,
            email: 'null@email'
          });
        }
      });
  }

  private checkEmailLawCompliance(): void {
    setTimeout(() => {
      if (this.emailProvider.getEmailIfEnabled()) {
        this.persistenceProvider.getEmailLawCompliance().then(value => {
          if (!value) this.openEmailDisclaimer();
        });
      }
    }, 2000);
  }

  private startUpdatingWalletId(walletId: string) {
    this.updatingWalletId[walletId] = true;
  }

  private stopUpdatingWalletId(walletId: string) {
    setTimeout(() => {
      this.updatingWalletId[walletId] = false;
    }, 10000);
  }

  private debounceSetWallets = _.debounce(
    async () => {
      this.setWallets();
    },
    5000,
    {
      leading: true
    }
  );

  private setWallets(): void {
    this.wallets = this.profileProvider.getWallets();
    this.vaultWallets = this.profileProvider.getVaultWallets();
    this.walletsBtc = _.filter(this.wallets, (x: any) => {
      return (
        x.credentials.coin == 'btc' &&
        !this.profileProvider.vaultHasWallet(x.credentials.walletId)
      );
    });
    this.walletsBch = _.filter(this.wallets, (x: any) => {
      return (
        x.credentials.coin == 'bch' &&
        !this.profileProvider.vaultHasWallet(x.credentials.walletId)
      );
    });

    this.walletsBcd = _.filter(this.wallets, (x: any) => {
      return (
        x.credentials.coin == 'bcd' &&
        !this.profileProvider.vaultHasWallet(x.credentials.walletId)
      );
    });
    // Avoid heavy tasks that can slow down the unlocking experience
    if (!this.appProvider.isLockModalOpen) {
      this.updateAllWallets();
    }
  }

  private checkFeedbackInfo() {
    this.persistenceProvider.getFeedbackInfo().then(info => {
      if (!info) {
        this.initFeedBackInfo();
      } else {
        const feedbackInfo = info;
        // Check if current version is greater than saved version
        const currentVersion = this.appProvider.info.version;
        const savedVersion = feedbackInfo.version;
        const isVersionUpdated = this.feedbackProvider.isVersionUpdated(
          currentVersion,
          savedVersion
        );
        if (!isVersionUpdated) {
          this.initFeedBackInfo();
          return;
        }
        const now = moment().unix();
        const timeExceeded = now - feedbackInfo.time >= 24 * 7 * 60 * 60;
        this.showRateCard = timeExceeded && !feedbackInfo.sent;
        // this.showCard.setShowRateCard(this.showRateCard);
      }
    });
  }

  public checkClipboard() {
    /*
    return this.clipboardProvider
      .getData()
      .then(async data => {
        this.validDataFromClipboard = this.incomingDataProvider.parseData(data);
        if (!this.validDataFromClipboard) {
          return;
        }
        const dataToIgnore = [
          'BitcoinAddress',
          'BitcoinCashAddress',
          'BitcoinDiamondAddress',
          'PlainUrl'
        ];
        if (dataToIgnore.indexOf(this.validDataFromClipboard.type) > -1) {
          this.validDataFromClipboard = null;
          return;
        }
        if (this.validDataFromClipboard.type === 'PayPro') {
          const coin: string =
            data.indexOf('bitcoincash') === 0 ? Coin.BCH : Coin.BTC;
          this.incomingDataProvider
            .getPayProDetails(data)
            .then(payProDetails => {
              if (!payProDetails) {
                throw this.translate.instant('No wallets available');
              }
              this.payProDetailsData = payProDetails;
              this.payProDetailsData.coin = coin;
              this.clearCountDownInterval();
              this.paymentTimeControl(this.payProDetailsData.expires);
            })
            .catch(err => {
              this.payProDetailsData = {};
              this.payProDetailsData.error = err;
              this.logger.warn('Error in Payment Protocol', err);
            });
        }
        await Observable.timer(50).toPromise();
        this.slideDown = true;
      })
      .catch(() => {
        this.logger.warn('Paste from clipboard err');
      });
      */
  }

  public hideClipboardCard() {
    this.validDataFromClipboard = null;
    this.clipboardProvider.clear();
    this.slideDown = false;
  }

  public processClipboardData(data): void {
    this.clearCountDownInterval();
    this.incomingDataProvider.redir(data, { fromHomeCard: true });
  }

  private clearCountDownInterval(): void {
    if (this.countDown) clearInterval(this.countDown);
  }

  /*
  private paymentTimeControl(expirationTime): void {
    const setExpirationTime = (): void => {
      const now = Math.floor(Date.now() / 1000);
      if (now > expirationTime) {
        this.remainingTimeStr = this.translate.instant('Expired');
        this.clearCountDownInterval();
        return;
      }
      const totalSecs = expirationTime - now;
      const m = Math.floor(totalSecs / 60);
      const s = totalSecs % 60;
      this.remainingTimeStr = ('0' + m).slice(-2) + ':' + ('0' + s).slice(-2);
    };

    setExpirationTime();

    this.countDown = setInterval(() => {
      setExpirationTime();
    }, 1000);
  }
*/
  private initFeedBackInfo() {
    this.persistenceProvider.setFeedbackInfo({
      time: moment().unix(),
      version: this.appProvider.info.version,
      sent: false
    });
    this.showRateCard = false;
  }

  private updateWallet(opts): void {
    if (this.updatingWalletId[opts.walletId]) return;
    this.startUpdatingWalletId(opts.walletId);
    const wallet = this.profileProvider.getWallet(opts.walletId);
    this.walletProvider
      .getStatus(wallet, opts)
      .then(status => {
        wallet.status = status;
        wallet.error = null;
        this.profileProvider.setLastKnownBalance(
          wallet.id,
          wallet.status.availableBalanceStr
        );

        // Update txps
        this.updateTxps();

        this.stopUpdatingWalletId(opts.walletId);
      })
      .catch(err => {
        this.logger.error(err);
        this.stopUpdatingWalletId(opts.walletId);
      });
  }

  private updateTxps() {
    this.profileProvider
      .getTxps({ limit: 3 })
      .then(data => {
        this.zone.run(() => {
          this.txpsN = data.n;
        });
      })
      .catch(err => {
        this.logger.error(err);
      });
  }

  private updateAllWallets(): void {
    let foundMessage = false;

    if (_.isEmpty(this.wallets)) return;

    const pr = wallet => {
      return this.walletProvider
        .getStatus(wallet, {})
        .then(async status => {
          wallet.status = status;
          wallet.error = null;

          if (!foundMessage && !_.isEmpty(status.serverMessages)) {
            this.serverMessages = _.orderBy(
              status.serverMessages,
              ['priority'],
              ['asc']
            );
            this.serverMessages.forEach(serverMessage => {
              this.checkServerMessage(serverMessage);
            });
            foundMessage = true;
          }

          this.profileProvider.setLastKnownBalance(
            wallet.id,
            wallet.status.availableBalanceStr
          );
          return Promise.resolve();
        })
        .catch(err => {
          if (err && err.message === '403') {
            this.accessDenied = true;
            wallet.error = this.translate.instant('Access denied');
          } else if (err === 'WALLET_NOT_REGISTERED') {
            wallet.error = this.translate.instant('Wallet not registered');
          } else {
            wallet.error = this.bwcErrorProvider.msg(err);
          }

          this.logger.warn(
            this.bwcErrorProvider.msg(
              err,
              'Error updating status for ' + wallet.name
            )
          );
          return Promise.resolve();
        });
    };

    const promises = [];

    _.each(this.wallets, wallet => {
      promises.push(pr(wallet));
    });

    Promise.all(promises).then(() => {
      this.updateTxps();
    });
  }

  private removeServerMessage(id): void {
    this.serverMessages = _.filter(this.serverMessages, s => s.id !== id);
  }

  public dismissServerMessage(serverMessage): void {
    this.logger.debug(`Server message id: ${serverMessage.id} dismissed`);
    this.persistenceProvider.setServerMessageDismissed(serverMessage.id);
    this.removeServerMessage(serverMessage.id);
  }

  public checkServerMessage(serverMessage): void {
    if (serverMessage.app && serverMessage.app != this.appProvider.info.name) {
      this.removeServerMessage(serverMessage.id);
      return;
    }

    if (
      serverMessage.id === 'bcard-atm' &&
      (!this.showBitPayCard ||
        !this.bitpayCardItems ||
        !this.bitpayCardItems[0])
    ) {
      this.removeServerMessage(serverMessage.id);
      return;
    }

    this.persistenceProvider
      .getServerMessageDismissed(serverMessage.id)
      .then((value: string) => {
        if (value === 'dismissed') {
          this.removeServerMessage(serverMessage.id);
        }
      });
  }

  public openServerMessageLink(url): void {
    this.externalLinkProvider.open(url);
  }

  public openCountryBannedLink(): void {
    const url =
      "https://github.com/bitpay/copay/wiki/Why-can't-I-use-BitPay's-services-in-my-country%3F";
    this.externalLinkProvider.open(url);
  }

  public goToAddView(): void {
    this.navCtrl.push(AddPage);
  }

  public goToWalletDetails(wallet): void {
    if (
      this.showReorderBtc ||
      this.showReorderBch ||
      this.showReorderBcd ||
      this.showReorderVaultWallets
    )
      return;

    this.events.publish('OpenWallet', wallet);
  }

  public reorderBtc(): void {
    this.showReorderBtc = !this.showReorderBtc;
  }

  public reorderBch(): void {
    this.showReorderBch = !this.showReorderBch;
  }

  public reorderBcd(): void {
    this.showReorderBcd = !this.showReorderBcd;
  }

  public reorderVault(): void {
    this.showReorderVaultWallets = !this.showReorderVaultWallets;
  }

  public reorderWalletsBtc(indexes): void {
    const element = this.walletsBtc[indexes.from];
    this.walletsBtc.splice(indexes.from, 1);
    this.walletsBtc.splice(indexes.to, 0, element);
    _.each(this.walletsBtc, (wallet, index: number) => {
      this.profileProvider.setWalletOrder(wallet.id, index);
    });
  }

  public reorderWalletsBch(indexes): void {
    const element = this.walletsBch[indexes.from];
    this.walletsBch.splice(indexes.from, 1);
    this.walletsBch.splice(indexes.to, 0, element);
    _.each(this.walletsBch, (wallet, index: number) => {
      this.profileProvider.setWalletOrder(wallet.id, index);
    });
  }

  public reorderWalletsBcd(indexes): void {
    const element = this.walletsBcd[indexes.from];
    this.walletsBcd.splice(indexes.from, 1);
    this.walletsBcd.splice(indexes.to, 0, element);
    _.each(this.walletsBcd, (wallet, index: number) => {
      this.profileProvider.setWalletOrder(wallet.id, index);
    });
  }

  public reorderVaultWallets(indexes): void {
    const element = this.vaultWallets[indexes.from];
    this.vaultWallets.splice(indexes.from, 1);
    this.vaultWallets.splice(indexes.to, 0, element);
    _.each(this.vaultWallets, (wallet, index: number) => {
      this.profileProvider.setWalletOrder(wallet.id, index);
    });
  }

  public openProposalsPage(): void {
    this.navCtrl.push(ProposalsPage);
  }

  public goTo(page: string): void {
    const pageMap = {
      BitPayCardIntroPage,
      CoinbasePage,
      ShapeshiftPage
    };
    this.navCtrl.push(pageMap[page]);
  }

  public goToCard(cardId): void {
    this.navCtrl.push(BitPayCardPage, { id: cardId });
  }

  public doRefresh(refresher): void {
    this.debounceSetWallets();
    setTimeout(() => {
      refresher.complete();
    }, 2000);
  }

  public doRefreshButton(): void {
    this.debounceSetWallets();
  }

  public goscan(): void {
    this.navCtrl.push(ScanPage);
  }

  public settings(): void {
    this.navCtrl.push(SettingsPage);
  }

  public goToUserStats(): void {
    this.navCtrl.push(UserstatsPage);
  }

  public goToTopCoins(): void {
    this.navCtrl.push(TopcoinsPage);
  }

  public checkHiddenBalance() {
    if (this.wallets == undefined) return true;
    /*for(var o of this.wallets)
           if(!o.balanceHidden) return hiddenVar=false;
         
       return hiddenVar=True;*/

    var howmanyhidden = 0;

    for (var o of this.wallets) {
      if (o.balanceHidden == true) {
        howmanyhidden = howmanyhidden + 1;
        /*this.logger.log('howmanyhidden:'+howmanyhidden)*/
      }
    }

    var hiddenVar = this.wallets.length != howmanyhidden;

    return hiddenVar;
  }

  public toggleBalance() {
    /*this.logger.log(this.wallets.toString());*/
    /*this.logger.log(this.wallets.length.toString());*/

    for (var value of this.wallets) {
      /*this.logger.log(value.credentials.walletId);*/
      this.profileProvider.toggleHideBalanceFlagall(value.credentials.walletId);
    }
  }

  public toggleBalanceNew() {
    for (var value of this.wallets) {
      this.logger.log(value.credentials.walletId);
      this.profileProvider.toggleHideBalanceFlag(value.credentials.walletId);
    }
  }

  public totalb() {
    let isocode;
    let profit = 0;
    if (this.wallets !== undefined) {
      if (this.wallets[0].status !== null) {
        profit = _.sumBy(this.wallets, w => {
          if (!w.status || !w.status.spendableBalanceAlternative) return 0;
          isocode = w.status.alternativeIsoCode;
          return parseFloat(w.status.spendableBalanceAlternative);
        });

        if (!isocode) {
          return 'none';
        } else {
          return profit.toFixed(2) + ' ' + isocode;
        }
      } else {
        return 'none';
      }
    } else {
      return 'none';
    }
  }

  private createWallets() {
    let promise: Promise<boolean> = Promise.resolve(true);
    if (this.profileProvider.getWallets({ coin: Coin.BCD }).length == 0)
      promise = promise.then(() => {
        const optsBCD: Partial<WalletOptions> = {
          coin: Coin.BCD,
          m: 1,
          n: 1,
          networkName: 'livenet',
          singleAddress: false,
          silent: true
        };
        return this.create(optsBCD);
      });
    if (this.profileProvider.getWallets({ coin: Coin.BTC }).length == 0)
      promise = promise.then(() => {
        const optsBTC: Partial<WalletOptions> = {
          coin: Coin.BTC,
          m: 1,
          n: 1,
          networkName: 'livenet',
          singleAddress: false,
          silent: true
        };
        return this.create(optsBTC);
      });
    promise.then(() => {
      if (this.profileProvider.getWallets().length > 0)
        this.profileProvider.setDefaultWalletCreated();
    });
  }

  private create(opts): Promise<any> {
    this.onGoingProcessProvider.set('creatingWallet');
    const promise = this.profileProvider.createNewSeedWallet(opts);
    let ret = promise
      .then(wallet => {
        this.onGoingProcessProvider.clear();
        this.events.publish('status:updated');
        this.walletProvider.updateRemotePreferences(wallet);
        this.pushNotificationsProvider.updateSubscription(wallet);
        // this.setBackupFlagIfNeeded(wallet.credentials.walletId);
        // this.setFingerprintIfNeeded(wallet.credentials.walletId);
        // this.navCtrl.popToRoot();
        // this.events.publish('OpenWallet', wallet);
        return true;
      })
      .catch(err => {
        this.onGoingProcessProvider.clear();
        if (
          err &&
          err.message != 'FINGERPRINT_CANCELLED' &&
          err.message != 'PASSWORD_CANCELLED'
        ) {
          this.logger.error('Create: could not create wallet', err);
          const title = this.translate.instant('Error');
          err = this.bwcErrorProvider.msg(err);
          this.popupProvider.ionicAlert(title, err);
        }
        return false;
      });
    return ret;
  }
}
