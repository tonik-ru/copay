import { Component } from '@angular/core';
import { Logger } from '../../providers/logger/logger';
import { TraderProvider } from '../../providers/trader/trader';
// import { App, NavController, NavParams } from 'ionic-angular';
import { StatsViewModel } from '../../providers/trader/trader.types';

@Component({
  selector: 'page-userstats',
  templateUrl: 'userstats.html'
})
export class UserstatsPage {
  public selectedPeriod: number;
  public viewData: StatsViewModel;

  constructor(
    // private app: App,
    // private navCtrl: NavController,
    // private navParams: NavParams,
    private logger: Logger,
    private traderProvider: TraderProvider
  ) {
    this.selectPeriod(7);
  }

  ionViewDidLoad() {
    // 'console.log('ionViewDidLoad UserstatsPage');
  }

  public selectPeriod(period: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.selectedPeriod = period;
      this.traderProvider
        .getUserStats(period)
        .then(x => {
          this.viewData = x;
        })
        .catch(error => {
          // reject(error);
          this.logger.error(error);
        });
    });
  }
}
