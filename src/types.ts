// Type definitions for Wembley

export type TodoT = any
export type InstrumentConfigMapT = Record<string, InstrumentConfigT>
export type InstrumentMapT = Record<string, Instrument>

export type AudioVoiceT = {
	id: string
	midi: number
	soundfontNote: any // The playing note from soundfont-player
	isPlaying: boolean
	stop: (args?: { stopTime?: number; fadeTime?: number }) => void
	modulate: (args: { gain?: number; pan?: number; startTime?: number; duration?: number }) => void
}

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

// [target].stop() // stop all notes from all instruments
// [target].stop(string) // (note) stop matching note from all instruments
// [target].stop(number) // (midi note) stop matching midi note from all instruments
// [target].stop(string[]) // (notes) stop all matching notes from all instruments
// [target].stop(number[]) // (midi notes) stop all matching midi notes from all instruments
// [target].stop(string) // (chord symbol) stop all notes in chord from all instruments
export type StopTargetT = string | number | string[] | number[]

// I am still trying to think this one through. I think we need a central store,
// like a fast food drive in that serves up ALL the noteInstances. So we can order
// noteInstances that have specific names ('C3' for example), and the store will give
// us ALL 'C3' noteInstances that have played during this session, or that are curerntly
// playing. So we can specific 'C3' notes that isPlaying is true. Now we get all that are
// currently playing, from all gears and all instruments. So we can specifiy C3, isPlaying,
// and of instrument "piano". Or we can request noteInstances that were played as a part of
// a specific cord symbol. Or that were played along side some other note(s). Basically, the
// idea is for a search engine for noteInstances.
export type InstanceTrackerT = {
	noteInstances: Map<string, Set<AudioVoiceT>>
	chordInstances: Map<string, Set<AudioVoiceT>>
	notesInstances: Map<string, Set<AudioVoiceT>>
	allInstances: Set<AudioVoiceT>
}

export type BaseSettingsT = {
	gain?: number
	maxVelocity?: number
	minVelocity?: number
	velocity?: number
	pan?: number
}

export type ConfigT = {
	gain?: number
	maxVelocity?: number
	minVelocity?: number
	velocity?: number
	pan?: number
}

export type SoundfontLoadConfigT = Record<string, string>

export type InstrumentConfigT = {
	url: string
	gain?: number
	velocity?: number
	minVelocity?: number
	maxVelocity?: number
	pan?: number
}

export type NewSoundfontLoadConfigT = Record<string, InstrumentConfigT>

export type InitializeConfigT = {
	id?: string // may be useful later
	gain?: number // default gain for all instruments
	velocity?: number // default velocity for all instruments
	pan?: number // default pan for all instruments
	// it is good to set a default min/maxVelocity because the
	// defaults are 0 and 127, respectively. If you set maxVelocity to 80
	// but you don't set minVelocity, then your notes will be played
	// anywhere between 0 and 80, which is not a super
	// useful or intentful range. Be explicit about it.
	// If you set minVelocity, but not maxVelocity, then the max
	// will be set to 127, so some of your notes may hit VERY hard. (So set BOTH.)
	// If neither min/max velocity are set, then the static velocity property
	// is used, which defaults to 75.
	minVelocity?: number // default minimum velocity for all instruments
	maxVelocity?: number // default maximum velocity for all instruments
	attack?: number // default attack time for all instruments
	release?: number // default release time for all instruments
	detune?: number // default detune amount for all instruments
	duration?: number // default duration for all instruments
	after?: number
	pan?: number
	voicings?: Record<string, VoicingFunctionT>
	instruments?: Record<string, InstrumentConfigT>
}

