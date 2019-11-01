import { Component, Input } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import * as _ from 'lodash';

// Providers
import { AddressBookProvider } from '../../../providers/address-book/address-book';
import { AddressProvider } from '../../../providers/address/address';
import { Logger } from '../../../providers/logger/logger';
import { PopupProvider } from '../../../providers/popup/popup';
import { ProfileProvider } from '../../../providers/profile/profile';
import { Coin, WalletProvider } from '../../../providers/wallet/wallet';

// Pages
import { AmountPage } from '../amount/amount';

export interface FlatWallet {
  id: string;
  color: string;
  name: string;
  recipientType: 'wallet';
  coin: Coin;
  network: 'testnet' | 'livenet';
  m: number;
  n: number;
  needsBackup: boolean;
  isComplete: () => boolean;
  getAddress: () => Promise<string>;
}

@Component({
  selector: 'page-transfer-to',
  templateUrl: 'transfer-to.html'
})
export class TransferToPage {
  public search: string = '';
  public walletsBtc;
  public walletsBch;
  public walletsBcd;
  public walletsEth;
  public walletBchList: FlatWallet[];
  public walletBtcList: FlatWallet[];
  public walletBcdList: FlatWallet[];
  public walletEthList: FlatWallet[];
  public contactsList = [];
  public filteredContactsList = [];
  public filteredWallets = [];
  public hasBtcWallets: boolean;
  public hasBchWallets: boolean;
  public hasBcdWallets: boolean;
  public hasEthWallets: boolean;
  public hasContacts: boolean;
  public contactsShowMore: boolean;
  public amount: string;
  public fiatAmount: number;
  public fiatCode: string;
  public _wallet;
  public _useAsModal: boolean;
  public hasContactsOrWallets: boolean;

