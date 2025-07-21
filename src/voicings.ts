import { transposeNote } from './utils/note-parser.js'
import type { VoicingT } from './types.js'

export const applyVoicing = (args: { notes: string[]; voicing: VoicingT }) => {
  const voicingFunctions: Record<VoicingT, (notes: string[]) => string[]> = {
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
  }
  
  const voicingFunction = voicingFunctions[args.voicing]
  return voicingFunction(args.notes)
}

const openVoicing = (notes: string[]) => {
  // Spread notes across wider range
  return notes.map((note, index) => {
    const semitones = index * 7 // Fifth intervals
    return transposeNote({ note, semitones })
  })
}

const closedVoicing = (notes: string[]) => {
  // Keep notes close together
  return notes
}

const drop2Voicing = (notes: string[]) => {
  if (notes.length < 3) return notes
  
  const result = [...notes]
  // Drop the second highest note down an octave
  const secondHighest = result[result.length - 2]
  result[result.length - 2] = transposeNote({ note: secondHighest, semitones: -12 })
  return result
}

const drop3Voicing = (notes: string[]) => {
  if (notes.length < 4) return notes
  
  const result = [...notes]
  // Drop the third highest note down an octave
  const thirdHighest = result[result.length - 3]
  result[result.length - 3] = transposeNote({ note: thirdHighest, semitones: -12 })
  return result
}

const drop2and4Voicing = (notes: string[]) => {
  if (notes.length < 4) return notes
  
  let result = [...notes]
  // Apply both drop2 and drop3 transformations
  result = drop2Voicing(result)
  result = drop3Voicing(result)
  return result
}

const rootlessVoicing = (notes: string[]) => {
  // Remove the root note (first note)
  return notes.slice(1)
}

const spreadVoicing = (notes: string[]) => {
  // Spread notes across multiple octaves
  return notes.map((note, index) => {
    const octaveSpread = Math.floor(index / 2)
    return transposeNote({ note, semitones: octaveSpread * 12 })
  })
}

const clusterVoicing = (notes: string[]) => {
  // Cluster notes close together (add seconds)
  return notes.flatMap((note, index) => {
    if (index === 0) return [note]
    return [note, transposeNote({ note, semitones: 1 })]
  })
}

const shellVoicing = (notes: string[]) => {
  // Just root and seventh (shell voicing)
  if (notes.length >= 4) {
    return [notes[0], notes[3]]
  }
  return [notes[0], notes[notes.length - 1]]
}

const pianisticVoicing = (notes: string[]) => {
  // Common piano voicing - left hand bass, right hand chord
  const bass = transposeNote({ note: notes[0], semitones: -12 })
  const upperNotes = notes.slice(1).map(note => 
    transposeNote({ note, semitones: 12 })
  )
  return [bass, ...upperNotes]
}

const guitaristicVoicing = (notes: string[]) => {
  // Guitar-friendly voicing within 4-fret span
  return notes.map((note, index) => {
    const fretOffset = index * 5 // Perfect fourth intervals
    return transposeNote({ note, semitones: fretOffset })
  })
}

const orchestralVoicing = (notes: string[]) => {
  // Wide orchestral spread
  return notes.map((note, index) => {
    const octaveSpread = index * 12 // Full octave spread
    return transposeNote({ note, semitones: octaveSpread })
  })
}