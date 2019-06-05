import { Component, ViewChild } from '@angular/core';
import {
  InAppBrowser,
  InAppBrowserOptions
} from '@ionic-native/in-app-browser';
import { TranslateService } from '@ngx-translate/core';
import { ExternalLinkProvider } from '../../providers/external-link/external-link';
import { Logger } from '../../providers/logger/logger';
import { TabBcdbazaar } from '../bcdvazaar/bcdbazaar';
import { HomePage } from '../home/home';
import { TabNews } from '../news/news';
import { ScanPage } from '../scan/scan';
// import { SettingsPage } from '../settings/settings';
import { DatafeedPage } from '../trader/datafeed/datafeed';
/*import { Tab4Page } from '../tab4/tab4';*/
import { TopcoinsPage } from '../trader/topcoins/topcoins';

import { LiveChatPage } from '../settings/live-chat/live-chat';

// import { timer } from 'rxjs/observable/timer';

// import { ApiProvider } from '../../providers/api/api';

// import { UserstatsPage } from '../trader/userstats/userstats';

@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html'
})
export class TabsPage {
  @ViewChild('tabs')
  tabs;
  options: InAppBrowserOptions = {
    location: 'yes', // Or 'no'
    hidden: 'no', // Or  'yes'
    clearcache: 'yes',
    clearsessioncache: 'yes',
    zoom: 'yes', // Android only ,shows browser zoom controls
    hardwareback: 'yes',
    mediaPlaybackRequiresUserAction: 'no',
    shouldPauseOnSuspend: 'no', // Android only
    closebuttoncaption: 'Close', // iOS only
    disallowoverscroll: 'no', // iOS only
    toolbar: 'yes', // iOS only
    enableViewportScale: 'no', // iOS only
    allowInlineMediaPlayback: 'no', // iOS only
    presentationstyle: 'pagesheet', // iOS only
    fullscreen: 'yes' // Windows only
  };

  homeRoot = HomePage;
  scanRoot = ScanPage;
  tab2Root = TopcoinsPage;
  tab3Root = LiveChatPage;
  tab4Root = TabNews;
  datafeed = DatafeedPage;
  bcd4Root = TabBcdbazaar;

  // private refreshTimer;
  private unreadNewsCount = 0;

  /*tab5Root = Tab4Page;*/
  constructor(
    private externalLinkProvider: ExternalLinkProvider,
    private translate: TranslateService,
    private logger: Logger,
    private iab: InAppBrowser
  ) {
    // this.refreshTimer = timer(15000, 15000).subscribe(() =>
    //   this.updateNewsCount()
    // );
    // this.refreshTimer = this.refreshTimer;
  }

  public setUnreadItemsCount(itemsCount) {
    this.unreadNewsCount = itemsCount;
  }

  /*
  private updateNewsCount() {
    this.newsApi.getUnreadNewsCount().then(val => {
      this.unreadNewsCount = val;
    });
  }
*/

  public getUnreadNewsCount() {
    return this.unreadNewsCount > 0 ? this.unreadNewsCount.toString() : '';
  }

  public openBcdBazaar1() {
    this.logger.log('open bcdbazaar');
    const url = 'https://www.bcdbazaar.com';
    const optIn = true;
    const title = null;
    const message = this.translate.instant('BCZBazaar');
    const okText = this.translate.instant('Open');
    const cancelText = this.translate.instant('Go Back');
    this.externalLinkProvider.open(
      url,
      optIn,
      title,
      message,
      okText,
      cancelText
    );
  }
  public openBcdBazaar() {
    let target = '_self';
    let url = 'https://www.bcdbazaar.com';
    this.iab.create(url, target, this.options);

    /*const browser = this.iab.create('https://www.bcdbazaar.com');
    browser.show();*/
  }
}
