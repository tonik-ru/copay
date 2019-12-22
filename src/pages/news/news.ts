import { HttpClient } from '@angular/common/http';
import {
  animate,
  Component,
  ElementRef,
  Renderer,
  state,
  style,
  transition,
  trigger,
  ViewChild
} from '@angular/core';
import {
  Content,
  MenuController,
  NavController,
  NavParams
} from 'ionic-angular';

/*import { Observable } from 'rxjs';*/
import { Logger, PersistenceProvider } from '../../providers';
import { ApiProvider } from '../../providers/api/api';
import { FullpostPage } from './fullpost/fullpost';
import { NewsmenuPage } from './newsmenu/newsmenu';
import { NewssearchPage } from './newssearch/newssearch';

import { timer } from 'rxjs/observable/timer';

import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-news',
  templateUrl: 'news.html',
  animations: [
    trigger('fadeInUp', [
      state('void', style({ opacity: '0' })),
      state('*', style({ opacity: '1' })),
      transition('void <=> *', animate('150ms ease-in'))
    ])
  ]
})
export class TabNews {
  @ViewChild('pageTop') pageTop: Content;
  public items = [];
    public itemsNew = [];
  private per_page: number = 10;
  private page: number = 1;
  public showLoadMore: boolean = false;
  public isLoading: boolean = false;
  private category_id: number = 0;
  public cat_name_title: string = '';
  private sort: string = '0';
  searchQuery: string = '';
  fabToHide;
  private refreshTimer;
  refreshChecker;
  oldScrollTop: number = 10;

  lastNewsId;
  scrollindex;
  lastNewsIdTemp;
  endload: boolean = false;

  constructor(
    private renderer: Renderer,
    private element: ElementRef,
    public navCtrl: NavController,
    public navParams: NavParams,
    public http: HttpClient,
    public logger: Logger,
    public api: ApiProvider,
    public menuCtrl: MenuController,
    private persistenceProvider: PersistenceProvider,
    public storage: Storage
  ) {
    this.cat_name_title;

    if (
      this.navParams.get('cat_id') != null &&
      this.navParams.get('cat_id') != undefined
    ) {
      this.category_id = this.navParams.get('cat_id');
      this.cat_name_title = this.navParams.get('cat_name');
    } else {
      this.cat_name_title = 'Daily News';
    }
    // this.loadData();
  }

  loadD() {
    this.isLoading = true;
    let url: string =
      'posts?_embed&per_page=' + this.per_page + '&page=' + this.page;
    url += this.category_id != 0 ? '&categories=' + this.category_id : '';
    url +=
      this.sort == '1'
        ? '&order=asc'
        : this.sort == '2'
        ? '&order=title&order=asc'
        : this.sort == '3'
        ? '&order=title&order=desc'
        : '';
    url += this.searchQuery.length > 0 ? '&search=' + this.searchQuery : '';
    this.api.get(url).subscribe(
      (result: any[]) => {
        this.isLoading = false;
        this.items = this.items.concat(result);
        this.lastNewsId =
          this.lastNewsId == this.items[0].id
            ? this.items[0].id
            : this.lastNewsId;
        if (this.lastNewsId == this.items[0].id) {
          this.endload = true;
        }

        this.lastNewsIdTemp = this.items[0].id;
        if (result.length === this.per_page) {
          this.page++;
          this.showLoadMore = true;
        } else {
          this.showLoadMore = false;
        }
      },
      error => {
        this.isLoading = false;
        this.logger.log(error);
      }
    );
  }

  loadData(infiniteScroll = null, manualRef) {
    if (!this.isLoading) {
      this.isLoading = true;

      this.logger.log('Loading news');
      // this.page === 1;
      if (
        infiniteScroll !== null &&
        infiniteScroll.ionRefresh &&
        manualRef == false
      ) {
        this.page = 1;
        this.api.newsCount = '';
      }

      let url: string =
        'posts?_embed&per_page=' + this.per_page + '&page=' + this.page;
      url += this.category_id != 0 ? '&categories=' + this.category_id : '';
      url +=
        this.sort == '1'
          ? '&order=asc'
          : this.sort == '2'
          ? '&order=title&order=asc'
          : this.sort == '3'
          ? '&order=title&order=desc'
          : '';
      url += this.searchQuery.length > 0 ? '&search=' + this.searchQuery : '';
      this.logger.log('search', this.searchQuery);

      /*let data: Observable<any>; data =*/
      this.api.get(url).subscribe(
        (result: any[]) => {
          this.isLoading = false;
          if (manualRef == true) {
            this.items = result;
          } else if (infiniteScroll != null && infiniteScroll.ionRefresh) {
            this.items = result;
          } else {
            this.items = this.items.concat(result);
          }
          // this.items =
          // infiniteScroll != null && infiniteScroll.ionRefresh
          //  ? result
          //  : this.items.concat(result);

          this.lastNewsId =
            this.lastNewsId == this.items[0].id
              ? this.items[0].id
              : this.lastNewsId;
          if (this.lastNewsId == this.items[0].id) {
            this.endload = true;
          }

          this.lastNewsIdTemp = this.items[0].id;
          // if (this.items[0].id == val) {
          //   this.lastNewsId = val;
          // } else {
          //   this.lastNewsId = this.items[0].id;
          // }

          if (result.length === this.per_page) {
            this.page++;
            this.showLoadMore = true;
          } else {
            this.showLoadMore = false;
          }

          if (infiniteScroll != null) {
            infiniteScroll.complete();
          }
        },
        error => {
          this.isLoading = false;
          this.logger.log(error);
          if (infiniteScroll != null) {
            infiniteScroll.complete();
          }
        }
      );
    }
    this.showLoadMore;
  }

