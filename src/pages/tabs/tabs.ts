import { Component, ViewChild } from '@angular/core';
import {
  InAppBrowser,
  InAppBrowserOptions
} from '@ionic-native/in-app-browser';
import { TranslateService } from '@ngx-translate/core';
import { ExternalLinkProvider } from '../../providers/external-link/external-link';
import { Logger } from '../../providers/logger/logger';
import { HomePage } from '../home/home';
import { ScanPage } from '../scan/scan';
import { SettingsPage } from '../settings/settings';
import { Tab3Page } from '../tab3/tab3';
import { Tab4Page } from '../tab4/tab4';
import { DatafeedPage } from '../trader/datafeed/datafeed';
/*import { Tab4Page } from '../tab4/tab4';*/
import { TopcoinsPage } from '../trader/topcoins/topcoins';

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
  tab3Root = SettingsPage;
  tab4Root = Tab3Page;
  datafeed = DatafeedPage;
  bcd4Root = Tab4Page;

  /*tab5Root = Tab4Page;*/
  constructor(
    private externalLinkProvider: ExternalLinkProvider,
    private translate: TranslateService,
    private logger: Logger,
    private iab: InAppBrowser
  ) {}

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
