import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { AppProvider, Logger } from '../../../providers';

import { Storage } from '@ionic/storage';

/**
 * Generated class for the InstructionsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-instructions',
  templateUrl: 'instructions.html'
})
export class InstructionsPage {
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public appProvider: AppProvider,
    public storage: Storage,
    public logger: Logger
  ) {}

  ionViewDidLoad() {}
  closeModal() {
    this.storage.set('instruction', false);
    this.viewCtrl.dismiss({ inst: false });
  }
}
