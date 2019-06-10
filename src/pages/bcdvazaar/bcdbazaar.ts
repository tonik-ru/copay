import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';

import { Logger } from '../../providers/logger/logger';
import { ShopTargetPage } from './shop-target/shop-target';

import * as _ from 'lodash';

/**
 * Generated class for the Tab4Page page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-bcdbazaar',
  templateUrl: 'bcdbazaar.html'
})
export class TabBcdbazaar {
  
  private shopDirectory = [
    {company: 'Acumotors', url: 'https://www.acumotors.com/', cat: 'Automotive', logo:'https://www.acumotors.com/Portals/3593/title-3.png', desc: 'Performance Parts for Japanese Cars' },
    {company: 'RPM Outlet', url: 'https://www.shoprpmoutlet.com/', cat: 'Automotive', logo:'https://www.shoprpmoutlet.com/Portals/6664/title-3.png', desc: 'Performance Parts for Japanese Cars' },
    {company: 'Poor Man Motorsports', url: 'https://www.poormanmotorsports.com/', cat: 'Automotive', logo:'https://www.poormanmotorsports.com/Portals/1504/title-8.png', desc: 'Performance Parts for Muscle Cars' },
    {company: 'Remus Exhaust Shop', url: 'https://www.remusexhaustshop.com/', cat: 'Automotive', logo:'https://www.remusexhaustshop.com/Portals/1372/title-8.png', desc: 'Performance Exhausts for Cars and Bikes' },
    {company: 'Ecco Warning Lights', url: 'https://www.eccowarninglights.com/', cat: 'Automotive', logo:'https://www.eccowarninglights.com/Portals/2750/title-6.png', desc: 'Automotive Safety Lighting' },
    {company: 'Remotes and Keys', url: 'https://www.remotesandkeys.com/', cat: 'Automotive', logo:'https://www.remotesandkeys.com/Portals/2757/title-14.png', desc: 'Automotive Car Remotes' },
    {company: 'Motorcity ATV', url: 'https://www.motorcityatv.com/', cat: 'Automotive', logo:'https://www.motorcityatv.com/Portals/9170/title-5.png', desc: 'ATV Replacement Parts' },
    {company: 'Vito\'s Performance', url: 'https://www.vitosperformance.com/', cat: 'Automotive', logo:'https://www.vitosperformance.com/Portals/9170/title-8.png', desc: 'ATV Replacement Parts' },
    {company: 'BCD Bazaar', url: 'https://www.bcdbazaar.com/', cat: 'Electronics', logo:'https://www.bcdbazaar.com/Portals/10730/title-4.png', desc: 'Top Sellers from Amazon' },
    {company: 'Pelican Cases', url: 'https://www.pelicancases.com/', cat: 'Electronics', logo:'https://www.pelicancases.com/files//feeds/2.png', desc: 'Protective Cases for Electronics' },
    {company: 'Rosetta Coffee', url: 'https://www.rosetta.coffee/', cat: 'Grocery', logo:'https://www.rosetta.coffee/Portals/5826/title.png', desc: 'Specialty Coffee' },
    {company: 'Exclusive X', url: 'https://www.exclusivex.com/', cat: 'Home Decor', logo:'https://www.exclusivex.com/Portals/10570/title-8.png', desc: 'Custom Decor for your Home' },
    {company: 'Mahones Wallpaper', url: 'https:/www.mahoneswallpapershop.com/', cat: 'Home Decor', logo:'https://www.mahoneswallpapershop.com/files//themecontent/logo.gif', desc: 'Designer Wallpapers for your Home' },
    {company: 'Marks Jewelers', url: 'https://www.marks-jewelers.com/', cat: 'Jewelry', logo:'https://www.marks-jewelers.com/Portals/6404/title-4.png', desc: 'Diamond Engagement Rings' },
    {company: 'Cool Charm Bracelets', url: 'https://www.coolcharmbracelets.com/', cat: 'Jewelry', logo:'https://www.coolcharmbracelets.com/Portals/10384/title-3.png', desc: 'Custom Charm Bracelets ' },
    {company: 'H&M Lighting', url: 'https://www.hmlighting.com/', cat: 'Lighting', logo:'https://www.hmlighting.com/Portals/10253/title-4.png', desc: 'Replacement Lights for your Home ' },
    {company: 'Semperlite', url: 'https://www.semperlite.com/', cat: 'Lighting', logo:'https://www.semperlite.com/Portals/6637/title-3.png', desc: 'Replacement Lights for your Home ' },
    {company: 'Worlds Hottest Bats', url: 'https://www.worldshottestbats.com/', cat: 'Sports', logo:'https://www.worldshottestbats.com/Portals/10725/title-4.png', desc: 'Re-engineered Baseball Bats' },
    
    
    
    ];
    private cats:any = [];
    private items:any = [];

  public selectedCat: string;
  public filter: string;

  constructor(public navCtrl: NavController, public navParams: NavParams, public logger: Logger,
    

    public viewCtrl: ViewController) {
      this.cats;
      this.items;
  }

  public selectShop(e, lg){
   
    this.navCtrl.push(ShopTargetPage, { shop: e, logo: lg });
  }

  ionViewWillEnter() {
    
    this.shopDirectory;
    this.cats =_.uniqBy(this.shopDirectory, 'cat');
    this.items = this.shopDirectory;
    
    this.selectedCat= 'all';
  }

  public applyFilterCat(){
    let val = this.selectedCat; // v.target.value;
    
    if (val && val.trim() != 'all') {
      this.items = this.shopDirectory.filter(item => {
        return item.cat.toLowerCase().indexOf(val.toLowerCase()) > -1;
      });
    } else this.items = this.shopDirectory;

    

  }

  public selectCat() {
    this.logger.log(this.selectedCat);
    this.filter = '';
    this.applyFilterCat();
  
  }
  public getStroes(){
   
    this.applyFilter();
   
  }

  public searhclick(){
    this.selectedCat= 'all';
  }

  applyFilter() {
    let val = this.filter; // v.target.value;
   
   
    if (val && val.trim() != '') {
      this.items = this.shopDirectory.filter(item => {
        return item.company.toLowerCase().indexOf(val.toLowerCase()) > -1;
      });
       } else this.items = this.shopDirectory;
       
  }

  ionViewDidLoad() {}
  clearSearch() {
    this.selectedCat= 'all';
  }
}
