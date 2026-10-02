import { Injectable } from '@angular/core';

import { MelodyObject, Note } from '../models/melody.model';
import {
  DEFAULT_DURATION_BEATS,
  DURATION_BEATS,
  PIANO_ROLL_NOTES,
  displayNote,
  isRest
} from '../models/melody-constants';

/** Una nota ya colocada en el piano roll, con su posición en porcentaje. */
export interface PianoRollBlock {
  id: number;
  measureIndex: number;
  noteIndex: number;
  rowIndex: number;
  left: number;
  width: number;
  label: string;
  /** true si este bloque es un silencio. Cambia el color y el texto. */
  rest: boolean;
}

/** Todo lo que hay que pintar en el piano roll para una melodía. */
export interface PianoRollLayout {
  blocks: PianoRollBlock[];
  dividers: number[];
}

/**
 * Convierte una melodía en la geometría del piano roll.
 *
 * Este servicio no sabe nada de píxeles: solo devuelve porcentajes. La altura
 * de las filas vive únicamente en el CSS, así que cambiar el diseño no obliga
 * a tocar TypeScript.
 */
@Injectable({
  providedIn: 'root'
})
export class PianoRollService {

  readonly noteNames = PIANO_ROLL_NOTES;

  private beatsOf(note: Note): number {
    const beats = DURATION_BEATS[note.duration];

    if (beats === undefined) {
      // Igual que con las notas desconocidas: avisar y seguir. El valor por
      // defecto evita un NaN, pero NO es neutro, porque las posiciones se
      // calculan con un acumulado y el error arrastra a todas las notas
      // siguientes. Por eso el enum Duration del backend tiene que coincidir
      // exactamente con DURATION_BEATS.
      console.warn(
        `[piano-roll] duración desconocida "${note.duration}": se cuenta como una negra`
      );
      return DEFAULT_DURATION_BEATS;
    }

    return beats;
  }

  /**
   * Recorre la melodía una sola vez y devuelve a la vez los bloques de notas y
   * las líneas divisorias de compás.
   *
   * Que salga todo del mismo recorrido es lo que garantiza que los bloques y las
   * divisoras no se desincronicen nunca: comparten el mismo acumulado de pulsos.
   */
  buildLayout(melody: MelodyObject): PianoRollLayout {
    // 1. Aplanar: una lista de notas en el orden en que suenan, con su índice
    //    de compás, su índice dentro del compás y su duración en pulsos.
    const entries: {
      measureIndex: number;
      noteIndex: number;
      note: Note;
      beats: number;
    }[] = [];

    melody.measures.forEach((measure, measureIndex) => {
      measure.notes.forEach((note, noteIndex) => {
        entries.push({
          measureIndex,
          noteIndex,
          note,
          beats: this.beatsOf(note)
        });
      });
    });

    if (entries.length === 0) {
      return { blocks: [], dividers: [] };
    }

    // 2. Saber el total antes de colocar nada, porque las posiciones son
    //    porcentajes sobre el total.
    const totalBeats = entries.reduce((sum, entry) => sum + entry.beats, 0);

    if (totalBeats <= 0) {
      return { blocks: [], dividers: [] };
    }

    const blocks: PianoRollBlock[] = [];
    const dividers: number[] = [];

    let beat = 0;
    let previousMeasureIndex: number | null = null;

    // 3. Colocar. Cada vez que cambia el compás, se deja una divisoria justo
    //    antes de la primera nota del compás nuevo.
    entries.forEach((entry, id) => {
      if (entry.measureIndex !== previousMeasureIndex) {
        if (previousMeasureIndex !== null) {
          dividers.push((beat / totalBeats) * 100);
        }
        previousMeasureIndex = entry.measureIndex;
      }

      const rowIndex = this.noteNames.indexOf(entry.note.note);

      // Una nota que no esté en la escala cromática no tiene fila en la que
      // pintarse. Antes se colaba con rowIndex -1 y aparecía fuera del piano
      // roll sin avisar. El silencio SÍ tiene fila: es la última de la lista,
      // la de los silencios, porque si no el silencio se generaba pero nunca
      // se veía.
      if (rowIndex < 0) {
        console.warn(
          `[piano-roll] nota desconocida "${entry.note.note}": no se dibuja`
        );
        beat += entry.beats;
        return;
      }

      blocks.push({
        id,
        measureIndex: entry.measureIndex,
        noteIndex: entry.noteIndex,
        rowIndex,
        left: (beat / totalBeats) * 100,
        width: (entry.beats / totalBeats) * 100,
        label: isRest(entry.note.note)
          ? 'silencio'
          : `${displayNote(entry.note.note)}${entry.note.octave}`,
        rest: isRest(entry.note.note)
      });

      beat += entry.beats;
    });

    return { blocks, dividers };
  }
}
