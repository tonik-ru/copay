import { Component, EventEmitter, Output } from '@angular/core';

// Providers
import { AppProvider, Logger, PersistenceProvider } from '../../../providers';

@Component({
  selector: 'page-eth-live-card',
  templateUrl: 'eth-live-card.html'
})
export class EthLiveCardPage {
  @Output() addEthClicked = new EventEmitter<any>();

  public showEthLiveCard: boolean;
  public appName: string;
  constructor(
    private logger: Logger,
    private persistenceProvider: PersistenceProvider,
    private appProvider: AppProvider
  ) {
    this.showEthLiveCard = false;
    this.appName = this.appProvider.info.nameCase;
  }

  public setShowEthLiveCard(value) {
    this.showEthLiveCard = value;
  }

  public hideCard(): void {
    this.showEthLiveCard = false;
    this.logger.debug('ETH live card dismissed.');
    this.persistenceProvider.setEthLiveCardFlag();
  }

  public goToAddWalletFlow(): void {
    this.addEthClicked.next();
    this.hideCard();
  }
}
