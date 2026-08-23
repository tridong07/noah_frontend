import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
// 👈 1. Import thêm withInterceptors
import { provideHttpClient, HttpClient, withInterceptors } from '@angular/common/http';
import { provideTranslateService, TranslateLoader, MissingTranslationHandler } from '@ngx-translate/core';

import { routes } from './app.routes';
import { CustomTranslateHttpLoader } from './shared/translate/custom-translate.loader';
import { CustomMissingTranslationHandler } from './shared/translate/custom-missing-translation.handler';
// 👈 2. Import authInterceptor vừa tạo
import { withCredentialsInterceptor } from './core/authInterceptor/auth.interceptor'; 

export function HttpLoaderFactory(http: HttpClient) {
  return new CustomTranslateHttpLoader(http);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // 👈 3. Bổ sung withInterceptors vào đây
    provideHttpClient(
      withInterceptors([withCredentialsInterceptor])
    ),
    provideTranslateService({
      fallbackLang: 'VN',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: CustomMissingTranslationHandler,
      },
    }),
  ],
};