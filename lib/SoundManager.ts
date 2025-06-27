import { Howl, Howler } from 'howler';

class SoundManager {
  private sounds: Record<string, Howl> = {};
  private masterVolume: number = 0.5;

  constructor() {
    Howler.volume(this.masterVolume);
  }

  addSound(name: string, src: string | string[], loop: boolean = false) {
    this.sounds[name] = new Howl({
      src,
      loop,
    });
  }

  playSound(name: string) {
    const sound = this.sounds[name];
    if (sound) {
      sound.play();
    } else {
      console.error(`Sound "${name}" not found.`);
    }
  }

  stopSound(name: string) {
    const sound = this.sounds[name];
    if (sound) {
      sound.stop();
    } else {
      console.error(`Sound "${name}" not found.`);
    }
  }

  setVolume(name: string, volume: number) {
    const sound = this.sounds[name];
    if (sound) {
      sound.volume(volume);
    } else {
      console.error(`Sound "${name}" not found.`);
    }
  }

  setMasterVolume(volume: number) {
    this.masterVolume = volume;
    Howler.volume(volume);
  }

  muteAll(mute: boolean) {
    Howler.mute(mute);
  }
}

export const soundManager = new SoundManager();
