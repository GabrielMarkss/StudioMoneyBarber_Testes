import { importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { appRoutes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [importProvidersFrom(HttpClientModule), provideRouter(appRoutes)],
});
