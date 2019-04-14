export class AccountTrade {
  BotTradeId: string;
  BuyDate: Date;
  ClosedWithin: string;
  GainPercent: number;
  SellDate: Date;
  Symbol: string;
}

export class StatsViewModel {
  BalanceGain: number;
  EndBalance: number;
  LossTrades: number;
  ProfitTrades: number;
  TradesCount: number;
  SelectedPeriod: number;
  StartBalance: number;
  TotalBalanceGainBTC: number;
  TotalBalanceGainUSD: number;
  TotalEndBalanceBTC: number;
  TotalEndBalanceUSD: number;
  TotalStartBalanceBTC: number;

  Trades: AccountTrade[];
}
