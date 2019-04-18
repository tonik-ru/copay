import { Component } from '@angular/core';
import { ProfileProvider } from '../../../providers';
import { Logger } from '../../../providers/logger/logger';
import { TraderProvider } from '../../../providers/trader/trader';
// import { App, NavController, NavParams } from 'ionic-angular';
import { StatsViewModel } from '../../../providers/trader/trader.types';

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
    private profileProvider: ProfileProvider,
    private logger: Logger,
    private traderProvider: TraderProvider
  ) {
    this.selectPeriod(7);
  }

  ionViewDidLoad() {
    // 'console.log('ionViewDidLoad UserstatsPage');
  }

  public selectPeriod(period: number): Promise<any> {
    return new Promise(() => {
      this.selectedPeriod = period;
      this.traderProvider
        .getUserStats(period)
        .then(x => {
          this.viewData = x;
          this.updateWallets();
        })
        .catch(error => {
          // reject(error);
          this.logger.error(error);
        });
    });
  }

  public updateWallets() {
    var wallets = this.profileProvider.getWallets();
    this.logger.log(wallets.toString());
    this.viewData.TotalBalanceUSD = 199.32;
  }
}
