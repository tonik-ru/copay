import { Component, ViewChild } from '@angular/core';
import {
  AlertController,
  NavController,
  NavParams,
  Slides
} from 'ionic-angular';

import { FormatUtils } from '../topcoins/formatutils';

// import { ProfileProvider } from '../../../providers';

import { Logger } from '../../../providers/logger/logger';
import { FeedProvider } from '../../../providers/trader/feed';

import * as $ from 'jquery';
/*import { pairs } from 'rxjs/observable/pairs';*/

import '../../../assets/js/rang';
import { TopcoinsPage } from '../topcoins/topcoins';
declare var startgraph: any;
/*declare var starttest: any;*/

// import { TraderProvider } from '../../../providers/trader/trader';

/**
 * Generated class for the DatafeedPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-datafeed',
  templateUrl: 'datafeed.html'
})
export class DatafeedPage {
  public selectedPair;
  public pairs = [];

  private knownIntervals = [
    { Caption: '0.001', TimeSpan: '00:01:00', Name: '1 min', isVisible: false },
    { Caption: '0.003', TimeSpan: '00:03:00', Name: '3 min', isVisible: false },
    { Caption: '0.005', TimeSpan: '00:05:00', Name: '5 min', isVisible: false },
    { Caption: '0.01', TimeSpan: '00:15:00', Name: '15 min', isVisible: false },
    { Caption: '0.03', TimeSpan: '00:30:00', Name: '30 min', isVisible: false },
    { Caption: '0.04', TimeSpan: '00:45:00', Name: '45 min', isVisible: false },
    { Caption: '0.1', TimeSpan: '01:00:00', Name: '1 hr', isVisible: true },
    { Caption: '0.2', TimeSpan: '02:00:00', Name: '2 hr', isVisible: false },
    { Caption: '0.4', TimeSpan: '04:00:00', Name: '4 hr', isVisible: true },
    { Caption: '0.6', TimeSpan: '06:00:00', Name: '6 hr', isVisible: false },
    { Caption: '0.9', TimeSpan: '09:00:00', Name: '9 hr', isVisible: false },
    { Caption: '0.12', TimeSpan: '12:00:00', Name: '12 hr', isVisible: false },
    { Caption: '1', TimeSpan: '1.00:00:00', Name: '1 day', isVisible: true },
    { Caption: '2', TimeSpan: '2.00:00:00', Name: '2 days', isVisible: true },
    { Caption: '3', TimeSpan: '3.00:00:00', Name: '3 days', isVisible: false },
    { Caption: '7', TimeSpan: '7.00:00:00', Name: '7 days', isVisible: true },
    {
      Caption: '14',
      TimeSpan: '14.00:00:00',
      Name: '14 days',
      isVisible: false
    },
    {
      Caption: '30',
      TimeSpan: '30.00:00:00',
      Name: '30 days',
      isVisible: true
    },
    {
      Caption: '45',
      TimeSpan: '45.00:00:00',
      Name: '45 days',
      isVisible: false
    },
    {
      Caption: '60',
      TimeSpan: '60.00:00:00',
      Name: '60 days',
      isVisible: false
    },
    {
      Caption: '90',
      TimeSpan: '90.00:00:00',
      Name: '90 days',
      isVisible: false
    }
  ];

  public resistanceData = [];
  public lastTradePrice = 0.0;
  public priceTick = {
    lastTradePrice: 0.0,
    prevLastTradePrice: 0.0,
    lastTradePriceFormatted: '-',
    prevLastTradePriceFormatted: '-'
  };

  // $scope.currentPair = null;
  public decimals = 2;
  public selectedInterval = this.knownIntervals[8];
  public currentData = {};
  public d = null;
  public positiveKeys = ['7', '6', '5', '4', '3', '2', '1'];
  public negativeKeys = ['-1', '-2', '-3', '-4', '-5', '-6', '-7'];

  private lastTickData = null;
  // private connectedPair = {};

  public myPair: {};

  @ViewChild('slider') slider: Slides;
  showlook = '0';

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private logger: Logger, // private traderProvider: TraderProvider
    private feedProvider: FeedProvider,
    public alertController: AlertController
  ) {
    this.feedProvider.on('ProcessMarketTick', x => this.processMarketTick(x));
    this.feedProvider.on('ProcessResistance', x => this.onProcessResistance(x));
    this.showlook = '0';
  }
  async showInfoCurrentPrizeZone() {
    const alert = await this.alertController.create({
      title: 'Current Price Zone',
      message:
        'Current Price Zone: Shows the current price location on a Fibonacci retracement of the specified interval. Fibonacci retracement is created by taking two extreme points of the lowest price and highest price within the specified interval. The normal range is between -100% to 100%, during high volatility this range can range between -300% to 300%.',
      buttons: ['OK']
    });

    await alert.present();
  }
  async showInfoCurrentSwingRatio() {
    const alert = await this.alertController.create({
      title: 'Current Swing Ratio',

      message:
        'Current Swing Ratio: Shows the market trend of the price increasing or decreasing over time within the specified interval. The range can be between -7 to +7. A swing ratio greater than 1 is likely to continue increasing the price of the asset, while a swing ratio less than -1 is likely to continue decreasing the price of the asset.',
      buttons: ['OK']
    });
    await alert.present();
  }
  async showInfoBrakeDown() {
    const alert = await this.alertController.create({
      title: 'Last Breakdown',

      message:
        'Last Breakdown: Shows how many attempts the price tried to break-down from the lowest support recorded on the specified interval, and when was the last attempt. Typically, if the price can’t break-down it will attempt to break-out after some time.',
      buttons: ['OK']
    });

    await alert.present();
  }
  async showInfoBrakeOut() {
    const alert = await this.alertController.create({
      title: 'Last Breakout',

      message:
        'Last Breakout:  Shows how many attempts the price tried to break-out from the highest resistance recorded on the specified interval, and when was the last attempt. Typically, if the price can’t break-out it will attempt to break-down after som',
      buttons: ['OK']
    });

    await alert.present();
  }
  ionViewWillEnter() {
    this.logger.log('Starting feed');
    var pairs = [];
    pairs = this.navParams.data.validPairs;
    this.pairs = pairs.sort(this.compareByUSDT);
    this.selectedPair = this.pairs[0];
    this.startConnection();
  }
  selectedTab(index) {
    this.slider.slideTo(index);
  }
  ngAfterViewInit() {
    $('#showmore').click(() => {
      $('#moretime').toggleClass('showmore');
      $('#standart').toggleClass('hider');
      if ($('#showmore i').hasClass('fas fa-plus')) {
        $('#showmore i')
          .removeClass('fas fa-plus')
          .addClass('fas fa-minus');
      } else {
        $('#showmore i')
          .removeClass('fas fa-minus')
          .addClass('fas fa-plus');
      }
    });
    $('#showmore2').click(() => {
      $('#moretime2').toggleClass('showmore');
      $('#standart2').toggleClass('hider');
      if ($('#showmore2 i').hasClass('fas fa-plus')) {
        $('#showmore2 i')
          .removeClass('fas fa-plus')
          .addClass('fas fa-minus');
      } else {
        $('#showmore2 i')
          .removeClass('fas fa-minus')
          .addClass('fas fa-plus');
      }
    });
  }

  private processMarketTick(data) {
    this.logger.log(data);

    if (this.resistanceData.length == 0) return;

    this.logger.log('ProcessMarketTick');

    var lastTradePriceFormatted = FormatUtils.formatPrice(data.LastTradePrice);
    if (this.priceTick.lastTradePriceFormatted != lastTradePriceFormatted) {
      this.priceTick.prevLastTradePrice = this.priceTick.lastTradePrice;
      this.priceTick.prevLastTradePriceFormatted = this.priceTick.lastTradePriceFormatted;
    }
    this.priceTick.lastTradePriceFormatted = lastTradePriceFormatted;
    this.priceTick.lastTradePrice = data.LastTradePrice;
    this.lastTradePrice = data.LastTradePrice;

    this.lastTickData = data;

    this.populateFromTickData(this.resistanceData, data);
    this.updateResistanceLevels();
    this.logger.log('done ProcessMarketTick');
  }

  private onProcessResistance(data) {
    this.logger.log('ProcessResistance');

    this.processResistance(data);

    this.populateFromTickData(this.resistanceData, this.lastTickData);

    this.updateResistanceLevels();

    this.d = this.currentData;
  }

  private processLevelTouchDates(rdi, resLevelsTouchDates) {
    if (!resLevelsTouchDates) return;

    var lti = resLevelsTouchDates[rdi.Interval.TimeSpan];
    if (lti) {
      for (let k = 1; k <= 7; k++) {
        this.processLevelTouchDate(rdi, lti, k);
      }
      for (let k = -7; k <= -1; k++) {
        this.processLevelTouchDate(rdi, lti, k);
      }

      var d = Date.parse(lti[100].Date);
      var ageSeconds = (Date.now() - d) / 1000;
      rdi.Breakout = {
        Count: lti[100].Count,
        Age: FormatUtils.formatTimeSpan(ageSeconds)
      };

      d = Date.parse(lti[-100].Date);
      ageSeconds = (Date.now() - d) / 1000;
      rdi.Breakdown = {
        Count: lti[-100].Count,
        Age: FormatUtils.formatTimeSpan(ageSeconds)
      };
    }
  }

  private populateFromTickData(resistanceData, tickData) {
    if (!tickData) return;
    if (resistanceData.length == 0) return;

    var data = tickData;

    var resLevelsTouchDates =
      data.ResistanceTick && data.ResistanceTick.LevelTouchTimes;
    // if (resLevelsTouchDates)
    //    return;

    var rd = resistanceData;
    for (var i = 0; i < rd.length; i++) {
      var rdi = rd[i];

      this.processLevelTouchDates(rdi, resLevelsTouchDates);

      this.processSpeedometers(rdi, data.ResistanceTick.Speedometers);

      var avgIntervals = data.ResistanceTick.AvgIntData;
      if (avgIntervals) {
        var curVal = avgIntervals[rdi.Interval.Caption];
        if (curVal) {
          rdi.AvgIntData = curVal ? curVal : { Current: 0, Prev: 0 };
        }
      }

      this.processPositionPercents(rdi, data.ResistanceTick.PositionPercents);

      // if (!rdi.data[100]) {
      //    rdi.data[100] = {};
      //    rdi.data[-100] = {};
      // }

      // var d = Date.parse(resLevelsTouchDates[rdi.Interval.TimeSpan][100].Date);
      // if (d > -10000) {
      //    var ageSeconds = (Date.now() - d) / 1000;
      //    rdi.Data[100].Count = lti[100].Count;
      //    rdi.Data[100].Age = formatTimeSpan(ageSeconds);
      // }
    }
  }

  private processSpeedometers(rdi, speedometers) {
    if (!speedometers) return;

    var curVal = speedometers.Speedometers[rdi.Interval.TimeSpan];
    if (!curVal) return;
    if (!rdi.Speedometer) rdi.Speedometer = { PrevData: {} };

    rdi.Speedometer.Score = curVal.Score;
    var str = '';
    curVal.Details.forEach(item => {
      str += item.Param + '=' + item.Value + ' Score=' + item.Score + '\n';
    });
    rdi.Speedometer.DetailsString = str;

    if (
      speedometers.PrevPeriodSpeedometers &&
      Object.keys(speedometers.PrevPeriodSpeedometers).length > 0
    ) {
      var val = speedometers.PrevPeriodSpeedometers[rdi.Interval.TimeSpan];
      str = '';
      curVal.Details.forEach(item => {
        str += item.Param + '=' + item.Value + ' Score=' + item.Score + '\n';
      });

      rdi.Speedometer.PrevData.Score = val.Score;
      rdi.Speedometer.PrevData.DetailsString = str;
    }
  }

  private processPositionPercents(rdi, positionPercents) {
    if (!positionPercents) return;
    var curVal = positionPercents[rdi.Interval.TimeSpan];
    if (curVal) {
      var tmpPP = curVal * 100;
      if (rdi.PositionPercent && rdi.PositionPercent != tmpPP)
        rdi.PrevPositionPercent = rdi.PositionPercent;
      rdi.PositionPercent = tmpPP;
      if (!rdi.PrevPositionPercent)
        rdi.PrevPositionPercent = rdi.PositionPercent;
    }
  }

  private updateResistanceLevels() {
    if (!this.currentData) return;

    var rdi = this.currentData;

    this.updateResistanceLevel(rdi, 1);
    this.updateResistanceLevel(rdi, -1);
  }

  private updateResistanceLevel(rdi, sign) {
    var lastTradePrice = this.priceTick.lastTradePrice;
    var levelFound = false;

    for (var k = 1; k <= 7; k++) {
      var ks = (k * sign).toString();

      rdi.Data[ks].IsPriceInRange =
        sign == 1
          ? (lastTradePrice <= rdi.Data[ks].FullValue &&
              rdi.Data[ks].FullValue > 0) ||
            k == 7
          : (lastTradePrice >= rdi.Data[ks].FullValue &&
              rdi.Data[ks].FullValue > 0) ||
            k == 7;

      rdi.Data[ks].IsCurrent = false;
      if (rdi.Data[ks].IsPriceInRange && !levelFound) {
        levelFound = true;
        rdi.Data[ks].IsCurrent = true;
      }
    }
  }

  private startConnection(): Promise<any> {
    this.cleanupPrevData();

    this.myPair = this.pairs[0];
    this.logger.log(this.myPair as string);

    return new Promise((resolve) => {
      let p = this.selectedPair;
      return this.feedProvider
        .connect(
          this.selectedPair.Exchange,
          this.selectedPair.Symbol
        )
        .then(() => {
          // this.connectedPair = p;
          this.decimals =
            p.Precision == 0
              ? 0
              : Math.round(Math.log(1 / p.Precision) / Math.LN10);

          setTimeout(() => {
            this.logger.log('--------START Animation ---------');
            new startgraph(1);
          }, 1500);
      
          resolve();
        });
    }).catch(error => this.logger.error(error));
  }

  ionViewDidLoad() {}

  ionViewWillLeave() {
    this.feedProvider.stop();
    this.logger.log('EXIT');

    new startgraph(2);
  }

  cleanupPrevData() {
    this.resistanceData = [];
    this.lastTradePrice = 0.0;
    this.priceTick = {
      lastTradePrice: 0.0,
      prevLastTradePrice: 0.0,
      lastTradePriceFormatted: '-',
      prevLastTradePriceFormatted: '-'
    };
    this.currentData = {};
    this.d = null;
  }

  // append CustomIntervals.
  private processCustomIntervals(data) {
    if (!data.CustomIntervals) return;

    var values = data.Values;
    var rd = this.resistanceData;
    for (var i = 0; i < data.CustomIntervals.length; i++) {
      var idx = this.knownIntervals.length + i;
      var rdi = rd[idx];
      if (!rdi) {
        rdi = {
          Idx: idx,
          Interval: data.CustomIntervals[i],
          IntervalName: data.CustomIntervals[i].Name,
          Data: {},
          EMAs: {},
          AvgIntData: { Current: 0, Prev: 0 }
        };
        rd[idx] = rdi;
      }

      if (rdi.Interval == this.selectedInterval) this.currentData = rdi;

      for (var k = 1; k <= 6; k++) {
        rdi.Data[k.toString()] = {
          Value: FormatUtils.formatPrice(0),
          FullValue: 0,
          IsPriceInRange: false
        };
        rdi.Data[(-k).toString()] = {
          Value: FormatUtils.formatPrice(0),
          FullValue: 0,
          IsPriceInRange: false
        };
      }

      var keys = ['-7', '7'];
      for (let k = 0; k < keys.length; k++) {
        /*let key = `${-(i + 1)}@${keys[k]}`;*/
        let key = `${-(i + 1)}@${keys[k]}`;

        rdi.Data[keys[k]] = {
          Value: FormatUtils.formatPrice(values[key]),
          FullValue: values[key],
          IsPriceInRange: true
        };
      }
    }
  }

  private processResistance(data) {
    var rd = this.resistanceData;

    var values = data.Values;
    var hits = data.Hits;
    var lastTradePrice = this.priceTick.lastTradePrice;

    for (var i = 0; i < this.knownIntervals.length; i++) {
      var rdi = rd[i];
      // if (rdi)
      //    rdi.PrevData = null;
      if (!rdi) {
        rdi = {
          Idx: i,
          Interval: this.knownIntervals[i],
          IntervalName: this.knownIntervals[i].Name,
          Data: {},
          EMAs: {},
          AvgIntData: { Current: 0, Prev: 0 }
        };
        rd[i] = rdi;
      }

      if (rdi.Interval == this.selectedInterval) this.currentData = rdi;

      for (var k = 1; k <= 7; k++) {
        var keyPositive = this.knownIntervals[i].Caption + '@' + k;
        var keyNegative = this.knownIntervals[i].Caption + '@' + -k;

        rdi.Data[k.toString()] = {
          Value: FormatUtils.formatPrice(values[keyPositive]),
          FullValue: values[keyPositive],
          IsPriceInRange: lastTradePrice <= values[keyPositive] || k == 7
        };

        rdi.Data[(-k).toString()] = {
          Value: FormatUtils.formatPrice(values[keyNegative]),
          FullValue: values[keyNegative],
          IsPriceInRange: lastTradePrice >= values[keyNegative] || k == 7
        };

        if (k > 1) {
          rdi.Data[k.toString()].Hits = hits[keyPositive];
          rdi.Data[(-k).toString()].Hits = hits[keyNegative];
        } else {
          rdi.Data[k.toString()].Hits = 0;
          rdi.Data[(-k).toString()].Hits = 0;
        }
      }
      var indicators = data.IndicatorResults;
      if (indicators) {
        var emas = indicators.EMAValues;
        if (emas) {
          for (var emaParam in emas) {
            rdi.EMAs[emaParam] =
              emas[emaParam][this.knownIntervals[i].TimeSpan];
          }
        }
      }
    }

    this.processCustomIntervals(data);
  }

  private processLevelTouchDate(rdi, lti, k) {
    var d = Date.parse(lti[k].Date);
    if (d > -10000) {
      var ageSeconds = (Date.now() - d) / 1000;
      rdi.Data[k].Count = lti[k].Count;
      rdi.Data[k].Age = FormatUtils.formatTimeSpan(ageSeconds);
    }
  }

  public selectInterval(interval) {
    var rd = this.resistanceData;
    this.selectedInterval = interval;
    if (this.resistanceData.length > 0) {
      this.currentData = this.resistanceData[interval.Idx];
      for (var i = 0; i < rd.length; i++) {
        if (rd[i].Interval == this.selectedInterval) {
          this.currentData = rd[i];
          this.d = rd[i];
          this.updateResistanceLevels();
          break;
        }
      }
    }
  }

  public selectPair(pair) {
    this.selectedPair = pair;
    this.startConnection();
  }

  public formatPair(pair) {
    return this.formatPairImp(pair);
  }

  public formatPairImp(pair) {
    /*return pair.Symbol + '@' + pair.Exchange;*/
    return pair.Symbol;
  }
  public onClickCancel() {
    this.navCtrl.setRoot(TopcoinsPage);
  }
  /*
function compareByDisplayName(a, b) {
    var str1 = formatPairImp(a);
    var str2 = formatPairImp(b);
    return str1.localeCompare(str2);
}
*/

  private compareByUSDT(a, b) {
    if (a.Symbol.indexOf('USD') > -1) return -1;
    if (b.Symbol.indexOf('USD') > -1) return 1;

    return a.Symbol.localeCompare(b.Symbol);
  }
}
