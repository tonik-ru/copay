import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IonicImageLoader } from 'ionic-image-loader';
import { MarkdownModule } from 'ngx-markdown';

import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

/* Modules */
import {
  MissingTranslationHandler,
  MissingTranslationHandlerParams,
  TranslateDefaultParser,
  TranslateLoader,
  TranslateModule,
  TranslateParser
} from '@ngx-translate/core';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { MomentModule } from 'angular2-moment';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { NgxBarcodeModule } from 'ngx-barcode';
import { NgxQRCodeModule } from 'ngx-qrcode2';

/* Copay App */
import env from '../environments';
import { CopayApp } from './app.component';

import { PAGES } from './../pages/pages';

/* Pipes */
import { FiatToUnitPipe } from '../pipes/fiatToUnit';
import { FormatCurrencyPipe } from '../pipes/format-currency';
import { KeysPipe } from '../pipes/keys';
import { OrderByPipe } from '../pipes/order-by';
import { SatToFiatPipe } from '../pipes/satToFiat';
import { SatToUnitPipe } from '../pipes/satToUnit';

/* Directives */
import { Animate } from '../directives/animate/animate';
import { AutoHideDirective } from '../directives/auto-hide/auto-hide';
import { CopyToClipboard } from '../directives/copy-to-clipboard/copy-to-clipboard';
import { ExternalizeLinks } from '../directives/externalize-links/externalize-links';
import { FixedScrollBgColor } from '../directives/fixed-scroll-bg-color/fixed-scroll-bg-color';
import { IonContentBackgroundColor } from '../directives/ion-content-background-color/ion-content-background-color';
import { LongPress } from '../directives/long-press/long-press';
import { NavbarBg } from '../directives/navbar-bg/navbar-bg';
import { NoLowFee } from '../directives/no-low-fee/no-low-fee';
import { RevealAtScrollPosition } from '../directives/reveal-at-scroll-pos/reveal-at-scroll-pos';
import { WideHeaderBarButton } from '../pages/templates/wide-header-page/wide-header-bar-button';

/* Components */
import { COMPONENTS } from '../components/components';

/* Providers */
/*import { from } from 'rxjs/observable/from';*/

import { InAppBrowser } from '@ionic-native/in-app-browser';
import { ApiProvider } from '../providers/api/api';
import { LanguageLoader } from '../providers/language-loader/language-loader';
import { ProvidersModule } from '../providers/providers.module';

import { IonicStorageModule } from '@ionic/storage';

export function translateParserFactory() {
  return new InterpolatedTranslateParser();
}

export class InterpolatedTranslateParser extends TranslateDefaultParser {
  public templateMatcher: RegExp = /{\s?([^{}\s]*)\s?}/g;
}

export class MyMissingTranslationHandler implements MissingTranslationHandler {
  public parser: TranslateParser = translateParserFactory();
  public handle(params: MissingTranslationHandlerParams) {
    return this.parser.interpolate(params.key, params.interpolateParams);
  }
}

@NgModule({
  declarations: [
    CopayApp,
    ...PAGES,
    ...COMPONENTS,
    /* Directives */
    CopyToClipboard,
    ExternalizeLinks,
    FixedScrollBgColor,
    IonContentBackgroundColor,
    LongPress,
    NavbarBg,
    NoLowFee,
    Animate,
    RevealAtScrollPosition,
    WideHeaderBarButton,
    /* Pipes */
    FiatToUnitPipe,
    FormatCurrencyPipe,
    KeysPipe,
    SatToUnitPipe,
    SatToFiatPipe,
    OrderByPipe,
    AutoHideDirective
  ],
  imports: [
    IonicModule.forRoot(CopayApp, {
      mode: 'ios',
      animate: env.enableAnimations,
      tabsHideOnSubPages: false,
      tabsPlacement: 'bottom',
      backButtonIcon: 'arrow-round-back',
      backButtonText: ''
    }),
    IonicImageLoader.forRoot(),
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MarkdownModule.forRoot(),
    MomentModule,
    NgxBarcodeModule,
    NgxQRCodeModule,
    ProvidersModule,
    TranslateModule.forRoot({
      parser: { provide: TranslateParser, useFactory: translateParserFactory },
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: MyMissingTranslationHandler
      },
      loader: {
        provide: TranslateLoader,
        useClass: LanguageLoader
      }
    }),
    ZXingScannerModule.forRoot(),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    CopayApp,
    ...PAGES,
    ...COMPONENTS
  ],
  providers: [
    {
      provide: ErrorHandler,
      useClass: IonicErrorHandler
    },
    ApiProvider,
    InAppBrowser
  ]
})
export class AppModule {}