// NoteDesignerT is an object with chained methods
// up until play() or stop() is invoked. Its sole
// purpose is to design a note for playback.
export type NoteDesignerT = {
	velocity: (velocity: number, maxVelocity?: number) => NoteDesignerT
	minVelocity: (velocity: number) => NoteDesignerT
	maxVelocity: (velocity: number) => NoteDesignerT
	after: (milliseconds: number) => NoteDesignerT
	duration: (milliseconds: number) => NoteDesignerT
	detune: (cents: number) => NoteDesignerT
	attack: (milliseconds: number) => NoteDesignerT
	release: (milliseconds: number) => NoteDesignerT
	gain: (gain: number) => NoteDesignerT
	pan: (pan: number) => NoteDesignerT
	play: () => NoteInstanceT
	stop: () => void
}

// NotesDesignerT is an object with chained methods
// up until play() or stop() is invoked. Its sole
// purpose is to design notes for playback.
export type NotesDesignerT = {
	minVelocity: (velocity: number) => NotesDesignerT
	maxVelocity: (velocity: number) => NotesDesignerT
	velocity: (velocity: number, maxVelocity?: number) => NotesDesignerT
	after: (milliseconds: number) => NotesDesignerT
	duration: (milliseconds: number) => NotesDesignerT
	stagger: (milliseconds: number) => NotesDesignerT
	detune: (cents: number) => NotesDesignerT
	attack: (milliseconds: number) => NotesDesignerT
	release: (milliseconds: number) => NotesDesignerT
	gain: (gain: number) => NotesDesignerT
	pan: (pan: number) => NotesDesignerT
	// play: () => NoteInstanceT[]
	play: () => any
	stop: () => void
}

// ChordDesignerT is an object with chained methods
// up until play() or stop() is invoked. Its sole
// purpose is to design notes for playback.
// It is just an extended version of NotesDesignerT.
// Under the hood it just grabs the notes of the
// chord, but since we know it is a chord that follows
// rules of music theory, we can also offer to handle
// things like setting an inversion, voicing, etc.
export type ChordDesignerT = {
	velocity: (velocity: number, maxVelocity?: number) => ChordDesignerT
	minVelocity: (velocity: number) => ChordDesignerT
	maxVelocity: (velocity: number) => ChordDesignerT
	after: (milliseconds: number) => ChordDesignerT
	duration: (milliseconds: number) => ChordDesignerT
	stagger: (milliseconds: number) => ChordDesignerT
	octave: (octave: number) => ChordDesignerT
	inversion: (inversion: number) => ChordDesignerT
	voicing: (voicing: VoicingT | string) => ChordDesignerT
	bassNote: (note: string | number) => ChordDesignerT
	detune: (cents: number) => ChordDesignerT
	attack: (milliseconds: number) => ChordDesignerT
	release: (milliseconds: number) => ChordDesignerT
	gain: (gain: number) => ChordDesignerT
	pan: (pan: number) => ChordDesignerT
	play: () => NoteInstanceT[]
	stop: () => void
}

// ChordPlayFeaturesT represents the methods that can be chained
// to set up a custom playback of a chord. It has all of the
// methods that PlayFeaturesT has, but also adds a few more that
// we know we can accurately perform given that the notes being
// played fit into the rules of a chord in music theory.
export type ChordPlayFeaturesT = PlayFeaturesT & {
	octave: (octave: number) => ChordPlayFeaturesT
	inversion: (inversion: number) => ChordPlayFeaturesT
	voicing: (voicing: VoicingT | string) => ChordPlayFeaturesT
	bassNote: (note: string | number) => ChordPlayFeaturesT
}

// PlayFeaturesT reppresents the methods that can be chained
// to set up a custom playback of a note, or group of notes.
export type PlayFeaturesT = {
	velocity: (velocity: number) => PlayFeaturesT
	minVelocity: (velocity: number) => PlayFeaturesT
	maxVelocity: (velocity: number) => PlayFeaturesT
	after: (milliseconds: number) => PlayFeaturesT
	duration: (milliseconds: number) => PlayFeaturesT
	detune: (cents: number) => PlayFeaturesT
	attack: (milliseconds: number) => PlayFeaturesT
	release: (milliseconds: number) => PlayFeaturesT
	gain: (gain: number) => PlayFeaturesT
	pan: (pan: number) => PlayFeaturesT
}

