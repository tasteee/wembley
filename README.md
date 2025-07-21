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

```js
import wembley from 'wembley'

const gear = await wembley.load({
  lofiFlute: 'https://url.to/lofi_flute.sf2',
  dustyGuitar: '/sounds/dusty_guitar.sf2',
})

// Move fast and break things.
gear.lofiFlute.note('C3')
  .pan(-20)
  .duration(300)
  .after(100)
  .gain(50)
  .play()

// Or maybe plan ahead.
const noteSettings = {
  pan: -20,
  gain: 50,
  duration: 300,
  after: 100,
}

gear.dustyGuitar.note('C3').play(noteSettings)
```

---

## 🎛 Playing Notes

```js
// Play a note.
gear.piano.note('C3').play()

// Play a note 100ms from now.
gear.kickDrum.note('C3').after(100).play()

// Play a note for 250ms.
gear.lofiFlute.note('C3').duration(250).play()

// Play a note panned all the way to the left.
gear.lofiFlute.note('C3').pan(-50).play()
```

Play multiple notes:

```js
// The same API (above) is available.
gear.dustyGuitar.notes(['C3', 'E4']).play()
```

Staggered playback:

```js
// Stagger the notes you play.
gear.dustyGuitar.notes(['C3', 'E4']).staggerDelay(100).play()
```

## 🎹 Chords

```js
// Play entire chords with modifications.
gear.piano.chord('C#m')
  .octave(3)
  .inversion(1)
  .voicing('clustered')
  .bassNote('E')
  .play()
```

## 🔊 Modifiers

```js
gear.lofiFlute.note('C3')
  .gain(60)             // 0-100
  .pan(-20)             // -50 to 50
  .velocity(90)         // 0-127
  .after(250)           // delay in ms
  .duration(400)        // in ms
  .detune(-50)          // cents
  .attack(5)            // ms
  .release(100)         // ms
  .play()
```

On `notes()` and `chord()`, you can also do:

```js
// first note: 500ms, second note: 250ms, third note: 500ms, ...etc
gear.flute.notes(cMinNotes).durations([500, 250]).play()

// each note will have a randomized velocity betwen 60 and 90.
gear.flute.notes(cMinNotes).velocityRange([60, 90]).play()

// Each note will land somewhere between 20L and 20R.
gear.flute.notes(cMinNotes).panRange([-20, 20]).play()

gear.flute.notes(cMinNotes)
  .humanize.timing(10)
  .humanize.velocity(15)
  .play()
```

## ⏱ Scheduling

```js
gear.bass.note('C1').after(500).play()
gear.snare.note('D2').at('1:2').play() // future beat grid support
```

Stop notes:

```js
note.stop()                    // immediately
note.after(300).stop()         // scheduled
note.after(300).gain(0).pan(30).stop() // fade out
```

## 🎚 Effects (planned for v2)

### 🔸 Apply effects to a note:

```js
gear.snare.note('C3')
  .effect()
    .hallReverb.mix(50)
    .hallReverb.size(60)
    .lowPassFilter.cutoff(4000)
  .play()
```

### 🔸 Apply effects to an instrument:

```js
gear.lofiFlute.effect()
  .lowPassFilter.cutoff(6500)
```

### 🔸 Define reusable effects

```js
const p0 = wembley.effect('preset0')
  .hallReverb.mix(40)
  .lowPassFilter.cutoff(5000)
  .save()

gear.dustyGuitar.effects.add(p0)
```

## 🧠 Configuration

Register instruments:

```js
const gear = await wembley.load({
  piano: '/sf2/piano.sf2',
  bass: '/sf2/bass.sf2'
})
```

Define voicing algorithms:

```js
wembley.configure({
  voicings: {
    "wide": (notes) => customVoicing(notes),
    "clustered": (notes) => clusterThem(notes),
  }
})
```

---

## 📦 Roadmap

* ✅ per-note, per-instrument effects (API stub only in V1)
* ✅ `.chord()` voicing + inversion support
* ✅ humanization helpers
* ⏳ master bus effects / global chain
* ⏳ MIDI support
* ⏳ beat grid scheduling (`.at('1:2')`)
* ⏳ loop / sustain pedal
