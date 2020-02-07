export class FormatUtils {
  static round(decimal: number, decimalPoints: number): number {
    let roundedValue =
      Math.round(decimal * Math.pow(10, decimalPoints)) /
      Math.pow(10, decimalPoints);

    return roundedValue;
  }

  static formatPrice(val: number, decimals: number = 2) {
    var v2 = val;
    if (val > 1000000000) {
      v2 = val / 1000000;
      decimals = 0;
    } else if(( val > 1000000) &&  (val < 1000000000)){
      v2 = val / 1000;
      decimals = 2;
    }
//              100000000
// BHW          255663435.17644638
// Top Coins 232461027108.89178
// TOP formated: 232,461
  
    // if (val < 10) decimals = 4;
    var final = FormatUtils.formatMoney(v2, decimals)
    return val >= 1000000000 ? final+'B' : ( val > 1000000) &&  (val < 1000000000) ? final + 'M'  : final ;
  }

  static formatMoney(n, c) {
    if (c > 0)
      return Number(n)
        .toFixed(c)
        .replace(/\d(?=(\d{3})+\.)/g, '$&,');
    else
      return Number(n)
        .toFixed(c)
        .replace(/\d(?=(\d{3})+$)/g, '$&,');
  }

  static formatTimeSpan(ts) {
    if (ts < 1) return 'now';
    if (ts < 60) return Math.floor(ts) + 's';
    if (ts < 60 * 60) return Math.floor(ts / 60) + 'm';
    if (ts < 24 * 60 * 60) return Math.floor(ts / 60 / 60) + 'h';
    else return Math.floor(ts / 60 / 60 / 24) + 'd';
  }
}
