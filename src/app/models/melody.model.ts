export interface Note {
  // Representa una nota de la melodía
  note: string;
  octave: number;
  duration: string;
}

export interface Measure {
  // Representa un compás, que contiene varias notas
  notes: Note[];
}

export interface MelodyObject {
  scale: Scale;
  measures: Measure[];
}

// Sobre que envuelve la melodía en la respuesta de POST /api/v1/melody/generate.
// El backend devuelve { melody: { scale, measures } }, así que el servicio
// quita la envoltura y el resto de la app solo ve MelodyObject.
export interface MelodyApiResponse {
  melody: MelodyObject;
}

export interface Scale {
  rootNote: string;
  mode: string;
}