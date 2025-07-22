"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  default: () => wembley,
  wembley: () => wembley
});
module.exports = __toCommonJS(index_exports);

// src/utils/note-parser.ts
var import_tonal = require("tonal");
var noteToMidi = (args) => {
  const midi = import_tonal.Midi.toMidi(args.note);
  if (midi === null) {
    throw new Error(`Cannot convert note to MIDI: ${args.note}`);
  }
  return midi;
};
var midiToNote = (args) => {
  const note = import_tonal.Midi.midiToNoteName(args.midi);
  if (!note) {
    throw new Error(`Cannot convert MIDI to note: ${args.midi}`);
  }
  return note;
};
var transposeNote = (args) => {
  const midi = noteToMidi(args);
  return midiToNote({ midi: midi + args.semitones });
};

// src/note.ts
var createNote = (args) => {
  const state = {
    note: args.note,
    velocity: args.config.minVelocity || 45,
    afterMs: 0,
    detuneCents: 0,
    gain: args.config.gain || 70,
    pan: 0
  };
  const noteInstance = {
    velocity: (vel, maxVel) => {
      if (maxVel !== void 0) {
        state.minVelocity = vel;
        state.maxVelocity = maxVel;
        state.velocity = Math.random() * (maxVel - vel) + vel;
      } else {
        state.velocity = vel;
      }
      return noteInstance;
    },
    after: (ms) => {
      state.afterMs = ms;
      return noteInstance;
    },
    duration: (ms) => {
      state.durationMs = ms;
      return noteInstance;
    },
    detune: (cents) => {
      state.detuneCents = cents;
      return noteInstance;
    },
    attack: (ms) => {
      state.attackMs = ms;
      return noteInstance;
    },
    release: (ms) => {
      state.releaseMs = ms;
      return noteInstance;
    },
    gain: (gain) => {
      state.gain = gain;
      return noteInstance;
    },
    pan: (pan) => {
      state.pan = pan;
      return noteInstance;
    },
    play: () => {
      return createPlayingNote({ state, synth: args.synth });
    },
    stop: () => {
      console.log(`Stopping note ${state.note} immediately`);
    }
  };
  return noteInstance;
};
var createPlayingNote = (args) => {
  const playingState = {
    afterMs: 0,
    gain: args.state.gain,
    pan: args.state.pan
  };
  const midi = noteToMidi({ note: args.state.note });
  const startTime = args.state.afterMs > 0 ? args.state.afterMs / 1e3 : void 0;
  console.log(`Playing note ${args.state.note} (MIDI ${midi}) with velocity ${args.state.velocity}`);
  if (args.state.afterMs > 0) {
    console.log(`  After ${args.state.afterMs}ms`);
  }
  if (args.state.durationMs) {
    console.log(`  Duration: ${args.state.durationMs}ms`);
  }
  const voice = args.synth.playNote({
    midi,
    velocity: args.state.velocity,
    startTime,
    duration: args.state.durationMs,
    detune: args.state.detuneCents,
    attack: args.state.attackMs,
    release: args.state.releaseMs,
    gain: args.state.gain,
    pan: args.state.pan
  });
  const playingNote = {
    after: (ms) => {
      playingState.afterMs = ms;
      return playingNote;
    },
    gain: (gain) => {
      playingState.gain = gain;
      return playingNote;
    },
    pan: (pan) => {
      playingState.pan = pan;
      return playingNote;
    },
    stop: () => {
      if (playingState.afterMs > 0) {
        console.log(`Stopping note ${args.state.note} after ${playingState.afterMs}ms`);
        console.log(`  Transitioning to gain: ${playingState.gain}, pan: ${playingState.pan}`);
        setTimeout(() => {
          voice.modulate({
            gain: playingState.gain,
            pan: playingState.pan,
            duration: playingState.afterMs
          });
          setTimeout(() => {
            voice.stop();
          }, playingState.afterMs);
        }, 0);
      } else {
        console.log(`Stopping note ${args.state.note} immediately`);
        voice.stop();
      }
    }
  };
  return playingNote;
};

