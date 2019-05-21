import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { ApiProvider } from '../../../providers/api/api';
import { FullpostPage } from '../fullpost/fullpost';

/**
 * Generated class for the NewssearchPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-newssearch',
  templateUrl: 'newssearch.html'
})
export class NewssearchPage {
  searchQuery: string = '';
  public items: any = [];
  private per_page = 5;
  private page: number = 1;
  private showLoadMore = false;
  private isLoading = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public api: ApiProvider
  ) {}

  ionViewDidLoad() {}

  onSearch() {
    this.items = [];
    this.loadData();
  }

  loadData() {
    if (!this.isLoading && this.searchQuery.length > 0) {
      this.isLoading = true;
      /*let data: Observable<any>; data =*/
      this.api
        .get(
          'posts?_embed&per_page=' +
            this.per_page +
            '&page=' +
            this.page +
            '&search=' +
            this.searchQuery
        )
        .subscribe(
          (result: any = []) => {
            this.isLoading = false;
            this.items = this.items.concat(result);
            if (result.length === this.per_page) {
              this.page++;
              this.showLoadMore = true;
            } else {
              this.showLoadMore = false;
            }
          },
          error => {
            this.isLoading = false;
            if (error.error.code === 'rest_post_invalid_page_number') {
              this.showLoadMore = false;
            }
          }
        );
    }
    this.showLoadMore;
  }
  clearSearch() {
    this.searchQuery = '';
    this.items = [];
    this.page = 1;
    this.showLoadMore = false;
  }

  openFullPost(item) {
    this.navCtrl.push(FullpostPage, { post: item });
  }
}
