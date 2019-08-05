import { Component, ViewChild } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

import { Logger } from '../../providers/logger/logger';
import { TabBcdbazaar } from '../bcdvazaar/bcdbazaar';
import { HomePage } from '../home/home';
import { TabNews } from '../news/news';
import { ScanPage } from '../scan/scan';

import { LiveChatPage } from '../settings/live-chat/live-chat';
import { DatafeedPage } from '../trader/datafeed/datafeed';
import { TopcoinsPage } from '../trader/topcoins/topcoins';

import { timer } from 'rxjs/observable/timer';
import { ApiProvider } from '../../providers/api/api';

import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html'
})
export class TabsPage {
  @ViewChild('tabs')
  tabs;

  homeRoot = HomePage;
  scanRoot = ScanPage;
  tab2Root = TopcoinsPage;
  tab3Root = LiveChatPage;
  tab4Root = TabNews;
  datafeed = DatafeedPage;
  bcd4Root = TabBcdbazaar;

  private refreshTimer;
  public unreadNewsCount: any = '';

  /*tab5Root = Tab4Page;*/
  constructor(
    public translate: TranslateService,
    private logger: Logger,
    public newsApi: ApiProvider,
    public storage: Storage
  ) {
    this.refreshTimer = timer(1, 300000).subscribe(() => this.loadTempNews());

    this.refreshTimer = this.refreshTimer;
  }

  // public setUnreadItemsCount(itemsCount) {
  //   this.unreadNewsCount = itemsCount;
  // }

  // private updateNewsCount() {
  //   this.newsApi.getUnreadNewsCount().then(val => {
  //     this.unreadNewsCount >= 0
  //       ? (this.unreadNewsCount = val)
  //       : (this.unreadNewsCount = '');
  //   });
  // }

  // public getUnreadNewsCount() {
  //   return this.unreadNewsCount > 0 ? this.unreadNewsCount.toString() : '';
  // }

  loadTempNews() {
    let url: string = 'posts?_embed&per_page=100';
    this.newsApi.get(url).subscribe((result: any[]) => {
      this.newsApi.tempNews = result;
      // this.logger.log(this.newsApi.tempNews);
      this.newsApi.lastNewsId = this.newsApi.tempNews[0].id;
      // this.logger.log('ID -->', this.newsApi.tempNews[0].id);

      this.storage.get('lastNewsId').then(val => {
        if (val !== null) {
          this.newsApi.lastNewsId = val;
        } else {
          this.storage.set('lastNewsId', this.newsApi.lastNewsId);
          // this.logger.log('SAVE TO STORAGE -->', this.newsApi.lastNewsId);
        }
        let index = this.newsApi.tempNews.findIndex(
          record => record.id === this.newsApi.lastNewsId
        );
        // this.logger.log('Index', index);
        this.newsApi.newsCount = index == 0 ? '' : index;
        this.logger.log('counter', this.newsApi.newsCount);
      });
    });
  }
}
