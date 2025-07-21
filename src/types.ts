export type VoicingT =
  | 'open'
  | 'closed'
  | 'drop2'
  | 'drop3'
  | 'drop2and4'
  | 'rootless'
  | 'spread'
  | 'cluster'
  | 'shell'
  | 'pianistic'
  | 'guitaristic'
  | 'orchestral'

export type VoicingFunctionT = (notes: string[]) => string[]

export type ConfigT = {
  gain?: number
  maxVelocity?: number
  minVelocity?: number
  voicings?: Record<string, VoicingFunctionT>
}

export type SoundfontLoadConfigT = Record<string, string>

export type NoteT = {
  velocity: ((vel: number) => NoteT) & ((minVel: number, maxVel: number) => NoteT)
  after: (ms: number) => NoteT
  duration: (ms: number) => NoteT
  detune: (cents: number) => NoteT
  attack: (ms: number) => NoteT
  release: (ms: number) => NoteT
  gain: (gain: number) => NoteT
  pan: (pan: number) => NoteT
  play: () => PlayingNoteT
  stop: () => void
}

export type NotesT = {
  velocity: ((vel: number) => NotesT) & ((minVel: number, maxVel: number) => NotesT)
  after: (ms: number) => NotesT
  duration: (ms: number) => NotesT
  stagger: (ms: number) => NotesT
  detune: (cents: number) => NotesT
  attack: (ms: number) => NotesT
  release: (ms: number) => NotesT
  gain: (gain: number) => NotesT
  pan: (pan: number) => NotesT
  play: () => PlayingNotesT
  stop: () => void
}

export type ChordT = {
  velocity: ((vel: number) => ChordT) & ((minVel: number, maxVel: number) => ChordT)
  after: (ms: number) => ChordT
  duration: (ms: number) => ChordT
  stagger: (ms: number) => ChordT
  octave: (octave: number) => ChordT
  inversion: (inversion: number) => ChordT
  voicing: (voicing: VoicingT | string) => ChordT
  bassNote: (note: string | number) => ChordT
  detune: (cents: number) => ChordT
  attack: (ms: number) => ChordT
  release: (ms: number) => ChordT
  gain: (gain: number) => ChordT
  pan: (pan: number) => ChordT
  play: () => PlayingNotesT
  stop: () => void
}

export type PlayingNoteT = {
  after: (ms: number) => PlayingNoteT
  gain: (gain: number) => PlayingNoteT
  pan: (pan: number) => PlayingNoteT
  stop: () => void
}

export type PlayingNotesT = {
  after: (ms: number) => PlayingNotesT
  gain: (gain: number) => PlayingNotesT
  pan: (pan: number) => PlayingNotesT
  stop: () => void
}

export type InstrumentT = {
  note: (note: string) => NoteT
  notes: (notes: string[]) => NotesT
  chord: (chord: string) => ChordT
}

export type GearT = Record<string, InstrumentT>

export type PlayerT = {
  load: (config: SoundfontLoadConfigT) => Promise<GearT>
}

export type WembleyT = {
  configure: (config?: ConfigT) => PlayerT
}