import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

class SoundManager {
  constructor() {
    this.audioListener = new THREE.AudioListener();
  }

  async loadSounds() {
    const [backgroundSong, greenLightSong,backgroundLevel2Song,backgroundLevel3Song] = await Promise.all([
      this.loadSound('../sounds/background.mp3'),
      this.loadSound('../sounds/greenLight.mp3'),
      this.loadSound('../sounds/backgroundLevel2.mp3'),
      this.loadSound('../sounds/level3.mp3')
    ]);

    this.backgroundSong = backgroundSong;
    this.backgroundSong.setVolume(1.3);
    this.backgroundSong.setLoop(true);
    this.greenLightSong = greenLightSong;
    this.greenLightSong.setLoop(false);
    this.greenLightSong.setVolume(0.9);
    this.backgroundLevel2Song = backgroundLevel2Song;
    this.backgroundLevel2Song.setVolume(1);
    this.backgroundLevel2Song.setLoop(true);
    this.backgroundLevel3Song = backgroundLevel3Song;
    this.backgroundLevel3Song.setVolume(1);
    this.backgroundLevel3Song.setLoop(true);
    return Promise.resolve();
  }

  loadSound(url) {
    return new Promise((resolve) => {
      const sound = new THREE.Audio(this.audioListener);
      const loader = new THREE.AudioLoader();
      loader.load(url, (audioBuffer) => {
        sound.setBuffer(audioBuffer);
        resolve(sound);
      });
    });
  }
}

const soundManager = new SoundManager();
export { soundManager };
