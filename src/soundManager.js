import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

class SoundManager {
  constructor() {
    this.audioListener = new THREE.AudioListener();
  }

  async loadSounds() {
    const [backgroundSong,backgroundLevel2Song,backgroundLevel3Song] = await Promise.all([
      this.loadSound('../sounds/background.mp3'), //background music for level 1
      this.loadSound('../sounds/backgroundLevel2.mp3'),//background music for level 2
      this.loadSound('../sounds/level3.mp3')//background music for level 3
    ]);

    this.backgroundSong = backgroundSong;
    this.backgroundSong.setVolume(1.5);
    this.backgroundSong.setLoop(true);
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
