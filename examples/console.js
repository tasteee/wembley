	const player = wembley.configure({
		gain: 70,
		maxVelocity: 85,
		minVelocity: 45,
		voicings: {
			jazzCluster: (notes) => notes.map((note) => note + '♭9'),
			arpeggiated: (notes) => notes.sort()
		}
	})

    const gear = await player.load({
    piano: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_grand_piano-ogg.js'
})

gear.piano.note('C3').play()

setTimeout(() => {
    gear.piano.note('C3').stop()
}, 5000)