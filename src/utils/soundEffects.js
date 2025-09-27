// Sound Effects Module using Web Audio API
class SoundEffects {
  constructor() {
    this.audioContext = null;
    this.sounds = {
      tick: { frequency: 800, duration: 0.1, type: 'sine' },
      complete: { frequency: 523.25, duration: 0.2, type: 'sine' },
      warning: { frequency: 300, duration: 0.3, type: 'triangle' },
      click: { frequency: 1000, duration: 0.05, type: 'sine' },
      error: { frequency: 200, duration: 0.2, type: 'sawtooth' }
    };
  }

  // Initialize audio context on first user interaction
  initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    // Resume audio context if it's suspended (required by some browsers)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  // Play a sound by name
  play(soundName) {
    try {
      // Initialize audio context on first interaction
      this.initAudioContext();
      
      const sound = this.sounds[soundName];
      if (!sound) {
        console.warn(`Sound "${soundName}" not found`);
        return;
      }

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.type = sound.type;
      oscillator.frequency.value = sound.frequency;
      gainNode.gain.value = 0.1; // Keep volume low to avoid startling users
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + sound.duration);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }

  // Play tick sound
  playTick() {
    this.play('tick');
  }

  // Play complete sound
  playComplete() {
    this.play('complete');
  }

  // Play warning sound
  playWarning() {
    this.play('warning');
  }

  // Play click sound
  playClick() {
    this.play('click');
  }

  // Play error sound
  playError() {
    this.play('error');
  }

  // Enable/disable sounds
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  // Check if sounds are enabled
  isEnabled() {
    return this.enabled !== false;
  }
}

// Create a singleton instance
const soundEffects = new SoundEffects();

// Export the playSound function for backward compatibility
export const playSound = (soundName) => {
  if (soundEffects.isEnabled()) {
    soundEffects.play(soundName);
  }
};

// Export the sound effects instance for advanced usage
export default soundEffects;

// Initialize on first user interaction to satisfy autoplay policies
document.addEventListener('click', () => {
  soundEffects.initAudioContext();
}, { once: true });

document.addEventListener('touchstart', () => {
  soundEffects.initAudioContext();
}, { once: true });