import TTS from 'react-native-tts';

export class TTSService {
  constructor() {
    this.tts = TTS;
  }

  speak(text, options) {
    return this.tts.speak(text, options);
  }

  stop() {
    return this.tts.stop();
  }

  voices() {
    return this.tts.voices();
  }

  addEventListener(event, handler) {
    return this.tts.addEventListener(event, handler);
  }

  getInitStatus() {
    return this.tts.getInitStatus();
  }

  destroy() {
    this.tts.removeEventListener('tts-start');
    this.tts.removeEventListener('tts-finish');
    this.tts.removeEventListener('tts-cancel');
  }
}
