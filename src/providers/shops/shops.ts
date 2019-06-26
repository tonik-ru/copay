import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/*
  Generated class for the ShopsProvider provider.
  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ShopsProvider {
  public shopDirectory = [];
  private updatedOn: number;

  constructor(public http: HttpClient) {}

  public getDirectory(): Promise<any> {
    let now = Math.floor(Date.now() / 1000);
    if (this.updatedOn + 600 > now) return Promise.resolve();

    var url = 'https://websocket.rekdeck.com/bcdpay/storedata.json';
    return this.http
      .get<any[]>(url)
      .toPromise()
      .then(data => {
        this.shopDirectory = data;
        this.updatedOn = Math.floor(Date.now() / 1000);
        return data;
      });
  }
}
