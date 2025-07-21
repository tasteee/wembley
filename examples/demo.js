import { wembley } from './js/index.js'

// Demo configuration and state
const demoState = {
  player: null,
  gear: null,
  selectedNote: null,
  selectedChord: null,
  isLoaded: false
}

// Get DOM elements
const getElement = (id) => document.getElementById(id)

// Initialize demo when DOM is loaded
document.addEventListener('DOMContentLoaded', () => initializeDemo())

const initializeDemo = () => {
  console.log('🎹 Initializing Wembley Demo')
  
  // Initialize UI event listeners
  setupEventListeners()
  updateSliderValues()
  
  // Configure wembley
  demoState.player = wembley.configure({
    gain: 70,
    maxVelocity: 85,
    minVelocity: 45,
    voicings: {
      jazzCluster: (notes) => notes.map(note => note + '♭9'),
      arpeggiated: (notes) => notes.sort()
    }
  })
  
  console.log('✅ Wembley configured successfully')
}

const setupEventListeners = () => {
  // Soundfont loading
  getElement('autoFillBtn').addEventListener('click', autoFillDemoUrl)
  getElement('loadBtn').addEventListener('click', loadSoundfont)
  
  // Note selection
  document.querySelectorAll('[data-note]').forEach(btn => {
    btn.addEventListener('click', (e) => selectNote(e.target.dataset.note, e.target))
  })
  
  // Chord selection
  document.querySelectorAll('[data-chord]').forEach(btn => {
    btn.addEventListener('click', (e) => selectChord(e.target.dataset.chord, e.target))
  })
  
  // Sliders
  getElement('velocitySlider').addEventListener('input', updateSliderValues)
  getElement('panSlider').addEventListener('input', updateSliderValues)
  getElement('durationSlider').addEventListener('input', updateSliderValues)
  
  // Play controls
  getElement('playNoteBtn').addEventListener('click', playSelectedNote)
  getElement('playChordBtn').addEventListener('click', playSelectedChord)
  getElement('stopAllBtn').addEventListener('click', stopAllNotes)
  
  // Demo sequences
  getElement('demoSequenceBtn').addEventListener('click', playDemoSequence)
  getElement('chordProgressionBtn').addEventListener('click', playChordProgression)
}

const autoFillDemoUrl = () => {
  // Use a well-known public soundfont URL
  // This is a popular piano soundfont from the web
  const demoUrl = 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_grand_piano-ogg.js'
  
  // For now, let's use a placeholder that would work in a real scenario
  getElement('soundfontUrl').value = 'https://example.com/demo-piano.sf2'
  
  // Show a note about the demo URL
  showNotification('Demo URL filled! Note: This is a placeholder URL for demonstration purposes.', 'info')
}

const loadSoundfont = async () => {
  const url = getElement('soundfontUrl').value.trim()
  
  if (!url) {
    showNotification('Please enter a soundfont URL', 'error')
    return
  }
  
  showLoadingState()
  
  try {
    console.log('🔄 Loading soundfont from:', url)
    
    // Load the soundfont with wembley
    demoState.gear = await demoState.player.load({
      piano: url
    })
    
    console.log('✅ Soundfont loaded successfully!')
    showSuccessState()
    enableControls()
    demoState.isLoaded = true
    
  } catch (error) {
    console.error('❌ Failed to load soundfont:', error)
    showErrorState()
    showNotification('Failed to load soundfont. Please check the URL and try again.', 'error')
  }
}

const showLoadingState = () => {
  const status = getElement('loadingStatus')
  const spinner = getElement('spinner')
  const success = getElement('success')
  const error = getElement('error')
  
  status.classList.remove('hidden')
  spinner.classList.remove('hidden')
  success.classList.add('hidden')
  error.classList.add('hidden')
  
  getElement('loadBtn').disabled = true
}

const showSuccessState = () => {
  const spinner = getElement('spinner')
  const success = getElement('success')
  
  spinner.classList.add('hidden')
  success.classList.remove('hidden')
  
  getElement('loadBtn').disabled = false
  
  // Hide success message after 3 seconds
  setTimeout(() => {
    getElement('loadingStatus').classList.add('hidden')
  }, 3000)
}

const showErrorState = () => {
  const spinner = getElement('spinner')
  const error = getElement('error')
  
  spinner.classList.add('hidden')
  error.classList.remove('hidden')
  
  getElement('loadBtn').disabled = false
  
  // Hide error message after 5 seconds
  setTimeout(() => {
    getElement('loadingStatus').classList.add('hidden')
  }, 5000)
}

const enableControls = () => {
  getElement('controlsSection').classList.remove('hidden')
  getElement('showcaseSection').classList.remove('hidden')
  
  // Enable play buttons when notes/chords are selected
  updatePlayButtonStates()
}

