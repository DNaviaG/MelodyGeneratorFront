import { Injectable, signal } from '@angular/core';
import * as Tone from 'tone';

import { MelodyObject, Note } from '../models/melody.model';
import { NOTE_SYMBOLS, DURATION_TO_TONE, isRest } from '../models/melody-constants';

@Injectable({
  providedIn: 'root',
})
export class MelodyPlayerService {

  isPlaying = signal(false);
  currentNote = signal<{ measure: number; note: number } | null>(null);
  loop = signal(false);

  private synth: Tone.Synth | null = null;
  private part: Tone.Part | null = null;
  private totalDuration = 0;
  private lastEventIndex = 0;

  private transport = Tone.getTransport();
  private draw = Tone.getDraw();

  private buildPart(melody: MelodyObject, tempo: number) {
    this.transport.bpm.value = tempo;
    this.synth = new Tone.Synth().toDestination();

    let time = 0;
    const events: {
      time: number;
      note: string | null;
      duration: string;
      measureIndex: number;
      noteIndex: number;
      eventIndex: number;
    }[] = [];

    melody.measures.forEach((measure, measureIndex) => {
      measure.notes.forEach((note: Note, noteIndex: number) => {
        const duration = DURATION_TO_TONE[note.duration] ?? '4n';
        const rest = isRest(note.note);
        events.push({
          time,
          note: rest ? null : `${NOTE_SYMBOLS[note.note]}${note.octave}`,
          duration,
          measureIndex,
          noteIndex,
          eventIndex: events.length,
        });
        time += Tone.Time(duration).toSeconds();
      });
    });

    this.lastEventIndex = events.length - 1;

    this.part = new Tone.Part((playTime, event) => {
      if (event.note !== null) {
        this.synth!.triggerAttackRelease(event.note, event.duration, playTime);
      }

      this.draw.schedule(() => {
        this.currentNote.set({ measure: event.measureIndex, note: event.noteIndex });
      }, playTime);

      // Al terminar la última nota, decidir según el valor de loop EN ESE MOMENTO
      if (event.eventIndex === this.lastEventIndex) {
        const endTime = playTime + Tone.Time(event.duration).toSeconds();
        this.draw.schedule(() => {
          if (!this.loop()) {
            this.finishPlayback();
          }
        }, endTime);
      }
    }, events).start(0);

    // El Part NO hace bucle: lo gestiona el Transport
    this.part.loop = false;

    this.totalDuration = time;

    this.transport.loopStart = 0;
    this.transport.loopEnd = time;
    this.transport.loop = this.loop();
  }

  private finishPlayback(): void {
    this.transport.stop();
    this.transport.position = 0;
    this.draw.cancel(0);
    this.isPlaying.set(false);
    this.currentNote.set(null);
  }

  async play(melody: MelodyObject, tempo: number) {
    if (this.isPlaying()) return;
    await Tone.start();

    if (!this.part) {
      this.buildPart(melody, tempo);
    }

    this.transport.start();
    this.isPlaying.set(true);
  }

  pause() {
    this.transport.pause();
    this.isPlaying.set(false);
  }

  setTempo(value: number) {
    this.transport.bpm.value = value;
  }

  setLoop(value: boolean) {
    this.loop.set(value);
    this.transport.loop = value;
  }

  stop() {
    this.transport.stop();
    this.transport.cancel(0);
    this.draw.cancel(0);
    this.transport.loop = false;
    this.transport.position = 0;
    this.part?.dispose();
    this.synth?.dispose();
    this.part = null;
    this.synth = null;
    this.totalDuration = 0;
    this.isPlaying.set(false);
    this.currentNote.set(null);
  }
}