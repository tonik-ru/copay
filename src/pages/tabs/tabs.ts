import { Component, ViewChild } from '@angular/core';
import { HomePage } from '../home/home';
import { ScanPage } from '../scan/scan';
import { SettingsPage } from '../settings/settings';
import { TopcoinsPage } from '../trader/topcoins/topcoins';
// import { UserstatsPage } from '../trader/userstats/userstats';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  @ViewChild('tabs')
  tabs;

  homeRoot = HomePage;
  scanRoot = ScanPage;
  tab2Root = TopcoinsPage;
  tab3Root = SettingsPage;
  tab4Root = 'Tab3Page';
  tab5Root = 'Tab4Page';
}
