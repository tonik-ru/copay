import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
// import { Logger } from '../../providers/logger/logger';
import { ConfigProvider } from '../config/config';

// import { Observable } from 'rxjs';
// import { of } from 'rxjs/observable/of';

// import { Logger } from '../logger/logger';
import { StatsViewModel } from './trader.types';

@Injectable()
export class TraderProvider {
  constructor(
    // private logger: Logger,
    private http: HttpClient,
    private configProvider: ConfigProvider
  ) { }

  public getUserStats(period: number): Promise<StatsViewModel> {
    var url =
      this.configProvider.get().trader.baseUrl +
      'ui/api/statsapi/GetBalances?period=' +
      period;
    return this.http.get<StatsViewModel>(url).toPromise();
  }

  public getPairs(): Promise<any[]> {
    var url =
      this.configProvider.get().trader.baseUrl +
      'Trader.Web/InfoService.svc/GetValidCalculators';
    return this.http.get<any[]>(url).toPromise();
  }

  public getTopCoins(): Promise<any[]> {
    var url =
      this.configProvider.get().trader.baseUrl + 'Trader.Web/InfoService.svc/GetTopCoins';
    return this.http
      .get<any[]>(url)
      .map(res => {
        let idx = 1;
        _.each(res, x => {
          if (x.Symbol == 'TOP20') {
            x.Position = 0;
          } else {
            x.Position = idx;
            idx = idx + 1;
          }
          x.IsIncreasing = x.PercentChange24h > 0;
        });
        return res;
      })
      .toPromise();
  }
}