  loadNewData() {
    let url: string = 'posts?_embed&per_page=100&page=1';

    this.api.get(url).subscribe(
      (result: any[]) => {
        this.itemsNew = result;
        this.lastNewsIdTemp = this.itemsNew[0].id;

        this.logger.log('Updated new news');
        this.endload = true;
      },
      error => {
        this.logger.log(error);
      }
    );
  }

  onSearch() {
    this.items = [];
    this.loadData(null, false);
  }

  openFullPost(item) {
    this.persistenceProvider.getNewsLastDate().then(val => {
      let lastDt = val ? new Date(val) : new Date(2019, 1, 1);
      let itemDate = new Date(item.date);
      if (itemDate > lastDt) {
        this.persistenceProvider.setNewsLastDate(itemDate);
        // let unreadCount = _.fill(this.items, x => new Date(x.date) > lastDt)
        //  .length;
        // this.tabs.setUnreadItemsCount(unreadCount);
      }
    });

    this.navCtrl.push(FullpostPage, { post: item });
  }

  openMenu() {
    this.navCtrl.push(NewsmenuPage);
  }
  openSearch() {
    this.navCtrl.push(NewssearchPage);
  }

  changeSort() {
    this.logger.log(this.sort);
    this.items = [];
    this.showLoadMore = false;
    this.loadData(null, false);
  }
  public pageScroller() {
    // scroll to page top
    this.pageTop.scrollToTop();
  }

  ionViewDidLoad() {}

  ionViewWillEnter() {
    this.storage.get('lastNewsId').then(val => {
      // this.logger.log('Val,', val);

      this.lastNewsId = val;
      if (this.api.newsCount !== '100+') {
        this.page =
          this.api.newsCount !== ''
            ? Math.round(this.api.newsCount / this.per_page)
            : 1;
      } else if (this.api.newsCount == '100+') {
        this.page =
          this.api.newsCount !== '' ? Math.round(100 / this.per_page) : 1;
      }

      this.loadNewData();
      this.loadData(null, true);
    });

    this.logger.log('Page,', this.page);
    // this.refreshChecker = setInterval(() => {
    //   this.logger.log('NewsCoun ->', this.api.newsCount);
    //   if (this.api.newsCount >= 1) {

    //   }

    // }, 5000);
    if (this.api.newsCount !== '' && this.api.newsCount !== '100+') {
      this.scrollindex = this.api.newsCount * 102 - 200;
    } else if (this.api.newsCount == '100+') {
      this.scrollindex = 100 * 102 - 200;
    }
    this.fabToHide = this.element.nativeElement.getElementsByClassName(
      'fab'
    )[0];
    this.renderer.setElementStyle(
      this.fabToHide,
      'webkitTransition',
      'opacity 500ms'
    );
    this.renderer.setElementStyle(this.fabToHide, 'opacity', '0');
  }

  ngOnInit() {
    this.loadNewData();

    this.refreshTimer = timer(1, 15000).subscribe(() => this.loadNewData());
    this.loadData(null, true);
    this.loadNewData();
  }

  onContentScroll(e) {
    this.logger.log(
      'scrollindex',
      this.api.newsCount + '  ' + this.scrollindex,
      '-----',
      e.scrollTop
    );
    if (e.scrollTop !== null) {
      if (e.scrollTop - this.oldScrollTop > 10) {
        this.logger.log('DOWN');
        this.renderer.setElementStyle(this.fabToHide, 'opacity', '1');
      } else if (e.scrollTop - this.oldScrollTop < 0) {
        this.renderer.setElementStyle(this.fabToHide, 'opacity', '0');
        this.logger.log('UP');
      }

      if (e.scrollTop > this.scrollindex) {
        this.api.newsCount = '';
        this.logger.log('Counter = 0', this.api.newsCount);
        this.storage.set('lastNewsId', this.lastNewsIdTemp);
      }

      this.oldScrollTop = e.scrollTop;
    }
  }
  ionViewWillLeave() {
    if (this.refreshChecker) {
      clearInterval(this.refreshChecker);
    }
    this.refreshTimer.unsubscribe();
  }
  ionViewDidLeave() {
    if (this.refreshChecker) {
      clearInterval(this.refreshChecker);
    }
    this.refreshTimer.unsubscribe();
  }
  ngOnDestroy() {
    if (this.refreshChecker) {
      clearInterval(this.refreshChecker);
    }
    this.refreshTimer.unsubscribe();
  }

  testscroll(e) {
    this.logger.log(e.scrollTop);
  }
}
