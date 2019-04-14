import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

// import { Logger } from '../../providers/logger/logger';
import { ConfigProvider } from '../config/config';

// import { Observable } from 'rxjs';
// import { of } from 'rxjs/observable/of';

import { StatsViewModel } from './trader.types';

@Injectable()
export class TraderProvider {
  constructor(
    // private logger: Logger,
    private http: HttpClient,
    private configProvider: ConfigProvider
  ) {}

  public getUserStats(period: number): Promise<StatsViewModel> {
      var url =
        this.configProvider.get().trader.baseUrl +
        'api/statsapi/GetBalances?period=' +
        period;
      return this.http
        .get<StatsViewModel>(url)
        .toPromise()
  }
 }