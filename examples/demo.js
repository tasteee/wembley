import { wembley } from './js/index.js'

globalThis.wembley = wembley
const SF2_URL = 'https://raw.githubusercontent.com/felixroos/felixroos.github.io/main/public/Earthbound_NEW.sf2'

const store = (globalThis.store = {
	gear: null,
	gear: null,
	isLoaded: false
})

const autoFillInput = async () => {
	document.getElementById('soundfontUrl').value = SF2_URL
	showNotification('Filled!', 'info')
}

document.addEventListener('DOMContentLoaded', autoFillInput)

const handleFirstClick = async (event) => {
	console.log('🎹 Initializing Wembley Demo')
	showLoadingState()

	// Configure wembley
	store.gear = await wembley.initialize({
		gain: 70,
		maxVelocity: 85,
		minVelocity: 45,
		voicings: {
			jazzCluster: (notes) => notes.map((note) => note + '♭9'),
			arpeggiated: (notes) => notes.sort()
		},

		instruments: {
			piano: {
				url: SF2_URL
			}
		}
	})

	console.log('✅ Wembley configured successfully', store.gear)
	store.isLoaded = true
	showSuccessState()
	enableControls()
	setupEventListeners()
	updateSliderValues()
	window.removeEventListener('click', handleFirstClick)
}

document.addEventListener('click', handleFirstClick)

const setupEventListeners = () => {
	document.getElementById('loadBtn').addEventListener('click', loadSoundfont)

	// Piano key listeners (both mouse and keyboard)
	setupPianoKeys()

	// Sliders
	document.getElementById('velocitySlider').addEventListener('input', updateSliderValues)
	document.getElementById('panSlider').addEventListener('input', updateSliderValues)
	document.getElementById('durationSlider').addEventListener('input', updateSliderValues)

	// Transport controls (will be enabled after loading)
	const demoBtn = document.getElementById('demoSequenceBtn')
	const progressionBtn = document.getElementById('chordProgressionBtn')
	const stopBtn = document.getElementById('stopAllBtn')

	if (demoBtn) demoBtn.addEventListener('click', playDemoSequence)
	if (progressionBtn) progressionBtn.addEventListener('click', playChordProgression)
	if (stopBtn) stopBtn.addEventListener('click', stopAllNotes)

	// Keyboard event listeners for piano keys
	document.addEventListener('keydown', handleKeyDown)
	document.addEventListener('keyup', handleKeyUp)
}

const setupPianoKeys = () => {
	document.querySelectorAll('.piano-key').forEach((key) => {
		key.addEventListener('mousedown', (e) => {
			const note = e.target.dataset.note
			if (note) playNote(note)
			e.target.classList.add('pressed')
		})

		key.addEventListener('mouseup', (e) => {
			e.target.classList.remove('pressed')
		})

		key.addEventListener('mouseleave', (e) => {
			e.target.classList.remove('pressed')
		})
	})
}

// Key mapping for piano
const keyMap = {
	// Octave 5 (numbers row)
	1: 'C5',
	'!': 'C#5',
	2: 'D5',
	'@': 'D#5',
	3: 'E5',
	4: 'F5',
	$: 'F#5',
	5: 'G5',
	'%': 'G#5',
	6: 'A5',
	'^': 'A#5',
	7: 'B5',
	8: 'C6',
	'*': 'C#6',
	9: 'D6',

	// Octave 4 (QWERTY row)
	q: 'C4',
	w: 'C#4',
	e: 'D4',
	r: 'D#4',
	t: 'E4',
	y: 'F4',
	u: 'F#4',
	i: 'G4',
	o: 'G#4',
	p: 'A4',
	'[': 'B4',
	']': 'C5',

	// Octave 3 (ASDF row)
	a: 'C3',
	s: 'C#3',
	d: 'D3',
	f: 'D#3',
	g: 'E3',
	h: 'F3',
	j: 'F#3',
	k: 'G3',
	l: 'G#3',
	';': 'A3',
	"'": 'B3',

	// Octave 2 (ZXCV row)
	z: 'C2',
	x: 'C#2',
	c: 'D2',
	v: 'D#2',
	b: 'E2',
	n: 'F2',
	m: 'F#2',
	',': 'G2',
	'.': 'G#2',
	'/': 'A2'
}

const activeKeys = new Set()

const handleKeyDown = (e) => {
	if (activeKeys.has(e.key.toLowerCase())) return // Prevent key repeat

	const note = keyMap[e.key.toLowerCase()]
	if (note && store.isLoaded) {
		activeKeys.add(e.key.toLowerCase())
		playNote(note)
		highlightKey(e.key.toLowerCase(), true)
	}
}

const handleKeyUp = (e) => {
	activeKeys.delete(e.key.toLowerCase())
	highlightKey(e.key.toLowerCase(), false)
}

const highlightKey = (key, pressed) => {
	const keyElement = document.querySelector(`[data-key="${key}"]`)
	if (keyElement) {
		if (pressed) {
			keyElement.classList.add('pressed')
		} else {
			keyElement.classList.remove('pressed')
		}
	}
}

const playNote = (note) => {
	if (!store.gear || !note) return

	const velocity = parseInt(document.getElementById('velocitySlider').value)
	const pan = parseInt(document.getElementById('panSlider').value)
	const duration = parseInt(document.getElementById('durationSlider').value)

	try {
		console.log(`🎵 Playing note: ${note}`)
		store.gear.piano.note(note).velocity(velocity).pan(pan).duration(duration).play()
	} catch (error) {
		console.error('Error playing note:', error)
	}
}