// src/notes.ts
var createNotes = (args) => {
  const state = {
    notes: args.notes,
    velocity: args.config.minVelocity || 45,
    afterMs: 0,
    staggerMs: 0,
    detuneCents: 0,
    gain: args.config.gain || 70,
    pan: 0
  };
  const notesInstance = {
    velocity: (vel, maxVel) => {
      if (maxVel !== void 0) {
        state.minVelocity = vel;
        state.maxVelocity = maxVel;
        state.velocity = Math.random() * (maxVel - vel) + vel;
      } else {
        state.velocity = vel;
      }
      return notesInstance;
    },
    after: (ms) => {
      state.afterMs = ms;
      return notesInstance;
    },
    duration: (ms) => {
      state.durationMs = ms;
      return notesInstance;
    },
    stagger: (ms) => {
      state.staggerMs = ms;
      return notesInstance;
    },
    detune: (cents) => {
      state.detuneCents = cents;
      return notesInstance;
    },
    attack: (ms) => {
      state.attackMs = ms;
      return notesInstance;
    },
    release: (ms) => {
      state.releaseMs = ms;
      return notesInstance;
    },
    gain: (gain) => {
      state.gain = gain;
      return notesInstance;
    },
    pan: (pan) => {
      state.pan = pan;
      return notesInstance;
    },
    play: () => {
      return createPlayingNotes({ state, synth: args.synth });
    },
    stop: () => {
      console.log(`Stopping notes ${state.notes.join(", ")} immediately`);
    }
  };
  return notesInstance;
};
var createPlayingNotes = (args) => {
  const playingState = {
    afterMs: 0,
    gain: args.state.gain,
    pan: args.state.pan
  };
  const voices = [];
  if (args.state.staggerMs > 0) {
    console.log(`Playing notes ${args.state.notes.join(", ")} with ${args.state.staggerMs}ms stagger`);
    args.state.notes.forEach((note, index) => {
      const midi = noteToMidi({ note });
      const delay = args.state.afterMs + index * args.state.staggerMs;
      const startTime = delay > 0 ? (performance.now() + delay) / 1e3 : void 0;
      console.log(`  ${note} (MIDI ${midi}) after ${delay}ms with velocity ${args.state.velocity}`);
      const voice = args.synth.playNote({
        midi,
        velocity: args.state.velocity,
        startTime,
        duration: args.state.durationMs,
        detune: args.state.detuneCents,
        attack: args.state.attackMs,
        release: args.state.releaseMs,
        gain: args.state.gain,
        pan: args.state.pan
      });
      voices.push(voice);
    });
  } else {
    console.log(`Playing notes ${args.state.notes.join(", ")} simultaneously`);
    console.log(`  Velocity: ${args.state.velocity}`);
    if (args.state.afterMs > 0) {
      console.log(`  After: ${args.state.afterMs}ms`);
    }
    const startTime = args.state.afterMs > 0 ? (performance.now() + args.state.afterMs) / 1e3 : void 0;
    args.state.notes.forEach((note) => {
      const midi = noteToMidi({ note });
      const voice = args.synth.playNote({
        midi,
        velocity: args.state.velocity,
        startTime,
        duration: args.state.durationMs,
        detune: args.state.detuneCents,
        attack: args.state.attackMs,
        release: args.state.releaseMs,
        gain: args.state.gain,
        pan: args.state.pan
      });
      voices.push(voice);
    });
  }
  if (args.state.durationMs) {
    console.log(`  Duration: ${args.state.durationMs}ms`);
  }
  const playingNotes = {
    after: (ms) => {
      playingState.afterMs = ms;
      return playingNotes;
    },
    gain: (gain) => {
      playingState.gain = gain;
      return playingNotes;
    },
    pan: (pan) => {
      playingState.pan = pan;
      return playingNotes;
    },
    stop: () => {
      if (playingState.afterMs > 0) {
        console.log(`Stopping notes ${args.state.notes.join(", ")} after ${playingState.afterMs}ms`);
        console.log(`  Transitioning to gain: ${playingState.gain}, pan: ${playingState.pan}`);
        setTimeout(() => {
          voices.forEach((voice) => {
            voice.modulate({
              gain: playingState.gain,
              pan: playingState.pan,
              duration: playingState.afterMs
            });
          });
          setTimeout(() => {
            voices.forEach((voice) => voice.stop());
          }, playingState.afterMs);
        }, 0);
      } else {
        console.log(`Stopping notes ${args.state.notes.join(", ")} immediately`);
        voices.forEach((voice) => voice.stop());
      }
    }
  };
  return playingNotes;
};

