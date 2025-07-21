**NOTE: This is merely a conceptual API. There has been no code written. Do not attempt to install and use this yet.**

# wembley 🎹

A delightful, DX-obsessed soundfont sequencer for the web.
Chainable, expressive, and stupid-easy to get ideas flowing.

## 🚀 Quickstart

```bash
npm add -S wembley
yarn add -S wembley
pnpm add -S wembley
bun add -S wembley
# you get the picture
```

```ts
import wembley from 'wembley'

// set defaults and other settings.
const player = wembley.configure({
  gain: 70,
  maxVelocity: 85,
  minVelocity: 45,

  voicings: {
    reversed: (notes) => notes.reverse(),
    only2and3: (notes) => [notes[1], notes[2]]
  }
})

const gear = await player.load({
  // load from a URL.
  piano: 'https://url.to/piano.sf2',
  // or a local URL.
  dustyGuitar: '/sounds/dusty_guitar.sf2',
})

// Play a note. Stop a note.
gear.piano.note('C3').play()
gear.piano.note('C3').stop()

// Play a note. Get a note. Stop that note.
const note = gear.piano.note('C3').velocity(65).play()
note.stop()

// Play a note, but with swagger.
gear.piano.note('C3').velocity(65, 85).play()
gear.piano.note('C3').after(100).play()
gear.piano.note('C3').duration(250).play()

// Playing notes with the same swagger you played a note.
gear.dustyGuitar.notes(['C3', 'E4']).play()
gear.dustyGuitar.notes(['C3', 'E4']).after(150).play()
gear.dustyGuitar.notes(['C3', 'E4']).duration(500).play()
gear.dustyGuitar.notes(['C3', 'E4']).velocity(65).play()
gear.dustyGuitar.notes(['C3', 'E4']).velocity(65, 85).play()

// But playing multiple notes, you have that stagger swagger.
gear.dustyGuitar.notes(['C3', 'E4']).stagger(150).play()

// Playing chords is pretty dope.
gear.piano.chord('C#m').play()
gear.piano.chord('C#m').after(250).play()
gear.piano.chord('C#m').velocity(45, 75).play()

// And a chord can be staggered, too.
// Chords are just shortcuts to passing in
// specifically derived sets of notes.
gear.piano.chord('C#m').stagger(200).play()

// With chords, you can apply modifications.
piano.chord('F#')
  .octave(3)
  .inversion(1)
  .voicing('clustered')
  .bassNote('B') // or a number (indexed)
  .play()

// Supported voicings are:
type VoicingT =
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

// General modifiers...
gear.piano.note('C3')
  .velocity(90)         // 0-100
  .velocity(50, 100)    // 0-max, min-100
  .after(250)           // delay in ms
  .duration(400)        // in ms
  .detune(-50)          // cents
  .attack(5)            // ms
  .release(100)         // ms
  .gain(50) // 0-100
  .pan(-70) // -100-100
  .play()

// Stop notes with that swagger, too.
note.stop() // stop immediately
note.after(300).stop() // stop in 300ms

// Stop the note 300ms from now, but transition
// the gain to 0 and the pan to 30 between now and then.
note.after(300).gain(0).pan(30).stop() 
```
