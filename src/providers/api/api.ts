import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Logger } from '../logger/logger';
import { PersistenceProvider } from '../persistence/persistence';

import * as _ from 'lodash';

/*
  Generated class for the ApiProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ApiProvider {
  private API_URL: string =
    'https://dailynews.bitcoindiamond.org/wp-json/wp/v2/';
  public Categories: any = [];
  public unreadNewsCount = 0;
  public items = [];

  tempNews: any = [];
  lastNewsId;
  counetNews;

  constructor(
    public http: HttpClient,
    private logger: Logger,
    private persistenceProvider: PersistenceProvider
  ) {}

  get(query: string = '') {
    return this.http.get(this.API_URL + query);
  }

  getCategories() {
    this.get('categories?_embet&per_page=100').subscribe(data => {
      this.Categories = data;
    });
  }
  getCatName(cat_id: number) {
    let cat_name: string = '';

    this.Categories.forEach(elements => {
      if (elements.id == cat_id) {
        cat_name = elements.name;
      }
    });

    return cat_name;
  }

  getUnreadNewsCount(): Promise<number> {
    return new Promise<number>(resolve => {
      this.persistenceProvider
        .getNewsLastDate()
        .then(val => {
          let lastDt = val ? new Date(val) : new Date(2019, 1, 1);
          let url = 'posts?_embed&after=' + lastDt.toISOString();
          this.get(url).subscribe((data: any[]) => {
            let unreadCount = _.filter(data, x => new Date(x.date) > lastDt)
              .length;
            this.logger.log('Unread news: ' + unreadCount);
            this.unreadNewsCount = unreadCount;
            resolve(unreadCount);
          });
        })
        .catch(ex => this.logger.log(ex));
    });
  }
}
