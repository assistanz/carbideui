import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideNgccI18n, HttpNgccI18nLoader } from '@assistanz/carbideui';

bootstrapApplication(AppComponent, {
  providers: [
    provideNgccI18n({
      defaultLanguage: 'en',
      loader: new HttpNgccI18nLoader('/assets/i18n')
    })
  ]
}).catch((err) => console.error(err));
