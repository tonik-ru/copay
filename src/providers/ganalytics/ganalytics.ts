import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Logger } from '../logger/logger';
import { PersistenceProvider } from '../persistence/persistence';

/*
  Generated class for the GanalyticsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
declare var ga: any;

@Injectable()
export class GAnalyticsProvider {
  constructor(
    public http: HttpClient,
    private logger: Logger,
    private persistenceProvider: PersistenceProvider
  ) {
    this.logger.debug('Starting GA');
  }

  startTrackerWithId(id) {
    this.persistenceProvider
      .getGAClientId()
      .then(clientId => {
        ga('create', {
          storage: 'none',
          trackingId: id,
          clientId
        });
        ga('set', 'appName', 'BCDPay');
        ga('set', 'checkProtocolTask', null);
        ga('set', 'transportUrl', 'https://www.google-analytics.com/collect');
        ga(tracker => {
          if (!clientId) {
            this.persistenceProvider.setGAClientId(tracker.get('clientId'));
          }
        });
      })
      .catch(ex => {
        this.logger.log(ex);
      });
  }

  trackView(screenName) {
    this.logger.log(screenName);
    ga('set', 'page', screenName);
    ga('send', 'pageview');
  }
  trackEvent(category, action, label?, value?) {
    ga('send', 'event', {
      eventCategory: category,
      eventLabel: label,
      eventAction: action,
      eventValue: value
    });
  }
}
