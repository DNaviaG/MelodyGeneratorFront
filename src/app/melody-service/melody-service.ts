// Importamos Injectable para convertir esta clase en un servicio de Angular
import { Injectable } from '@angular/core';

// Importamos HttpClient para hacer peticiones HTTP al backend
import { HttpClient } from '@angular/common/http';

// Importamos los modelos que representan la petición y la respuesta del backend
import { Scale, MelodyApiResponse } from '../models/melody.model';

import { map } from 'rxjs';

import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root',
  // Hace que MelodyService esté disponible en toda la aplicación
})

/**
 * Gestiona la comunicación con la API de generación de melodías.
 *
 * Responsabilidades:
 * - Enviar solicitudes de generación de melodías.
 * - Recibir y tipar las respuestas de la API.
 *
 */

export class MelodyService {

  constructor(private http: HttpClient) {
    // Inyectamos HttpClient para poder utilizarlo dentro del servicio
  }

generateMelody(scale: Scale) {
     return this.http.post<MelodyApiResponse>(//lo que recibimos
      `${environment.apiUrl}/melody/generate`,
      scale//lo que enviamos
    ).pipe(
      // El backend envuelve la melodía en un campo "melody". Aquí se quita la
      // envoltura para que el resto de la app trabaje siempre con MelodyObject
      // y no tenga que acordarse del sobre en cada sitio
      map(response => response.melody)
    );
   }
}