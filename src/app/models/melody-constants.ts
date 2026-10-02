// CONSTANTES DE LA MELODÍA
//
// Si el backend añade una duración o una nota nueva, se añade AQUÍ y en las
// tablas de abajo a la vez, en este mismo archivo. Son la única fuente de
// verdad: el piano roll y el reproductor no deben repetir estos valores.

/** Modos que el selector de escala ofrece. */
export const MODES = ['MAJOR', 'MINOR'] as const;

/**
 * Las 12 notas cromáticas, de grave a agudo.
 * Se usan para las opciones del selector de escala.
 */
export const SCALE_ROOT_NOTES = [
  'C', 'C_SHARP', 'D', 'D_SHARP', 'E', 'F',
  'F_SHARP', 'G', 'G_SHARP', 'A', 'A_SHARP', 'B'
];

/**
 * Las mismas 12 notas pero de aguda a grave, que es como se ordenan las filas
 * del piano roll: la nota más alta arriba, la más baja abajo.
 *
 * OJO: el orden es el contrario que en SCALE_ROOT_NOTES, y es intencionado.
 *
 * Al final está REST, que no es una nota: es la fila donde se dibujan los
 * silencios. Tiene que estar en la lista porque el piano roll busca la fila con
 * `indexOf`, y una nota que no está en la lista sale con -1 y no se dibuja.
 */
export const PIANO_ROLL_NOTES = [
  'B', 'A_SHARP', 'A', 'G_SHARP', 'G', 'F_SHARP',
  'F', 'E', 'D_SHARP', 'D', 'C_SHARP', 'C',
  'REST'
];

/** La fila donde viven los silencios: la última, la de abajo del todo. */
export const REST_ROW = PIANO_ROLL_NOTES.indexOf('REST');

/** Traduce la duración del backend ("QUARTER") a notación de Tone.js ("4n"). */
export const DURATION_TO_TONE: Record<string, string> = {
  HALF: '2n', QUARTER: '4n', EIGHTH: '8n', SIXTEENTH: '16n'
};

/**
 * Cuántas negras (beats) dura cada figura.
 * La usa el piano roll para calcular el ancho de cada nota y para saber dónde
 * cae cada línea divisoria de compás.
 *
 * SIXTEENTH es obligatoria y no es un caso raro: es el 29 % de lo que genera el
 * backend. Si falta, cada semicorchea cuenta como una negra entera y el ancho de
 * los compases sale descuadrado, que es justo lo que pasa si se borra.
 */
export const DURATION_BEATS: Record<string, number> = {
  HALF: 2, QUARTER: 1, EIGHTH: 0.5, SIXTEENTH: 0.25
};

/**
 * Si el backend mandara una duración que no está en la tabla, se cuenta como
 * una negra en vez de dejar un NaN que rompe todas las posiciones siguientes.
 *
 * OJO: esto evita el NaN, pero NO es un valor neutro. Como las posiciones se
 * calculan con un acumulado de pulsos, una duración desconocida desplaza todas
 * las notas siguientes. Por eso la tabla tiene que ser idéntica a la del enum
 * Duration del backend.
 */
export const DEFAULT_DURATION_BEATS = 1;

/**
 * Traduce el nombre de nota del backend ("D_SHARP") al símbolo de Tone.js ("D#").
 *
 * REST no está en esta tabla a propósito: un silencio no tiene altura, así que no
 * hay símbolo al que convertirlo. El reproductor tiene que mirar antes si la nota
 * es un silencio, o intentaría tocar "undefined4".
 */
export const NOTE_SYMBOLS: Record<string, string> = {
  C: 'C', C_SHARP: 'C#', D: 'D', D_SHARP: 'D#', E: 'E', F: 'F',
  F_SHARP: 'F#', G: 'G', G_SHARP: 'G#', A: 'A', A_SHARP: 'A#', B: 'B'
};

/**
 * Traduce el nombre de nota del backend ("D_SHARP") al símbolo que se enseña
 * en pantalla ("D♯").
 *
 * Es una tabla aparte de NOTE_SYMBOLS a propósito: al reproductor le sirve el
 * "#" de Tone.js y a la interfaz le sirve el "♯" musical.
 */
export const NOTE_DISPLAY: Record<string, string> = {
  C: 'C', C_SHARP: 'C♯', D: 'D', D_SHARP: 'D♯', E: 'E', F: 'F',
  F_SHARP: 'F♯', G: 'G', G_SHARP: 'G♯', A: 'A', A_SHARP: 'A♯', B: 'B',
  REST: '·'
};

/**
 * Convierte "D_SHARP" en "D♯". Si llegara una nota que no está en la tabla, se
 * devuelve tal cual para que se vea en pantalla en lugar de desaparecer.
 */
export function displayNote(note: string): string {
  return NOTE_DISPLAY[note] ?? note;
}

/**
 * Dice si una nota es un silencio. El backend los manda con el nombre `REST`.
 *
 * Existe para no repetir el `=== 'REST'` por todo el código: el nombre del
 * silencio es un dato del backend y puede cambiar, y entonces solo hay que
 * cambiarlo aquí.
 */
export function isRest(note: string): boolean {
  return note === 'REST';
}
