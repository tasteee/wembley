import { createWembley } from './refactor/wembley.js'

// Create and export the main wembley instance
const wembley = createWembley()

// Default export for simple import (README example)
export { wembley as default }

// Named export for explicit import
export { wembley }

// Export types for consumers
export type {
	VoicingT,
	VoicingFunctionT,
	ConfigT,
	SoundfontLoadConfigT,
	InstrumentConfigT,
	NewSoundfontLoadConfigT,
	InitializeConfigT,
	NoteDesignerT as NoteT,
	NotesDesignerT as NotesT,
	ChordDesignerT as ChordT,
	NoteInstanceT as PlayingNoteT,
	InstrumentT,
	GearT,
	WembleyT
} from './types.js'