const updateSliderValues = () => {
	const velocity = document.getElementById('velocitySlider').value
	const pan = document.getElementById('panSlider').value
	const duration = document.getElementById('durationSlider').value

	document.getElementById('velocityValue').textContent = velocity
	document.getElementById('panValue').textContent = pan
	document.getElementById('durationValue').textContent = `${duration}ms`
}

const stopAllNotes = () => {
	try {
		// Use the actual stop functionality
		if (store.gear) {
			store.gear.stop()
			console.log('🛑 Stopped all notes using gear.stop()')
		} else {
			console.log('🛑 No gear loaded - nothing to stop')
		}
		showNotification('All notes stopped', 'info')
	} catch (error) {
		console.error('Error stopping notes:', error)
		showNotification('Error stopping notes', 'error')
	}
}

const playDemoSequence = async () => {
	if (!store.gear) return

	try {
		showNotification('Playing demo sequence...', 'info')

		const notes = ['C4', 'E4', 'G4', 'C5']

		for (let i = 0; i < notes.length; i++) {
			setTimeout(() => {
				store.gear.piano.note(notes[i]).velocity(70).duration(400).play()
			}, i * 500)
		}
	} catch (error) {
		console.error('Error playing demo sequence:', error)
		showNotification('Error playing demo sequence', 'error')
	}
}

const autoFillDemoUrl = () => {
	// Use a well-known public soundfont URL
	// This is a popular piano soundfont from the web
	const demoUrl = 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_grand_piano-ogg.js'
	const otherUrl = 'https://raw.githubusercontent.com/felixroos/felixroos.github.io/main/public/Earthbound_NEW.sf2'
}

const loadSoundfont = async () => {
	const url = document.getElementById('soundfontUrl').value.trim()
	if (!url) return showNotification('Please enter a soundfont URL', 'error')
	showLoadingState()

	try {
		console.log('🔄 Loading soundfont from:', url)
		store.gear = await store.gear.load({ piano: url })
		console.log('✅ Soundfont loaded successfully!')
		showSuccessState()
		store.isLoaded = true
	} catch (error) {
		console.error('❌ Failed to load soundfont:', error)
		showErrorState()
		showNotification('Failed to load soundfont. Please check the URL and try again.', 'error')
	}
}

const showLoadingState = () => {
	const status = document.getElementById('loadingStatus')
	const spinner = document.getElementById('spinner')
	const success = document.getElementById('success')
	const error = document.getElementById('error')
	status.classList.remove('hidden')
	spinner.classList.remove('hidden')
	success.classList.add('hidden')
	error.classList.add('hidden')
	document.getElementById('loadBtn').disabled = true
}

const showSuccessState = () => {
	const spinner = document.getElementById('spinner')
	const success = document.getElementById('success')
	spinner.classList.add('hidden')
	success.classList.remove('hidden')
	document.getElementById('loadBtn').disabled = false

	setTimeout(() => {
		document.getElementById('loadingStatus').classList.add('hidden')
	}, 3000)
}

const showErrorState = () => {
	const spinner = document.getElementById('spinner')
	const error = document.getElementById('error')
	spinner.classList.add('hidden')
	error.classList.remove('hidden')
	document.getElementById('loadBtn').disabled = false

	setTimeout(() => {
		document.getElementById('loadingStatus').classList.add('hidden')
	}, 5000)
}

const enableControls = () => {
	// Show the piano interface and control cards
	document.getElementById('pianoSection').classList.remove('hidden')
	document.getElementById('parametersCard').classList.remove('hidden')
	document.getElementById('chordCard').classList.remove('hidden')

	// Enable transport buttons
	updateTransportButtons()
}

const updateTransportButtons = () => {
	const demoBtn = document.getElementById('demoSequenceBtn')
	const progressionBtn = document.getElementById('chordProgressionBtn')
	const stopBtn = document.getElementById('stopAllBtn')

	if (demoBtn) demoBtn.disabled = !store.isLoaded
	if (progressionBtn) progressionBtn.disabled = !store.isLoaded
	if (stopBtn) stopBtn.disabled = !store.isLoaded
}

const playChordProgression = async () => {
	if (!store.gear) return

	try {
		showNotification('Playing chord progression...', 'info')

		const chords = ['C', 'Am', 'F', 'G']
		const voicing = document.getElementById('voicingSelect')?.value || 'open'
		const octave = parseInt(document.getElementById('octaveSelect')?.value || '4')

		for (let i = 0; i < chords.length; i++) {
			setTimeout(() => {
				store.gear.piano.chord(chords[i]).velocity(65).duration(800).voicing(voicing).octave(octave).play()
			}, i * 1000)
		}
	} catch (error) {
		console.error('Error playing chord progression:', error)
		showNotification('Error playing chord progression', 'error')
	}
}

const showNotification = (message, type = 'info') => {
	// Create notification element
	const notification = document.createElement('div')
	notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-full`

	// Style based on type
	const typeStyles = {
		info: 'bg-blue-500 text-white',
		success: 'bg-green-500 text-white',
		error: 'bg-red-500 text-white',
		warning: 'bg-yellow-500 text-black'
	}

	notification.className += ` ${typeStyles[type] || typeStyles.info}`
	notification.textContent = message

	// Add to DOM
	document.body.appendChild(notification)

	// Slide in
	setTimeout(() => {
		notification.classList.remove('translate-x-full')
	}, 10)

	// Auto remove after 4 seconds
	setTimeout(() => {
		notification.classList.add('translate-x-full')
		setTimeout(() => {
			if (notification.parentNode) {
				notification.parentNode.removeChild(notification)
			}
		}, 300)
	}, 4000)
}

// Export for global access if needed
window.wembleyDemo = {
	demoState: store,
	playNote,
	stopAllNotes
}
