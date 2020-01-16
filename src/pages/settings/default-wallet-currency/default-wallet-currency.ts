import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { NavController, NavParams } from 'ionic-angular';
import { Logger } from '../../../providers/logger/logger';


/**
 * Generated class for the DefaultWalletCurrencyPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


@Component({
  selector: 'page-default-wallet-currency',
  templateUrl: 'default-wallet-currency.html',
})
export class DefaultWalletCurrencyPage {
  public item:any = [
    {title: 'FIAT', status: false},
    {title: 'CRYPTO', status: false},
  ];
  public current;
  constructor(public navCtrl: NavController, public navParams: NavParams,public logger: Logger, public storage: Storage) {
  }

  ionViewWillEnter(){
    this.storage.get('FiatConverter').then((res) => {
        if (res == undefined ||  res == true) {
          this.item[0].status = true;
          this.item[1].status = false;
          this.current = 'FIAT';
        }else{
          this.item[0].status = false;
          this.item[1].status = true;
          this.current = 'CRYPTO';
        } 
      });

  }

  ionViewDidLoad() {
   
  }
  public select(val:string){
    if (val == 'FIAT'){
      this.storage.set('FiatConverter', true);
    }else{
      this.storage.set('FiatConverter', false);
     
    }
    this.navCtrl.pop();
  }
}
