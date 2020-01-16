import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';

import { AppProvider } from '../../../providers/app/app';

@Component({
  selector: 'page-transfer-to-modal',
  templateUrl: 'transfer-to-modal.html'
})
export class TransferToModalPage {
  public search: string = '';
  public wallet;
  public showB:boolean = false;

  constructor(
    private navParams: NavParams,
    private viewCtrl: ViewController,
    public appProvider: AppProvider
  ) {
    this.wallet = this.navParams.data.wallet;
  }

  public close(): void {
    this.viewCtrl.dismiss();
  }
}
