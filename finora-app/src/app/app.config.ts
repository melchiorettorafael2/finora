import { ApplicationConfig, DEFAULT_CURRENCY_CODE, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';
import { provideEnvironmentNgxMask } from 'ngx-mask';

registerLocaleData(localePt, 'pt-BR');

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'BRL' },
    provideRouter(routes),
    provideHttpClient(),
    provideToastr({
      positionClass: 'toast-top-right',
      timeOut: 5000,
      closeButton: true,
      progressBar: true
    }),

    provideEnvironmentNgxMask({
        thousandSeparator: '.', //1.000,00
        decimalMarker: ',',
        dropSpecialCharacters: false
    })

  ]
};
