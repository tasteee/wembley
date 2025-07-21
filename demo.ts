import { wembley } from './src/index.js'

const main = async () => {
  console.log('🎹 Wembley Demo\n')
  
  // Configure wembley with custom settings
  const player = wembley.configure({
    gain: 70,
    maxVelocity: 85,
    minVelocity: 45,
    voicings: {
      reversed: (notes) => notes.reverse(),
      only2and3: (notes) => [notes[1], notes[2]]
    }
  })

  // Load soundfonts
  const gear = await player.load({
    piano: 'https://url.to/piano.sf2',
    dustyGuitar: '/sounds/dusty_guitar.sf2',
  })

  console.log('\n--- Single Notes ---')
  
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

  console.log('\n--- Multiple Notes ---')
  
  // Playing notes with the same swagger you played a note.
  gear.dustyGuitar.notes(['C3', 'E4']).play()
  gear.dustyGuitar.notes(['C3', 'E4']).after(150).play()
  gear.dustyGuitar.notes(['C3', 'E4']).duration(500).play()
  gear.dustyGuitar.notes(['C3', 'E4']).velocity(65).play()
  gear.dustyGuitar.notes(['C3', 'E4']).velocity(65, 85).play()

  // But playing multiple notes, you have that stagger swagger.
  gear.dustyGuitar.notes(['C3', 'E4']).stagger(150).play()

  console.log('\n--- Chords ---')
  
  // Playing chords is pretty dope.
  gear.piano.chord('C#m').play()
  gear.piano.chord('C#m').after(250).play()
  gear.piano.chord('C#m').velocity(45, 75).play()

  // And a chord can be staggered, too.
  gear.piano.chord('C#m').stagger(200).play()

  // With chords, you can apply modifications.
  gear.piano.chord('F#')
    .octave(3)
    .inversion(1)
    .voicing('cluster')
    .bassNote('B')
    .play()

  console.log('\n--- Advanced Examples ---')
  
  // General modifiers...
  gear.piano.note('C3')
    .velocity(90)         // 0-100
    .after(250)           // delay in ms
    .duration(400)        // in ms
    .detune(-50)          // cents
    .attack(5)            // ms
    .release(100)         // ms
    .gain(50)             // 0-100
    .pan(-70)             // -100-100
    .play()

  // Stop notes with that swagger, too.
  const playingNote = gear.piano.note('D4').play()
  playingNote.after(300).gain(0).pan(30).stop()

  console.log('\n--- Custom Voicings ---')
  
  // Using custom voicings from configuration
  gear.piano.chord('Cmaj7').voicing('reversed').play()
  gear.piano.chord('Cmaj7').voicing('only2and3').play()

  console.log('\n🎵 Demo complete!')
}

main().catch(console.error)