// src/utils/chord-parser.ts
var import_tonal2 = require("tonal");
var getChordNotes = (args) => {
  const octave = args.octave || 4;
  const chordData = import_tonal2.Chord.get(args.chord);
  if (!chordData.tonic) {
    throw new Error(`Invalid chord format: ${args.chord}`);
  }
  let chordNotes = chordData.notes;
  if (chordNotes.length === 0) {
    const basicChords = {
      "M": ["1P", "3M", "5P"],
      // Major
      "": ["1P", "3M", "5P"],
      // Default major
      "m": ["1P", "3m", "5P"],
      // Minor
      "dim": ["1P", "3m", "5d"],
      // Diminished
      "aug": ["1P", "3M", "5A"],
      // Augmented
      "7": ["1P", "3M", "5P", "7m"],
      // Dominant 7th
      "M7": ["1P", "3M", "5P", "7M"],
      // Major 7th
      "m7": ["1P", "3m", "5P", "7m"]
      // Minor 7th
    };
    const rootNote = `${chordData.tonic}${octave}`;
    const intervals = basicChords[chordData.quality] || basicChords["M"];
    return intervals.map(
      (interval) => import_tonal2.Note.transpose(rootNote, interval)
    ).filter(Boolean);
  }
  return chordNotes.map((note) => `${note}${octave}`);
};
var applyInversion = (args) => {
  const inversionCount = args.inversion % args.notes.length;
  const inverted = [...args.notes];
  for (let i = 0; i < inversionCount; i++) {
    const note = inverted.shift();
    if (note) {
      const transposed = transposeNote({ note, semitones: 12 });
      inverted.push(transposed);
    }
  }
  return inverted;
};

// src/voicings.ts
var applyVoicing = (args) => {
  const voicingFunctions = {
    open: openVoicing,
    closed: closedVoicing,
    drop2: drop2Voicing,
    drop3: drop3Voicing,
    drop2and4: drop2and4Voicing,
    rootless: rootlessVoicing,
    spread: spreadVoicing,
    cluster: clusterVoicing,
    shell: shellVoicing,
    pianistic: pianisticVoicing,
    guitaristic: guitaristicVoicing,
    orchestral: orchestralVoicing
  };
  const voicingFunction = voicingFunctions[args.voicing];
  return voicingFunction(args.notes);
};
var openVoicing = (notes) => {
  return notes.map((note, index) => {
    const semitones = index * 7;
    return transposeNote({ note, semitones });
  });
};
var closedVoicing = (notes) => {
  return notes;
};
var drop2Voicing = (notes) => {
  if (notes.length < 3) return notes;
  const result = [...notes];
  const secondHighest = result[result.length - 2];
  result[result.length - 2] = transposeNote({ note: secondHighest, semitones: -12 });
  return result;
};
var drop3Voicing = (notes) => {
  if (notes.length < 4) return notes;
  const result = [...notes];
  const thirdHighest = result[result.length - 3];
  result[result.length - 3] = transposeNote({ note: thirdHighest, semitones: -12 });
  return result;
};
var drop2and4Voicing = (notes) => {
  if (notes.length < 4) return notes;
  let result = [...notes];
  result = drop2Voicing(result);
  result = drop3Voicing(result);
  return result;
};
var rootlessVoicing = (notes) => {
  return notes.slice(1);
};
var spreadVoicing = (notes) => {
  return notes.map((note, index) => {
    const octaveSpread = Math.floor(index / 2);
    return transposeNote({ note, semitones: octaveSpread * 12 });
  });
};
var clusterVoicing = (notes) => {
  return notes.flatMap((note, index) => {
    if (index === 0) return [note];
    const clusterNote = transposeNote({ note, semitones: 1 });
    return [note, clusterNote];
  });
};
var shellVoicing = (notes) => {
  if (notes.length >= 4) {
    return [notes[0], notes[3]];
  }
  return [notes[0], notes[notes.length - 1]];
};
var pianisticVoicing = (notes) => {
  const bassNote = transposeNote({ note: notes[0], semitones: -12 });
  const upperNotes = notes.slice(1).map(
    (note) => transposeNote({ note, semitones: 12 })
  );
  return [bassNote, ...upperNotes];
};
var guitaristicVoicing = (notes) => {
  return notes.map((note, index) => {
    const fretOffset = index * 5;
    return transposeNote({ note, semitones: fretOffset });
  });
};
var orchestralVoicing = (notes) => {
  return notes.map((note, index) => {
    const octaveSpread = index * 12;
    return transposeNote({ note, semitones: octaveSpread });
  });
};

