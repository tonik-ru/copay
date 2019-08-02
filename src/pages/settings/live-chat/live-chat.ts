import { Component, Renderer } from '@angular/core';
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
  public elemHeight: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public renderer: Renderer
  ) {}

  ionViewDidLoad() {}
  ngOnInit() {
    setTimeout(() => {
      const element = this.renderer.selectRootElement(
        'page-live-chat .fixed-content'
      ).offsetHeight;
      this.innerHeight = element + 'px';
    }, 500);

    this.elemHeight =
      document.querySelector('page-tabs .toolbar').clientHeight +
      document.querySelector('page-live-chat .toolbar').clientHeight +
      5;
  }
}
