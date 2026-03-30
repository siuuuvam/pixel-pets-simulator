const Sound = {
  ctx: null,
  bgmPlaying: false,
  bgmOscillator: null,
  bgmGain: null,

  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.log('Web Audio not supported');
    }
  },

  playTone(freq, duration, type = 'square', volume = 0.1) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume;
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  },

  playClick() {
    this.playTone(800, 0.05, 'square', 0.05);
  },

  playSuccess() {
    this.playTone(523, 0.1, 'sine', 0.1);
    setTimeout(() => this.playTone(659, 0.1, 'sine', 0.1), 100);
    setTimeout(() => this.playTone(784, 0.15, 'sine', 0.1), 200);
  },

  playError() {
    this.playTone(200, 0.2, 'sawtooth', 0.1);
  },

  playAction() {
    this.playTone(440, 0.08, 'square', 0.08);
    setTimeout(() => this.playTone(554, 0.08, 'square', 0.08), 80);
  },

  playCoin() {
    this.playTone(988, 0.1, 'square', 0.08);
    setTimeout(() => this.playTone(1319, 0.2, 'square', 0.08), 100);
  },

  startBGM() {
    if (!this.ctx || this.bgmPlaying) return;
    this.bgmPlaying = true;
    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.value = 0.02;
    this.bgmGain.connect(this.ctx.destination);
    
    const notes = [261, 293, 329, 349, 392, 329, 293, 261];
    let noteIndex = 0;
    
    const playNote = () => {
      if (!this.bgmPlaying) return;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = notes[noteIndex];
      const noteGain = this.ctx.createGain();
      noteGain.gain.value = 0.05;
      noteGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
      osc.connect(noteGain);
      noteGain.connect(this.bgmGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.5);
      noteIndex = (noteIndex + 1) % notes.length;
      setTimeout(playNote, 500);
    };
    playNote();
  },

  stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmGain) {
      this.bgmGain.disconnect();
      this.bgmGain = null;
    }
  }
};

const App = {
  pets: [],
  currentPet: null,
  currentPetInstance: null,
  selectedPetIndex: 0,

  init() {
    console.log('App.init() starting...');
    try {
      Sound.init();
      UI.init();
      console.log('UI.init() done');
      Games.init();
      console.log('Games.init() done');
      this.loadPets();
      console.log('loadPets() done, pets:', this.pets.length);
      this.render();
      console.log('render() done');
      this.bindEvents();
      console.log('bindEvents() done');
      console.log('App fully initialized!');
    } catch (e) {
      console.error('Error during init:', e);
    }
  },

  loadPets() {
    const petData = Storage.getPets();
    this.pets = petData.map(data => Pet.fromData(data));
  },

  render() {
    console.log('App.render(), pets:', this.pets.length);
    if (this.pets.length === 0) {
      UI.navigateTo('mainMenu');
    } else {
      this.selectPetByIndex(0);
      UI.navigateTo('gameScreen');
    }
  },

  bindEvents() {
    console.log('App.bindEvents() starting...');
    
    const confirmBtn = document.getElementById('confirmCreateBtn');
    if (confirmBtn) {
      console.log('Found confirmCreateBtn, adding listener');
      confirmBtn.addEventListener('click', () => {
        console.log('Confirm button clicked!');
        this.createPet();
      });
    } else {
      console.log('confirmCreateBtn not found!');
    }
    
    const addPetBtn = document.getElementById('addPetBtn');
    if (addPetBtn) {
      console.log('Found addPetBtn, adding listener');
      addPetBtn.addEventListener('click', () => {
        console.log('Add pet button clicked!');
        if (this.pets.length >= 5) {
          UI.showNotification('MAX 5 PETS!', 'error');
          return;
        }
        UI.navigateTo('createPetScreen');
      });
    }

    window.addEventListener('beforeunload', () => {
      this.pets.forEach(pet => pet.save());
    });
    
    console.log('App.bindEvents() complete');
  },

  createPet() {
    console.log('createPet() called');
    const name = UI.elements.petNameInput?.value?.trim() || document.getElementById('petNameInput')?.value?.trim();
    console.log('Name:', name);
    if (!name) {
      UI.showNotification('ENTER A NAME!', 'error');
      return;
    }

    const type = document.querySelector('.type-option.selected')?.dataset.type || 'blob';
    const color = UI.elements.petColorInput?.value || document.getElementById('petColorInput')?.value || '#7C9EB2';

    const newPet = new Pet(name, type, color);
    const result = Storage.addPet(newPet.toJSON());

    if (!result.success) {
      UI.showNotification(result.message, 'error');
      return;
    }

    this.pets.push(newPet);
    newPet.startDecay();
    
    UI.navigateTo('gameScreen');
    this.selectPetByIndex(this.pets.length - 1);
    UI.showNotification(`WELCOME ${name}!`);
  },

  selectPetByIndex(index) {
    if (index < 0 || index >= this.pets.length) return;
    
    this.selectedPetIndex = index;
    this.currentPet = this.pets[index];
    this.currentPetInstance = Pet.fromData(this.currentPet);
    
    UI.selectedPetIndex = index;
    UI.updatePetDisplay(this.currentPetInstance);
    
    if (!this.currentPetInstance.decayInterval) {
      this.currentPetInstance.startDecay();
    }

    this.startUIUpdate();
  },

  handleAction(action) {
    if (!this.currentPetInstance) return;

    let result;
    switch(action) {
      case 'feed':
        result = this.currentPetInstance.feed();
        if (result && result.success) {
          Storage.updateMission('feed_pet', 1);
        }
        break;
      case 'play':
        result = this.currentPetInstance.play();
        if (result && result.success) {
          Storage.updateMission('play_time', 1);
        }
        break;
      case 'sleep':
        result = this.currentPetInstance.sleep();
        break;
      case 'heal':
        result = this.currentPetInstance.heal();
        break;
    }

    if (result) {
      UI.showNotification(result.message, result.success ? 'success' : 'error');
      this.updateUI();
    }
  },

  startUIUpdate() {
    if (this.uiUpdateInterval) {
      clearInterval(this.uiUpdateInterval);
    }
    this.uiUpdateInterval = setInterval(() => this.updateUI(), 1000);
  },

  updateUI() {
    if (!this.currentPetInstance) return;

    const petData = Storage.getPet(this.currentPetInstance.id);
    if (!petData) return;

    const oldStage = this.currentPetInstance.stage;
    this.currentPet = petData;
    this.currentPetInstance = Pet.fromData(petData);
    UI.updatePetDisplay(this.currentPetInstance);
    
    if (oldStage !== petData.stage) {
      const achievements = Storage.checkAchievements(petData, Storage.getStats());
      achievements.forEach(a => UI.showNotification(a, 'success'));
    }
  },

  updateCurrentPetDisplay() {
    if (!this.currentPetInstance) {
      this.selectPetByIndex(0);
    } else {
      const petData = Storage.getPet(this.currentPetInstance.id);
      if (petData) {
        this.currentPetInstance = Pet.fromData(petData);
        UI.updatePetDisplay(this.currentPetInstance);
      }
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.App = App;
  App.init();
});
