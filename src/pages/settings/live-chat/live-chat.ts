import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the LiveChatPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-live-chat',
  templateUrl: 'live-chat.html'
})
export class LiveChatPage {
  public innerHeight: any;
  constructor(public navCtrl: NavController, public navParams: NavParams) {}

  ionViewDidLoad() {}
  ngOnInit() {
    this.innerHeight = window.innerHeight - 100 + 'px';
  }
}