// StopFeaturesT represents the methods that can be chained
// to set up a custom stopping of a note, or group of notes.
// You can say *after 500ms begin the transition, it will
// last *duration 1000ms, the and tween the *pan and *gain
// between the start of the transition and the end to be
// the given values at the end. So, for example:
// note.after(500).duration(1000).gain(0).pan(-100).stop()
// will, in 500ms from now, begin tweening the gain from
// its current value to 0 at the end, tweening pan from its
// current value to -100 at the end, and the whole process,
// once it has begun, will last 1000ms.
export type StopFeaturesT = {
	after: (milliseconds: number) => StopFeaturesT
	duration: (milliseconds: number) => StopFeaturesT
	gain: (gain: number) => StopFeaturesT
	pan: (pan: number) => StopFeaturesT
	stop: () => void
}

export type NoteInstanceMap = {
	id: string // Unique identifier for the note instance
	note: string // The note name, e.g. 'C3'
	midi: number // The MIDI number of the note
	isPlaying: boolean // Whether the note is currently playing
	soundfontNote: AudioVoiceT // The playing note from soundfont-player
	gain: number // Gain applied to the note
	pan: number // Panning applied to the note
	detune: number // Detuning applied to the note
	attack: number // Attack time in milliseconds
	release: number // Release time in milliseconds
	duration: number // Duration of the note in milliseconds
}

export type NoteInstanceSettingsT = {
	velocity: number
	pan: number | string
	attack: number
	release: number
	detune: number
	duration: number
	after: number
	midi: number
}

// NoteInstanceT is a singular instance of a note
// that is / was playing. It can be used to
// laser target a SPECIFIC note to stop it.
// (Or to start playback over again with play())
// Stopping the note can be scheduled.
// NoteInstanceT will still exist even after
// the note has stopped playing, but it will
// be deactivated so methods called on it
// will not do anything (except log in dev mode).
export type NoteInstanceT = StopFeaturesT & {
	id: string
	name: string // 'C#3' etc
	// settings
	settings: NoteInstanceSettingsT
	play: () => NoteInstanceT
	stop: () => void
}

// InstrumentT has a settings object that
// holds all of the original instrument config
// values, as well as a few that are added internally,
// including the reference to the soundfont that
// is loaded to create the instrument
export type InstrumentSettingsT = {
	id: string
	name: string
	url: string
	pan: number
	gain: number
	velocity: number
	minVelocity: number
	maxVelocity: number
	duration: number
	soundfont: any // The actual soundfont object
	originalConfig: NewSoundfontLoadConfigT
}

export type InstrumentT = {
	id: string // uuid
	name: string // the key of the instrument in initialize config
	settings: InstrumentSettingsT
	// begin designing a note playback.
	note: (note: string) => NoteDesignerT
	// begin designing a notes playback.
	notes: (notes: string[]) => NotesDesignerT
	// begin designing a chord playback.
	chord: (chord: string, octave?: number) => ChordDesignerT
	// stop one, many, or all notes that the instrument is playing.
	stop: (target?: StopTargetT) => any
}

export type GearT = Record<string, InstrumentT> & {
	loadInitialInstruments: () => Promise<void>
	// async load a soundfont from a url. when it is loaded,
	// build an instrument object centered around the soundfont.
	// this will return the instrument but also apply it to gear
	loadInstrument: (config: NewSoundfontLoadConfigT) => Promise<InstrumentT>
	load: (config: NewSoundfontLoadConfigT) => Promise<InstrumentT>
	stop: (target?: StopTargetT) => any
}

export type WembleyT = {
	// initializes, builds, and returns the gear
	// that all of the soundfont playing
	// will occur on.
	initialize: (config: InitializeConfigT) => Promise<GearT>
}