  private CONTACTS_SHOW_LIMIT: number = 10;
  private currentContactsPage: number = 0;

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private profileProvider: ProfileProvider,
    private walletProvider: WalletProvider,
    private addressBookProvider: AddressBookProvider,
    private logger: Logger,
    private popupProvider: PopupProvider,
    private addressProvider: AddressProvider
  ) {
    this.walletsBtc = this.profileProvider.getWallets({ coin: 'btc' });
    this.walletsBch = this.profileProvider.getWallets({ coin: 'bch' });
    this.walletsBcd = this.profileProvider.getWallets({ coin: 'bcd' });
    this.walletsEth = this.profileProvider.getWallets({ coin: 'eth' });
    this.hasBtcWallets = !_.isEmpty(this.walletsBtc);
    this.hasBchWallets = !_.isEmpty(this.walletsBch);
    this.hasBcdWallets = !_.isEmpty(this.walletsBcd);
    this.hasEthWallets = !_.isEmpty(this.walletsEth);
  }

  @Input()
  set wallet(wallet) {
    this._wallet = this.navParams.data.wallet
      ? this.navParams.data.wallet
      : wallet;

    this.walletBchList = this.getBchWalletsList();
    this.walletBtcList = this.getBtcWalletsList();
    this.walletBcdList = this.getBcdWalletsList();
    this.walletEthList = this.getEthWalletsList();
    this.updateContactsList();
  }

  get wallet() {
    return this._wallet;
  }

  @Input()
  set searchInput(search) {
    this.search = search;
    this.processInput();
  }

  get searchInput() {
    return this.search;
  }

  @Input()
  set useAsModal(useAsModal: boolean) {
    this._useAsModal = useAsModal;
  }

  get useAsModal() {
    return this._useAsModal;
  }

  private getBchWalletsList(): FlatWallet[] {
    return this.hasBchWallets ? this.getRelevantWallets(this.walletsBch) : [];
  }

  private getBtcWalletsList(): FlatWallet[] {
    return this.hasBtcWallets ? this.getRelevantWallets(this.walletsBtc) : [];
  }

  private getBcdWalletsList(): FlatWallet[] {
    return this.hasBcdWallets ? this.getRelevantWallets(this.walletsBcd) : [];
  }

  private getEthWalletsList(): FlatWallet[] {
    return this.hasEthWallets ? this.getRelevantWallets(this.walletsEth) : [];
  }

  private getRelevantWallets(rawWallets): FlatWallet[] {
    return rawWallets
      .map(wallet => this.flattenWallet(wallet))
      .filter(wallet => this.filterIrrelevantRecipients(wallet));
  }

  private updateContactsList(): void {
    this.addressBookProvider.list().then(ab => {
      this.hasContacts = _.isEmpty(ab) ? false : true;
      if (!this.hasContacts) return;

      let contactsList = [];
      _.each(ab, (v, k: string) => {
        const addrData = this.addressProvider.getCoinAndNetwork(k);
        contactsList.push({
          name: _.isObject(v) ? v.name : v,
          address: k,
          network: addrData.network,
          email: _.isObject(v) ? v.email : null,
          recipientType: 'contact',
          coin: addrData.coin,
          getAddress: () => Promise.resolve(k)
        });
      });
      contactsList = _.orderBy(contactsList, 'name');
      this.contactsList = contactsList.filter(c =>
        this.filterIrrelevantRecipients(c)
      );
      let shortContactsList = _.clone(
        this.contactsList.slice(
          0,
          (this.currentContactsPage + 1) * this.CONTACTS_SHOW_LIMIT
        )
      );
      this.filteredContactsList = _.clone(shortContactsList);
      this.contactsShowMore =
        this.contactsList.length > shortContactsList.length;
    });
  }

  private flattenWallet(wallet): FlatWallet {
    return {
      id: wallet.id,
      color: wallet.color,
      name: wallet.name,
      recipientType: 'wallet',
      coin: wallet.coin,
      network: wallet.network,
      m: wallet.credentials.m,
      n: wallet.credentials.n,
      isComplete: wallet.isComplete(),
      needsBackup: wallet.needsBackup,
      getAddress: () => this.walletProvider.getAddress(wallet, false)
    };
  }

  private filterIrrelevantRecipients(recipient: {
    coin: string;
    network: string;
  }): boolean {
    return this._wallet
      ? this._wallet.coin === recipient.coin &&
          this._wallet.network === recipient.network
      : true;
  }

  public showMore(): void {
    this.currentContactsPage++;
    this.updateContactsList();
  }

  public processInput(): void {
    if (this.search && this.search.trim() != '') {
      this.searchWallets();
      this.searchContacts();

      this.hasContactsOrWallets =
        this.filteredContactsList.length === 0 &&
        this.filteredWallets.length === 0
          ? false
          : true;
    } else {
      this.updateContactsList();
      this.filteredWallets = [];
    }
  }

  public searchWallets(): void {
    if (this.hasBchWallets && this._wallet.coin === 'bch') {
      this.filteredWallets = this.walletBchList.filter(wallet => {
        return (
          wallet.id != this.wallet.id &&
          _.includes(wallet.name.toLowerCase(), this.search.toLowerCase())
        );
      });
    }
    if (this.hasBtcWallets && this._wallet.coin === 'btc') {
      this.filteredWallets = this.walletBtcList.filter(wallet => {
        return (
          wallet.id != this.wallet.id &&
          _.includes(wallet.name.toLowerCase(), this.search.toLowerCase())
        );
      });
    }
    if (this.hasBcdWallets && this._wallet.coin === 'bcd') {
      this.filteredWallets = this.walletBcdList.filter(wallet => {
        return (
          wallet.id != this.wallet.id &&
          _.includes(wallet.name.toLowerCase(), this.search.toLowerCase())
        );
      });
    }
    if (this.hasEthWallets && this._wallet.coin === 'eth') {
      this.filteredWallets = this.walletEthList.filter(wallet => {
        return (
          wallet.id != this.wallet.id &&
        _.includes(wallet.name.toLowerCase(), this.search.toLowerCase())
        );
      });
    }
  }

  public searchContacts(): void {
    this.filteredContactsList = _.filter(this.contactsList, item => {
      let val = item.name;
      return _.includes(val.toLowerCase(), this.search.toLowerCase());
    });
  }

  public close(item): void {
    item
      .getAddress()
      .then((addr: string) => {
        if (!addr) {
          // Error is already formated
          this.popupProvider.ionicAlert('Error - no address');
          return;
        }
        this.logger.debug('Got address:' + addr + ' | ' + item.name);
        this.navCtrl.push(AmountPage, {
          recipientType: item.recipientType,
          amount: parseInt(this.navParams.data.amount, 10),
          toAddress: addr,
          name: item.name,
          email: item.email,
          color: item.color,
          coin: item.coin,
          network: item.network,
          useAsModal: this._useAsModal
        });
      })
      .catch(err => {
        this.logger.error('Send: could not getAddress', err);
      });
  }
}
