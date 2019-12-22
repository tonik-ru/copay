import { Injectable } from '@angular/core';

// Providers
import { BwcProvider } from '../../providers/bwc/bwc';
import { Logger } from '../../providers/logger/logger';

export interface CoinNetwork {
  coin: string;
  network: string;
}
@Injectable()
export class AddressProvider {
  private bitcore;
  private bitcoreCash;
  private bitcoreDiamond;
  private core;

  constructor(private bwcProvider: BwcProvider,  public logger: Logger) {
    this.bitcore = this.bwcProvider.getBitcore();
    this.bitcoreCash = this.bwcProvider.getBitcoreCash();
    this.bitcoreDiamond = this.bwcProvider.getBitcoreDiamond()
    this.core = this.bwcProvider.getCore();
  }

  public extractAddress(str: string): string {
    const extractedAddress = str.replace(/^[a-z]+:/i, '').replace(/\?.*/, '');
    return extractedAddress;
  }

  public getCoinAndNetwork(
    str: string,
    network: string = 'livenet'
  ): CoinNetwork {
    const address = this.extractAddress(str);
    if (str.includes('bitcoindiamond')){
      network = this.bitcoreDiamond.Address(address).network.name;
     return { coin: 'bcd', network };
      } else if (str.includes('bitcoin')){
        network = this.bitcore.Address(address).network.name;
        return { coin: 'btc', network };
      } else{
    try {
      network = this.bitcoreDiamond.Address(address).network.name;
     return { coin: 'bcd', network };
    } catch (e) {
      try {
        network = this.bitcore.Address(address).network.name;
        return { coin: 'btc', network };
      } catch (e) {
        try {
          network = this.bitcoreCash.Address(address).network.name;
          return { coin: 'bch', network };
        } catch (e) {
          try {
            const isValidEthAddress = this.core.Validation.validateAddress(
              'ETH',
              network,
              address
            );
            if (isValidEthAddress) {
              return { coin: 'eth', network };
            } else {
              return null;
            }
          } catch (e) {
            return null;
          }
        }
      }
    }
  }
  }

  public isValid(str: string): boolean {
    // Check if the input is a valid uri or address
    const URI = this.bitcore.URI;
    const Address = this.bitcore.Address;
    const URICash = this.bitcoreCash.URI;
    const AddressCash = this.bitcoreCash.Address;
    const AddressDiamond = this.bitcoreDiamond.Address;
    const AddressEth = this.core.Validation;
 
    // Bip21 uri
    if (URI.isValid(str)) return true;
    if (URICash.isValid(str)) return true;
    if (AddressEth.validateUri('ETH', str)) return true;

    // Regular Address: try Bitcoin and Bitcoin Cash
    if (AddressDiamond.isValid(str, 'livenet')) return true;
    if (AddressDiamond.isValid(str, 'testnet')) return true;
    if (Address.isValid(str, 'livenet')) return true;
    if (Address.isValid(str, 'testnet')) return true;
    if (AddressCash.isValid(str, 'livenet')) return true;
    if (AddressCash.isValid(str, 'testnet')) return true;
    if (AddressEth.validateAddress('ETH', 'livenet', str)) return true;

    return false;
  }
}
