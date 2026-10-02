import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
// Importamos herramientas básicas de configuración de Angular

import { provideRouter } from '@angular/router';
// Permite que Angular gestione las rutas de la aplicación

import { provideHttpClient } from '@angular/common/http';
// Permite que Angular haga peticiones HTTP a nuestro backend

import { routes } from './app.routes';
// Importamos las rutas que hemos definido para nuestra aplicación


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Gestiona errores globales de la aplicación

    provideRouter(routes),
    // Activa el sistema de rutas usando nuestras rutas

    provideHttpClient()
    // Activa HttpClient para poder comunicarnos con el backend
  ]
};