// src/chord.ts
var createChord = (args) => {
  const initialNotes = getChordNotes({ chord: args.chord, octave: 4 });
  const state = {
    chord: args.chord,
    notes: initialNotes,
    velocity: args.config.minVelocity || 45,
    afterMs: 0,
    staggerMs: 0,
    octave: 4,
    inversion: 0,
    detuneCents: 0,
    gain: args.config.gain || 70,
    pan: 0
  };
  const updateNotes = () => {
    let notes = getChordNotes({ chord: state.chord, octave: state.octave });
    if (state.inversion > 0) {
      notes = applyInversion({ notes, inversion: state.inversion });
    }
    if (state.voicing) {
      if (typeof state.voicing === "string" && state.voicing in (args.config.voicings || {})) {
        const customVoicing = args.config.voicings[state.voicing];
        notes = customVoicing(notes);
      } else if (typeof state.voicing !== "string") {
        notes = applyVoicing({ notes, voicing: state.voicing });
      }
    }
    if (state.bassNote !== void 0) {
      if (typeof state.bassNote === "string") {
        let bassNote = state.bassNote;
        if (!/\d/.test(bassNote)) {
          bassNote = `${bassNote}${state.octave}`;
        }
        notes[0] = bassNote;
      } else {
        const bassIndex = state.bassNote % notes.length;
        const bassNote = notes[bassIndex];
        notes = [bassNote, ...notes.filter((_, i) => i !== bassIndex)];
      }
    }
    state.notes = notes;
  };
  const chordInstance = {
    velocity: (vel, maxVel) => {
      if (maxVel !== void 0) {
        state.minVelocity = vel;
        state.maxVelocity = maxVel;
        state.velocity = Math.random() * (maxVel - vel) + vel;
      } else {
        state.velocity = vel;
      }
      return chordInstance;
    },
    after: (ms) => {
      state.afterMs = ms;
      return chordInstance;
    },
    duration: (ms) => {
      state.durationMs = ms;
      return chordInstance;
    },
    stagger: (ms) => {
      state.staggerMs = ms;
      return chordInstance;
    },
    octave: (octave) => {
      state.octave = octave;
      updateNotes();
      return chordInstance;
    },
    inversion: (inversion) => {
      state.inversion = inversion;
      updateNotes();
      return chordInstance;
    },
    voicing: (voicing) => {
      state.voicing = voicing;
      updateNotes();
      return chordInstance;
    },
    bassNote: (note) => {
      state.bassNote = note;
      updateNotes();
      return chordInstance;
    },
    detune: (cents) => {
      state.detuneCents = cents;
      return chordInstance;
    },
    attack: (ms) => {
      state.attackMs = ms;
      return chordInstance;
    },
    release: (ms) => {
      state.releaseMs = ms;
      return chordInstance;
    },
    gain: (gain) => {
      state.gain = gain;
      return chordInstance;
    },
    pan: (pan) => {
      state.pan = pan;
      return chordInstance;
    },
    play: () => {
      return createPlayingChord({ state, synth: args.synth });
    },
    stop: () => {
      console.log(`Stopping chord ${state.chord} (${state.notes.join(", ")}) immediately`);
    }
  };
  return chordInstance;
};
var createPlayingChord = (args) => {
  const playingState = {
    afterMs: 0,
    gain: args.state.gain,
    pan: args.state.pan
  };
  const voices = [];
  console.log(`Playing chord ${args.state.chord}`);
  console.log(`  Notes: ${args.state.notes.join(", ")}`);
  if (args.state.octave !== 4) {
    console.log(`  Octave: ${args.state.octave}`);
  }
  if (args.state.inversion > 0) {
    console.log(`  Inversion: ${args.state.inversion}`);
  }
  if (args.state.voicing) {
    console.log(`  Voicing: ${args.state.voicing}`);
  }
  if (args.state.bassNote !== void 0) {
    console.log(`  Bass note: ${args.state.bassNote}`);
  }
  if (args.state.staggerMs > 0) {
    console.log(`  Stagger: ${args.state.staggerMs}ms`);
    args.state.notes.forEach((note, index) => {
      const midi = noteToMidi({ note });
      const delay = args.state.afterMs + index * args.state.staggerMs;
      const startTime = delay > 0 ? (performance.now() + delay) / 1e3 : void 0;
      console.log(`    ${note} (MIDI ${midi}) after ${delay}ms`);
      const voice = args.synth.playNote({
        midi,
        velocity: args.state.velocity,
        startTime,
        duration: args.state.durationMs,
        detune: args.state.detuneCents,
        attack: args.state.attackMs,
        release: args.state.releaseMs,
        gain: args.state.gain,
        pan: args.state.pan
      });
      voices.push(voice);
    });
  } else {
    console.log(`  Velocity: ${args.state.velocity}`);
    if (args.state.afterMs > 0) {
      console.log(`  After: ${args.state.afterMs}ms`);
    }
    const startTime = args.state.afterMs > 0 ? (performance.now() + args.state.afterMs) / 1e3 : void 0;
    args.state.notes.forEach((note) => {
      const midi = noteToMidi({ note });
      const voice = args.synth.playNote({
        midi,
        velocity: args.state.velocity,
        startTime,
        duration: args.state.durationMs,
        detune: args.state.detuneCents,
        attack: args.state.attackMs,
        release: args.state.releaseMs,
        gain: args.state.gain,
        pan: args.state.pan
      });
      voices.push(voice);
    });
  }
  if (args.state.durationMs) {
    console.log(`  Duration: ${args.state.durationMs}ms`);
  }
  const playingChord = {
    after: (ms) => {
      playingState.afterMs = ms;
      return playingChord;
    },
    gain: (gain) => {
      playingState.gain = gain;
      return playingChord;
    },
    pan: (pan) => {
      playingState.pan = pan;
      return playingChord;
    },
    stop: () => {
      if (playingState.afterMs > 0) {
        console.log(`Stopping chord ${args.state.chord} after ${playingState.afterMs}ms`);
        console.log(`  Transitioning to gain: ${playingState.gain}, pan: ${playingState.pan}`);
        setTimeout(() => {
          voices.forEach((voice) => {
            voice.modulate({
              gain: playingState.gain,
              pan: playingState.pan,
              duration: playingState.afterMs
            });
          });
          setTimeout(() => {
            voices.forEach((voice) => voice.stop());
          }, playingState.afterMs);
        }, 0);
      } else {
        console.log(`Stopping chord ${args.state.chord} immediately`);
        voices.forEach((voice) => voice.stop());
      }
    }
  };
  return playingChord;
};

