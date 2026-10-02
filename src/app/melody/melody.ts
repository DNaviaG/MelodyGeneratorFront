import { Component, OnDestroy, computed, effect, signal } from '@angular/core';

import { MelodyObject, Scale } from '../models/melody.model';
import { MODES, SCALE_ROOT_NOTES, displayNote } from '../models/melody-constants';
import { MelodyService } from '../melody-service/melody-service';
import { MelodyPlayerService } from '../melody-player-service/melody-player-service';
import { PianoRollService } from '../piano-roll-service/piano-roll-service';

type Theme = 'dark' | 'light';

const THEME_KEY = 'melody-generator.theme';

@Component({
  selector: 'app-melody',
  templateUrl: './melody.html',
  styleUrl: './melody.css'
})
export class Melody implements OnDestroy {

  isPlaying!: typeof this.melodyPlayer.isPlaying;
  currentNote!: typeof this.melodyPlayer.currentNote;
  loop!: typeof this.melodyPlayer.loop;
  pianoRollNotes!: typeof this.pianoRoll.noteNames;

  constructor(
    private melodyService: MelodyService,
    private melodyPlayer: MelodyPlayerService,
    private pianoRoll: PianoRollService
  ) {
    this.isPlaying = this.melodyPlayer.isPlaying;
    this.currentNote = this.melodyPlayer.currentNote;
    this.loop = this.melodyPlayer.loop;
    this.pianoRollNotes = this.pianoRoll.noteNames;

    effect(() => {
      const theme = this.theme();
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem(THEME_KEY, theme);
    });
  }

  // --- Tema ---
  //
  // Los valores por defecto viven en styles.css. El atributo data-theme se
  // pone en <html> para que los tokens de styles.css apliquen a toda la app.

  readonly theme = signal<Theme>(readStoredTheme());

  readonly isDark = computed(() => this.theme() === 'dark');

  toggleTheme(): void {
    this.theme.update(theme => (theme === 'dark' ? 'light' : 'dark'));
  }

  // --- Estado general ---

  tempo = signal(120);

  melodyObject = signal<MelodyObject | null>(null);

  hasMelody = computed(() => this.melodyObject() !== null);

  // --- Tonalidad ---
  //
  // Antes eran 24 opciones en dos <optgroup> y el valor era un texto
  // ("C_SHARP_MAJOR") que había que partir por la mitad. Ahora la tónica es
  // un desplegable de 12 y el modo es un control segmentado, que además es lo
  // que hace el prototipo.

  readonly selectedRoot = signal<string>('C');

  readonly selectedMode = signal<string>('MAJOR');

  readonly selectedScale = computed<Scale>(() => ({
    rootNote: this.selectedRoot(),
    mode: this.selectedMode()
  }));

  readonly rootOptions = SCALE_ROOT_NOTES.map((rootNote, index) => ({
    index,
    rootNote,
    label: displayNote(rootNote)
  }));

  readonly selectedRootIndex = computed(() => {
    const root = this.selectedRoot();
    const found = this.rootOptions.find(option => option.rootNote === root);

    return found ? found.index : 0;
  });

  selectRoot(index: number): void {
    const option = this.rootOptions[index];

    if (option) {
      this.selectedRoot.set(option.rootNote);
    }
  }

  readonly modes = MODES;

  selectMode(mode: string): void {
    this.selectedMode.set(mode);
  }

  isModeActive(mode: string): boolean {
    return this.selectedMode() === mode;
  }

  modeLabel(mode: string): string {
    return mode === 'MAJOR' ? 'Mayor' : 'Menor';
  }

  // --- Piano roll ---
  //
  // Un único recorrido produce notas y divisoras a la vez, así que no pueden
  // desincronizarse entre sí.

  pianoRollLayout = computed(() => {
    const melody = this.melodyObject();

    if (!melody) {
      return { blocks: [], dividers: [] };
    }

    return this.pianoRoll.buildLayout(melody);
  });

  /**
   * Dice a qué altura va la fila número `rowIndex`, en porcentaje.
   *
   * Se calcula aquí y no en el servicio a propósito: los porcentajes no
   * dependen de la altura de la fila, que es un detalle del CSS. Así el piano
   * roll puede encogerse en móvil sin tocar nada de TypeScript.
   */
  noteTop(rowIndex: number): number {
    return (rowIndex / this.pianoRollNotes.length) * 100;
  }

  /**
   * Alto de una nota, en porcentaje de la fila.
   *
   * Las filas se reparten el alto con `1fr`, así que no hay una altura fija en
   * píxeles que valga: si la ventana es baja, cada fila es más corta y una nota
   * de 30px se saldría de su fila. En porcentaje no hay nada que recalcular.
   *
   * Se deja un 14 % de aire arriba y abajo para que la nota separe de las
   * líneas de la fila.
   */
  rowHeight(): number {
    return (100 / this.pianoRollNotes.length) * 0.86;
  }

  /** Margen superior de la nota dentro de su fila, en porcentaje. */
  rowOffset(): number {
    return (100 / this.pianoRollNotes.length) * 0.07;
  }

  // --- Generación ---

  generateMelody(): void {
    this.melodyPlayer.stop();

    this.melodyService.generateMelody(this.selectedScale()).subscribe({
      next: response => {
        this.melodyObject.set(response);
      },
      error: () => {
        this.melodyObject.set(null);
      }
    });
  }

  resetMelody(): void {
    this.melodyPlayer.stop();
    this.melodyObject.set(null);
  }

  // --- Formateo ---

  formatNoteName(note: string): string {
    return displayNote(note);
  }

  formatScaleName(scale: Scale): string {
    return `${displayNote(scale.rootNote)} ${this.modeLabel(scale.mode)}`;
  }

  // --- Reproducción ---

  isCurrentNote(measureIndex: number, noteIndex: number): boolean {
    const current = this.currentNote();

    return current !== null &&
      current.measure === measureIndex &&
      current.note === noteIndex;
  }

  playMelody(): void {
    const melody = this.melodyObject();

    if (!melody) return;

    this.melodyPlayer.play(melody, this.tempo());
  }

  pauseMelody(): void {
    this.melodyPlayer.pause();
  }

  stopMelody(): void {
    this.melodyPlayer.stop();
  }

  changeTempo(value: number): void {
    this.tempo.set(value);
    this.melodyPlayer.setTempo(value);
  }

  setLoop(value: boolean): void {
    this.melodyPlayer.setLoop(value);
  }

  ngOnDestroy(): void {
    this.melodyPlayer.stop();
  }
}

function readStoredTheme(): Theme {
  const stored = localStorage.getItem(THEME_KEY);

  return stored === 'light' ? 'light' : 'dark';
}