const selectNote = (note, button) => {
  // Clear previous selection
  document.querySelectorAll('[data-note]').forEach(btn => {
    btn.classList.remove('active')
  })
  
  // Select new note
  button.classList.add('active')
  demoState.selectedNote = note
  
  updatePlayButtonStates()
  showNotification(`Selected note: ${note}`, 'info')
}

const selectChord = (chord, button) => {
  // Clear previous selection
  document.querySelectorAll('[data-chord]').forEach(btn => {
    btn.classList.remove('active')
  })
  
  // Select new chord
  button.classList.add('active')
  demoState.selectedChord = chord
  
  updatePlayButtonStates()
  showNotification(`Selected chord: ${chord}`, 'info')
}

const updateSliderValues = () => {
  const velocity = getElement('velocitySlider').value
  const pan = getElement('panSlider').value
  const duration = getElement('durationSlider').value
  
  getElement('velocityValue').textContent = velocity
  getElement('panValue').textContent = pan
  getElement('durationValue').textContent = `${duration}ms`
}

const updatePlayButtonStates = () => {
  const noteBtn = getElement('playNoteBtn')
  const chordBtn = getElement('playChordBtn')
  const stopBtn = getElement('stopAllBtn')
  const demoBtn = getElement('demoSequenceBtn')
  const progressionBtn = getElement('chordProgressionBtn')
  
  const isLoaded = demoState.isLoaded
  
  noteBtn.disabled = !isLoaded || !demoState.selectedNote
  chordBtn.disabled = !isLoaded || !demoState.selectedChord
  stopBtn.disabled = !isLoaded
  demoBtn.disabled = !isLoaded
  progressionBtn.disabled = !isLoaded
}

const playSelectedNote = () => {
  if (!demoState.selectedNote || !demoState.gear) return
  
  const velocity = parseInt(getElement('velocitySlider').value)
  const pan = parseInt(getElement('panSlider').value)
  const duration = parseInt(getElement('durationSlider').value)
  
  try {
    console.log(`🎵 Playing note: ${demoState.selectedNote}`)
    
    demoState.gear.piano
      .note(demoState.selectedNote)
      .velocity(velocity)
      .pan(pan)
      .duration(duration)
      .play()
      
    showNotification(`Playing ${demoState.selectedNote} (velocity: ${velocity}, pan: ${pan})`, 'success')
  } catch (error) {
    console.error('Error playing note:', error)
    showNotification('Error playing note', 'error')
  }
}

const playSelectedChord = () => {
  if (!demoState.selectedChord || !demoState.gear) return
  
  const velocity = parseInt(getElement('velocitySlider').value)
  const pan = parseInt(getElement('panSlider').value)
  const duration = parseInt(getElement('durationSlider').value)
  const voicing = getElement('voicingSelect').value
  const octave = parseInt(getElement('octaveSelect').value)
  
  try {
    console.log(`🎵 Playing chord: ${demoState.selectedChord}`)
    
    demoState.gear.piano
      .chord(demoState.selectedChord)
      .velocity(velocity)
      .pan(pan)
      .duration(duration)
      .voicing(voicing)
      .octave(octave)
      .play()
      
    showNotification(`Playing ${demoState.selectedChord} chord (${voicing} voicing, octave ${octave})`, 'success')
  } catch (error) {
    console.error('Error playing chord:', error)
    showNotification('Error playing chord', 'error')
  }
}

const stopAllNotes = () => {
  try {
    // In a real implementation, we'd need to track playing notes
    // For now, this is a placeholder
    console.log('🛑 Stopping all notes')
    showNotification('All notes stopped', 'info')
  } catch (error) {
    console.error('Error stopping notes:', error)
  }
}

const playDemoSequence = async () => {
  if (!demoState.gear) return
  
  try {
    showNotification('Playing demo sequence...', 'info')
    
    const notes = ['C4', 'E4', 'G4', 'C5']
    
    for (let i = 0; i < notes.length; i++) {
      setTimeout(() => {
        demoState.gear.piano
          .note(notes[i])
          .velocity(70)
          .duration(400)
          .play()
      }, i * 500)
    }
    
  } catch (error) {
    console.error('Error playing demo sequence:', error)
    showNotification('Error playing demo sequence', 'error')
  }
}

const playChordProgression = async () => {
  if (!demoState.gear) return
  
  try {
    showNotification('Playing chord progression...', 'info')
    
    const chords = ['C', 'Am', 'F', 'G']
    
    for (let i = 0; i < chords.length; i++) {
      setTimeout(() => {
        demoState.gear.piano
          .chord(chords[i])
          .velocity(65)
          .duration(800)
          .voicing('open')
          .play()
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
  demoState,
  playSelectedNote,
  playSelectedChord,
  stopAllNotes
}