import { Injectable } from '@angular/core';

import { hubConnection } from 'signalr-no-jquery';

// import $ from 'jquery';
// import * as _ from 'lodash';
// import {} from 'jquery';

import { ConfigProvider } from '../config/config';

// import { Observable } from 'rxjs';
// import { of } from 'rxjs/observable/of';

import { Logger } from '../logger/logger';

@Injectable()
export class FeedProvider {
  private static globalConnection: hubConnection;
  private hubProxy: any;
  public connection: hubConnection;

  constructor(private configProvider: ConfigProvider, private logger: Logger) {
    if (FeedProvider.globalConnection) FeedProvider.globalConnection.stop();

    let url = this.configProvider.get().trader.baseUrl + 'Trader.Web/signalr';
    this.connection = hubConnection(url);
    const hubProxy = this.connection.createHubProxy('tradeHub');

    this.hubProxy = hubProxy;

    //  proxy.server.subscribeToMarketTicks({ Exchange: exchange, Symbol: symbol, RowsCount: 10, Aggregation: 0.01, ResistanceFactor: 0.0, WallLinesCount: 5, })

    // connect
    // this.connection.start()
    // .done(() => { this.logger.log('Now connected, connection ID=' + this.connection.id); })
    // .fail(() => { this.logger.log('Could not connect'); });

    FeedProvider.globalConnection = this.connection;

    /*
    this.hubConnection
      .start()
      .then(() => this.logger.log('Connection started!'))
      .catch(err => this.logger.log('Error while establishing connection :('));
*/
    /*
      this.hubConnection.on(
      'sendToAll',
      (nick: string, receivedMessage: string) => {
        const text = `${nick}: ${receivedMessage}`;
        this.messages.push(text);
      }
    );
    */
  }

  public on(eventName: string, cb) {
    this.hubProxy.on(eventName, result => cb(result));
  }

  public stop() {
    FeedProvider.globalConnection.stop();
  }

  public connect(exchange: string, symbol: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.connection
        .start()
        .done(() => {
          this.logger.debug('Connection started. Subscribing');
          this.hubProxy
            .invoke('subscribeToMarketTicks', {
              Exchange: exchange,
              Symbol: symbol,
              RowsCount: 10,
              Aggregation: 0.01,
              ResistanceFactor: 0.0,
              WallLinesCount: 5
            })
            .done(() => resolve())
            .fail(() => reject('Failed to sibscribe'));
        })
        .fail(() => reject('Failed to start'));
    });
  }
}
