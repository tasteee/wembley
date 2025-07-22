# wembley

A delightful, DX-obsessed soundfont sequencer for the web.
Chainable, expressive, and stupid-easy to get ideas flowing.

## Install

```bash
# choose your path
npm add -S wembley
yarn add -S wembley
pnpm add -S wembley
bun add -S wembley
```

```ts
import {wembley} from 'wembley'

const gear = await wembley.initialize({
	gain: 70,
	maxVelocity: 85,
	minVelocity: 45,

	voicings: {
		reversed: (notes) => notes.reverse(),
		only2and3: (notes) => [notes[1], notes[2]],
    root: (notes) => [notes[0]]
	},

  instruments: {
    piano: {
      url: 'https://url.to/piano.sf2',
      minVelocity: 22,
      maxVelocity: 68,
      gain: 55,
      pan: 0
    }
  }
})

gear.piano.note('C3').play()
gear.piano.notes(['C3', 'E4']).play()
gear.piano.chord('C#min').play()

gear.piano.note('C3')
  .velocity(45)
  .pan(-25)
  .play()

gear.piano.notes([45, 56, 77])
  .minVelocity(44)
  .maxVelocity(65)
  .play()

gear.piano.chord('Cmin7')
  .duration(500)
  .after(250)
  .play()

gear.piano.note('C3')
  .duration(30000)
  .play()

gear.piano.note('C3').stop()

// It is possible to have a single instument
// play the same note multiple times without
// stopped the previous performance of the note.

gear.piano.notes(['C3', 'C3']).duration(20000).play()

// In this case, note('C3').stop() will end all
// instances of the performance of note C3 from
// the piano.

gear.piano.note('C3').stop()

// Sometimes, though, you may need to be able to end one
// of the note playback instances, but not all.

const instance0 = gear.piano.note('C3').duraiton(10000).play()
const instance1 = gear.piano.note('C3').duraiton(10000).play()

// play() returns an instance or array of instances of the note
// or notes being played. Those instances can be used to target
// a specific instance of a note being played.

instance0.stop()

// #h4n dealing with a notes array, as we saw a moment ago,
// you will receive an array of note instances returned from play().

const noteInstances = gear.piano.notes(['C3', 'C3'] )
  .duration(25000)
  .play()

noteInstances[0].stop()


// When playing multiple notes or a chord,
// which is essentially handled as the array
// of notes the chord symbol represents,
// you can stagger the playback of the notes.
// In this instance, each note provided will
// play 250ms after the previous one. (Note that
// the first note is not delayed, it plays immediately.)

gear.piano.notes([...]).stagger(250).play()

// Chords are just shortcuts to passing in
// specifically derived sets of notes. So this
// chord() call...

gear.piano.chord('C').play()

// Is equivalent to doing:

gear.piano.notes(['C3', 'E3', 'G3'])


// With chords, you can apply modifications.

piano
	.chord('F#')
	.octave(3)
	.inversion(1)
	.voicing('clustered')
	.bassNote('B') // or a number (indexed)
  .bassOctave(2)
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

// You can provide your own voicing algorithms
// when you initialize wembley.

const gear = await wembly.initialize({
  ...other configuration options,

  voicings: {
		reversed: (notes) => notes.reverse(),
		only2and3: (notes) => [notes[1], notes[2]],
    root: (notes) => [notes[0]]
	},
})

// General modifiers that can be applied
// to a single note, multiple notes, or a chord.

gear.piano
	.note('C3')
	.velocity(90) // 0-100
	.velocity(50, 100) // 0-max, min-100
	.after(250) // delay in ms
	.duration(400) // in ms
	.detune(-50) // cents
	.attack(5) // ms
	.release(100) // ms
	.gain(50) // 0-100
	.pan(-70) // -100-100
	.play()

// You can stop notes with
// modifiers, too.

const note = gear.piano.note('C2').pan(-100).play()
note.stop() // stop immediately
note.after(300).stop() // stop in 300ms

// With this setup, between right now and 1000ms
// from now when the note is stopped, its man
// will tween to 100% right and its gain will tween
// to 0 (fade out). Consider the current pan
// and gain to be 0% and the values we provide
// on our stop() chain to be 100% values -- what
// the values should be at the moment of stopping
// the note.

note.after(1000).pan('100R').gain(0).stop()

// And that works with multiple notes and chords too.

const noteInstances = gear.piano.notes([...]).pan(-100).gain(44).play()
noteInstances.after(1000).pan('100R').gain(0).stop()

const chordInstance = gear.piano.chord('F#C').pan(-100).gain(44).play()
chordInstance.after(1000).pan('100R').gain(0).stop()

// On a chord instance object, you can access the individual
// note instances. chordInstance.notes is an array, but
// it is also a function that you can invoke with a note
// string to get a specific note out.

chordInstances.notes // ['C3', 'E3, 'G3']
chordInstances.notes('C3').stop()
chordInstances.notes.forEach(note => note.stop()
```

## Soundfonts

Many repositories allow you to browse, download, and use soundfonts, often providing direct file URLs. Examples include:

[Polyphone's online library](https://www.polyphone.io/)
[Archive.org's collection of sf2 soundfonts](https://forum.audiob.us/discussion/50062/your-favorite-places-to-get-free-and-legal-soundfonts)
[Soundfonts4U site](https://forum.audiob.us/discussion/50062/your-favorite-places-to-get-free-and-legal-soundfonts)
[DarkeSword's soundfont archive](https://forum.audiob.us/discussion/50062/your-favorite-places-to-get-free-and-legal-soundfonts)
[Soundfonts at KeyMusician (FluidR3_GM.sf2)](https://member.keymusician.com/Member/FluidR3_GM/index.html)

While these sites often offer downloads rather than a hotlink-ready URL, you can upload any sf2 file you want to your own storage (like GitHub or a static file server) and serve them via URL.
