import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Logger } from '../../../providers';
import { ApiProvider } from '../../../providers/api/api';
import { TabNews } from '../news';

/**
 * Generated class for the NewsmenuPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-newsmenu',
  templateUrl: 'newsmenu.html'
})
export class NewsmenuPage {
  public categories: any;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public api: ApiProvider,
    public logger: Logger
  ) {
    this.logger.log(this.api.Categories);
  }

  ionViewDidLoad() {}
  openCategory(item: number, name) {
    this.navCtrl.push(TabNews, { cat_id: item, cat_name: name });
  }
}
