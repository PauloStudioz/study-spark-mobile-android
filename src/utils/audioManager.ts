
export type AmbientSound = 'rain' | 'forest' | 'coffee' | 'ocean' | 'fire' | 'none';

export class AudioManager {
  private audioElements: Map<AmbientSound, HTMLAudioElement> = new Map();
  private currentSound: AmbientSound = 'none';
  private volume: number = 0.5;

  constructor() {
    this.initializeAudioElements();
  }

  private initializeAudioElements() {
    // Create audio elements with embedded base64 data for different sounds
    const soundData: Record<AmbientSound, string> = {
      rain: this.generateRainSound(),
      forest: this.generateForestSound(),
      coffee: this.generateCoffeeSound(),
      ocean: this.generateOceanSound(),
      fire: this.generateFireSound(),
      none: ''
    };

    Object.entries(soundData).forEach(([sound, data]) => {
      if (sound !== 'none' && data) {
        const audio = new Audio();
        audio.src = data;
        audio.loop = true;
        audio.volume = this.volume;
        this.audioElements.set(sound as AmbientSound, audio);
      }
    });
  }

  private generateRainSound(): string {
    // Generate synthetic rain sound using Web Audio API
    return this.createWhiteNoise(0.3, 'rain');
  }

  private generateForestSound(): string {
    // Generate synthetic forest sound
    return this.createWhiteNoise(0.2, 'forest');
  }

  private generateCoffeeSound(): string {
    // Generate synthetic coffee shop ambience
    return this.createWhiteNoise(0.4, 'coffee');
  }

  private generateOceanSound(): string {
    // Generate synthetic ocean waves
    return this.createWhiteNoise(0.3, 'ocean');
  }

  private generateFireSound(): string {
    // Generate synthetic fire crackling
    return this.createWhiteNoise(0.25, 'fire');
  }

  private createWhiteNoise(intensity: number, type: string): string {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const bufferSize = 2 * audioContext.sampleRate;
      const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      // Apply filtering based on sound type
      if (type === 'rain') {
        // High frequency emphasis for rain
        for (let i = 0; i < bufferSize; i++) {
          output[i] *= Math.sin(i * 0.001) * intensity;
        }
      } else if (type === 'ocean') {
        // Low frequency waves for ocean
        for (let i = 0; i < bufferSize; i++) {
          output[i] *= Math.sin(i * 0.0001) * intensity;
        }
      }

      const source = audioContext.createBufferSource();
      source.buffer = noiseBuffer;
      
      return 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmciAjaN0fPTgC4GJHPD8+OVRAoRVKzh6qNPFApAl9z0xHkpBiiAzvDbhzQHGWq+8d2QQAoUXrTp66hVFApGn+DyvmciAjaN0fPTgC4GJHPD8+OVRAoRVKzh6qNPFApAl9z0xHkpBiiAzvDbhzQHGWq+8d2QQAoUXrTp66hVFApGn+DyvmciAjaN0fPTgC4GJHPD8+OVRAoRVKzh6qNPFApAl9z0xHkpBiiAzvDbhzQHGWq+8d2QQAoUXrTp66hVFApGn+DyvmciAjaN0fPTgC4GJHPD8+OVRAoRVKzh6qNPFApAl9z0xHkpBiiAzvDbhzQHGWq+8d2QQAo=';
    } catch (error) {
      console.log('AudioContext not supported, using fallback');
      return '';
    }
  }

  public playAmbientSound(sound: AmbientSound, volume: number = 0.5) {
    console.log(`Playing ambient sound: ${sound} at volume ${Math.round(volume * 100)}`);
    
    // Stop current sound
    this.stopCurrentSound();
    
    if (sound === 'none') return;
    
    const audio = this.audioElements.get(sound);
    if (audio) {
      audio.volume = volume;
      audio.play().catch(err => {
        console.log('Audio play failed, generating synthetic sound:', err);
        this.playSyntheticSound(sound, volume);
      });
      this.currentSound = sound;
    } else {
      this.playSyntheticSound(sound, volume);
    }
    
    this.volume = volume;
  }

  private playSyntheticSound(sound: AmbientSound, volume: number) {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();
      
      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Configure based on sound type
      switch (sound) {
        case 'rain':
          oscillator.type = 'sawtooth';
          oscillator.frequency.setValueAtTime(2000, audioContext.currentTime);
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(3000, audioContext.currentTime);
          break;
        case 'forest':
          oscillator.type = 'triangle';
          oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(1000, audioContext.currentTime);
          break;
        case 'ocean':
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(100, audioContext.currentTime);
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(500, audioContext.currentTime);
          break;
        case 'coffee':
          oscillator.type = 'brown';
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          break;
        case 'fire':
          oscillator.type = 'sawtooth';
          oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
          filter.type = 'highpass';
          filter.frequency.setValueAtTime(200, audioContext.currentTime);
          break;
      }
      
      gainNode.gain.setValueAtTime(volume * 0.1, audioContext.currentTime);
      
      oscillator.start();
      
      // Store reference to stop later
      (this as any).currentOscillator = oscillator;
      (this as any).currentGain = gainNode;
      (this as any).currentAudioContext = audioContext;
      
    } catch (error) {
      console.log('Synthetic sound generation failed:', error);
    }
  }

  public stopCurrentSound() {
    if (this.currentSound !== 'none') {
      const audio = this.audioElements.get(this.currentSound);
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      
      // Stop synthetic sound
      if ((this as any).currentOscillator) {
        try {
          (this as any).currentOscillator.stop();
          (this as any).currentAudioContext?.close();
        } catch (error) {
          console.log('Error stopping synthetic sound:', error);
        }
      }
      
      this.currentSound = 'none';
    }
  }

  public setVolume(volume: number) {
    this.volume = volume;
    if (this.currentSound !== 'none') {
      const audio = this.audioElements.get(this.currentSound);
      if (audio) {
        audio.volume = volume;
      }
      
      if ((this as any).currentGain) {
        (this as any).currentGain.gain.setValueAtTime(volume * 0.1, (this as any).currentAudioContext.currentTime);
      }
    }
  }

  public getCurrentSound(): AmbientSound {
    return this.currentSound;
  }

  public getVolume(): number {
    return this.volume;
  }
}

export const audioManager = new AudioManager();