// src/instrument.ts
var createInstrument = (args) => {
  console.log(`Creating instrument "${args.name}" from ${args.soundfontUrl}`);
  const instrument = {
    note: (note) => {
      return createNote({ note, synth: args.synth, config: args.config });
    },
    notes: (notes) => {
      return createNotes({ notes, synth: args.synth, config: args.config });
    },
    chord: (chord) => {
      return createChord({ chord, synth: args.synth, config: args.config });
    }
  };
  return instrument;
};

// src/audio-engine.ts
var Tone = __toESM(require("tone"), 1);
var createAudioEngine = () => {
  let audioContext = null;
  const getAudioContext = async () => {
    if (audioContext && audioContext.isStarted) {
      return audioContext;
    }
    if (Tone.getContext().state === "suspended") {
      await Tone.start();
    }
    const masterGain = new Tone.Gain(0.7).toDestination();
    audioContext = {
      context: Tone.getContext(),
      masterGain,
      isStarted: true
    };
    return audioContext;
  };
  const loadSoundfont = async (args) => {
    const soundfont = {
      name: extractNameFromUrl(args.url),
      url: args.url,
      samples: /* @__PURE__ */ new Map(),
      isLoaded: false
    };
    try {
      await getAudioContext();
      for (let midi = 48; midi <= 84; midi++) {
        soundfont.samples.set(midi, null);
      }
      soundfont.isLoaded = true;
      console.log(`\u2713 Loaded Tone.js soundfont: ${soundfont.name}`);
    } catch (error) {
      console.error(`Failed to initialize soundfont ${soundfont.name}:`, error);
      throw error;
    }
    return soundfont;
  };
  const createSynth = (args) => {
    const activeVoices = /* @__PURE__ */ new Map();
    const engineInstance = { getAudioContext, loadSoundfont, createSynth };
    const playNote = (noteArgs) => {
      const voiceId = `${noteArgs.midi}-${Date.now()}-${Math.random()}`;
      const promise = playNoteInternal({
        ...noteArgs,
        voiceId,
        soundfont: args.soundfont,
        config: args.config,
        engine: engineInstance
      });
      const voice = {
        id: voiceId,
        midi: noteArgs.midi,
        source: null,
        gainNode: null,
        panNode: null,
        isPlaying: false,
        stop: (stopArgs) => {
          promise.then((actualVoice) => actualVoice.stop(stopArgs)).catch(console.error);
        },
        modulate: (modArgs) => {
          promise.then((actualVoice) => actualVoice.modulate(modArgs)).catch(console.error);
        }
      };
      promise.then((actualVoice) => {
        voice.source = actualVoice.source;
        voice.gainNode = actualVoice.gainNode;
        voice.panNode = actualVoice.panNode;
        voice.isPlaying = actualVoice.isPlaying;
      }).catch(console.error);
      activeVoices.set(voiceId, voice);
      return voice;
    };
    const stopNote = (args2) => {
      args2.voice.stop({ stopTime: args2.stopTime });
      activeVoices.delete(args2.voice.id);
    };
    return {
      playNote,
      stopNote
    };
  };
  return {
    getAudioContext,
    loadSoundfont,
    createSynth
  };
};
var playNoteInternal = async (args) => {
  const audioCtx = await args.engine.getAudioContext();
  const frequency = midiToFrequency(args.midi);
  const validateEnvelopeParam = (value, defaultValue, minValue) => {
    if (value === void 0 || value === null || isNaN(value)) return defaultValue;
    return Math.max(value / 1e3, minValue);
  };
  const synth = new Tone.Synth({
    oscillator: {
      type: "sawtooth"
    },
    envelope: {
      attack: validateEnvelopeParam(args.attack, 0.01, 1e-3),
      // Default 10ms, min 1ms
      decay: 0.3,
      sustain: 0.6,
      release: validateEnvelopeParam(args.release, 0.1, 0.01)
      // Default 100ms, min 10ms
    }
  });
  const validateGain = (velocity, gainValue, configGain) => {
    const safeVelocity = Math.max(0, Math.min(100, velocity || 70));
    const safeGain = Math.max(0, Math.min(100, gainValue || configGain || 70));
    return safeVelocity / 100 * (safeGain / 100);
  };
  const validatePan = (panValue) => {
    if (panValue === void 0 || panValue === null || isNaN(panValue)) return 0;
    return Math.max(-1, Math.min(1, panValue / 100));
  };
  const gainNode = new Tone.Gain(validateGain(args.velocity, args.gain, args.config.gain));
  const panNode = new Tone.Panner(validatePan(args.pan));
  synth.connect(gainNode);
  gainNode.connect(panNode);
  panNode.connect(audioCtx.masterGain);
  if (args.detune) {
    try {
      synth.detune.value = args.detune;
    } catch (error) {
      console.warn("Unable to set detune:", error);
    }
  }
  const calculateStartTime = (startTime2) => {
    if (startTime2 === void 0 || startTime2 === null) return Tone.now();
    if (startTime2 <= 0) return Tone.now();
    return Tone.now() + startTime2;
  };
  const startTime = calculateStartTime(args.startTime);
  if (args.duration && args.duration > 0) {
    const durationInSeconds = Math.max(args.duration / 1e3, 0.01);
    try {
      synth.triggerAttackRelease(frequency, durationInSeconds, startTime);
    } catch (error) {
      console.error("Error in triggerAttackRelease:", error);
      try {
        synth.triggerAttackRelease(frequency, durationInSeconds, Tone.now());
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
      }
    }
  } else {
    try {
      synth.triggerAttack(frequency, startTime);
    } catch (error) {
      console.error("Error in triggerAttack:", error);
      try {
        synth.triggerAttack(frequency, Tone.now());
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
      }
    }
  }
  const voice = {
    id: args.voiceId,
    midi: args.midi,
    source: synth,
    // Tone.Synth instead of Tone.Player
    gainNode,
    panNode,
    isPlaying: true,
    stop: (stopArgs) => {
      const stopTime = stopArgs?.stopTime || Tone.now();
      const fadeTime = stopArgs?.fadeTime || 0.05;
      if (voice.isPlaying && synth) {
        try {
          if (!args.duration) {
            synth.triggerRelease(stopTime + fadeTime);
          }
          voice.isPlaying = false;
          setTimeout(() => {
            synth.dispose();
            gainNode.dispose();
            panNode.dispose();
          }, fadeTime * 1e3 + 100);
        } catch (error) {
          voice.isPlaying = false;
        }
      }
    },
    modulate: (modArgs) => {
      if (!gainNode || !panNode) return;
      const now2 = Tone.now();
      const startTime2 = modArgs.startTime || now2;
      const duration = Math.max((modArgs.duration || 0) / 1e3, 0);
      if (modArgs.gain !== void 0 && !isNaN(modArgs.gain)) {
        const targetGain = validateGain(args.velocity, modArgs.gain, args.config.gain);
        try {
          if (duration > 0) {
            gainNode.gain.linearRampTo(targetGain, duration, startTime2);
          } else {
            gainNode.gain.value = targetGain;
          }
        } catch (error) {
        }
      }
      if (modArgs.pan !== void 0 && !isNaN(modArgs.pan)) {
        const targetPan = validatePan(modArgs.pan);
        try {
          if (duration > 0) {
            panNode.pan.linearRampTo(targetPan, duration, startTime2);
          } else {
            panNode.pan.value = targetPan;
          }
        } catch (error) {
        }
      }
    }
  };
  return voice;
};
var midiToFrequency = (midi) => {
  return 440 * Math.pow(2, (midi - 69) / 12);
};
var extractNameFromUrl = (url) => {
  const match = url.match(/([^/]+)\.sf2?$/i);
  return match ? match[1] : "unknown";
};
var audioEngine = createAudioEngine();

// src/player.ts
var createPlayer = (args) => {
  const player = {
    load: async (config) => {
      console.log("Loading soundfonts:", config);
      const gear = {};
      for (const [name, url] of Object.entries(config)) {
        console.log(`Loading ${name} from ${url}...`);
        const soundfont = await audioEngine.loadSoundfont({ url });
        const synth = audioEngine.createSynth({ soundfont, config: args.config });
        gear[name] = createInstrument({
          name,
          soundfontUrl: url,
          synth,
          config: args.config
        });
        console.log(`\u2713 ${name} loaded successfully`);
      }
      return gear;
    }
  };
  return player;
};

// src/wembley.ts
var createWembley = () => {
  const wembley2 = {
    configure: (config) => {
      const finalConfig = {
        gain: 70,
        maxVelocity: 85,
        minVelocity: 45,
        voicings: {},
        ...config
      };
      console.log("Configuring wembley with:", finalConfig);
      return createPlayer({ config: finalConfig });
    }
  };
  return wembley2;
};

// src/index.ts
var wembley = createWembley();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  wembley
});
