import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Logger } from '../../../providers';
import { ApiProvider } from '../../../providers/api/api';

import { SocialSharing } from '@ionic-native/social-sharing';

import * as $ from 'jquery';
/**
 * Generated class for the FullpostPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-fullpost',
  templateUrl: 'fullpost.html'
})
export class FullpostPage {
  public post: any = [];
  public isLoading: boolean = false;
  public relatedItems: any = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public logger: Logger,
    public api: ApiProvider,
    private socialSharing: SocialSharing
  ) {
    this.logger.log(navParams.get('post'));
    this.post = navParams.get('post');
  }

  ionViewWillEnter() {
    $('a').attr('target', '_blank');
    $('p:contains("Also read:")').remove();
    $('p:contains("Source:")').remove();
    this.logger.log(this.post);
  }
  ionViewDidLoad() {
    this.getRelated();
  }
  getRelated() {
    if (!this.isLoading) {
      this.isLoading = true;
      /*let data: Observable<any>; data =*/
      this.api
        .get('posts?_embed&categories=' + this.post.categories[0])
        .subscribe((result: any = []) => {
          this.isLoading = false;
          this.relatedItems = result;
        });
    }
  }
  openFullPost(item) {
    this.navCtrl.push(FullpostPage, { post: item });
  }
  sharePost(title: string, img: string, posturl: string) {
    // if (!this.telegram) {
    //   this.showError();
    //   return;
    // }
    this.socialSharing.share(title, null, img, posturl);
  }
}
