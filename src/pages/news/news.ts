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
  private per_page: number = 10;
  private page: number = 1;
  private showLoadMore: boolean = false;
  private isLoading: boolean = false;
  private category_id: number = 0;
  public cat_name_title: string = '';
  private sort: string = '0';
  searchQuery: string = '';
  fabToHide;

  oldScrollTop: number = 0;

  constructor(
    private renderer: Renderer,
    private element: ElementRef,
    public navCtrl: NavController,
    public navParams: NavParams,
    public http: HttpClient,
    public logger: Logger,
    public api: ApiProvider,
    public menuCtrl: MenuController,
    private persistenceProvider: PersistenceProvider
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

  loadData(infiniteScroll = null) {
    if (!this.isLoading) {
      this.isLoading = true;

      this.logger.log('Loading news');

      if (infiniteScroll != null && infiniteScroll.ionRefresh) {
        this.page = 1;
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

      /*let data: Observable<any>; data =*/
      this.api.get(url).subscribe(
        (result: any[]) => {
          this.isLoading = false;
          this.items =
            infiniteScroll != null && infiniteScroll.ionRefresh
              ? result
              : this.items.concat(result);
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

  onSearch() {
    this.items = [];
    this.loadData();
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
    this.loadData();
  }
  public pageScroller() {
    // scroll to page top
    this.pageTop.scrollToTop();
  }

  ionViewDidLoad() {}

  ionViewWillEnter() {
    this.loadData();
  }

  ngOnInit() {
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

  onContentScroll(e) {
    if (e.scrollTop - this.oldScrollTop > 10) {
      this.logger.log('DOWN');
      this.renderer.setElementStyle(this.fabToHide, 'opacity', '1');
    } else if (e.scrollTop - this.oldScrollTop < 0) {
      this.renderer.setElementStyle(this.fabToHide, 'opacity', '0');
      this.logger.log('UP');
    }
    this.oldScrollTop = e.scrollTop;
  }
}