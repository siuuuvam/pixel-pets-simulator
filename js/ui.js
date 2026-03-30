const UI = {
  elements: {},
  currentScreen: 'mainMenu',
  selectedPetIndex: 0,

  init() {
    console.log('UI.init() starting...');
    this.bindElements();
    console.log('bindElements() done');
    this.bindEvents();
    console.log('bindEvents() done');
    this.updateTime();
    setInterval(() => this.updateTime(), 1000);
    console.log('UI.init() complete');
  },

  bindElements() {
    this.elements = {
      mainMenu: document.getElementById('mainMenu'),
      gameScreen: document.getElementById('gameScreen'),
      inventoryScreen: document.getElementById('inventoryScreen'),
      gamesScreen: document.getElementById('gamesScreen'),
      statsScreen: document.getElementById('statsScreen'),
      petSelect: document.getElementById('petSelect'),
      createPetScreen: document.getElementById('createPetScreen'),
      catchGame: document.getElementById('catchGame'),
      notifications: document.getElementById('notifications'),
      petSelector: document.getElementById('petSelector'),
      petDisplay: document.getElementById('petDisplay'),
      activePet: document.getElementById('activePet'),
      hungerStat: document.getElementById('hungerStat'),
      happinessStat: document.getElementById('happinessStat'),
      energyStat: document.getElementById('energyStat'),
      hungerVal: document.getElementById('hungerVal'),
      happinessVal: document.getElementById('happinessVal'),
      energyVal: document.getElementById('energyVal'),
      displayPetName: document.getElementById('displayPetName'),
      displayPetStage: document.getElementById('displayPetStage'),
      displayPetAge: document.getElementById('displayPetAge'),
      inventoryGrid: document.getElementById('inventoryGrid'),
      inventoryInfo: document.getElementById('inventoryInfo'),
      petCards: document.getElementById('petCards'),
      petNameInput: document.getElementById('petNameInput'),
      petColorInput: document.getElementById('petColorInput'),
      typeSelect: document.getElementById('typeSelect'),
      createPreviewPet: document.getElementById('createPreviewPet'),
      confirmCreateBtn: document.getElementById('confirmCreateBtn'),
      addPetBtn: document.getElementById('addPetBtn'),
      totalPets: document.getElementById('totalPets'),
      gamesPlayed: document.getElementById('gamesPlayed'),
      highScore: document.getElementById('highScore')
    };
  },

  bindEvents() {
    document.querySelectorAll('.menu-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        Sound.playClick();
        const menu = btn.dataset.menu;
        const screenMap = {
          'play': 'petSelect',
          'inventory': 'inventoryScreen',
          'games': 'gamesScreen',
          'stats': 'statsScreen',
          'store': 'storeScreen',
          'missions': 'missionsScreen'
        };
        this.navigateTo(screenMap[menu] || menu);
      });
    });

    document.querySelectorAll('.back-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        Sound.playClick();
        const backTo = btn.dataset.back;
        this.navigateTo(backTo);
      });
    });

    document.querySelectorAll('.arcade-btn').forEach(btn => {
      btn.addEventListener('click', () => Sound.playClick());
    });

    document.querySelectorAll('.action-btn').forEach(btn => {
      btn.addEventListener('click', () => Sound.playAction());
    });

    document.querySelectorAll('.store-item').forEach(btn => {
      btn.addEventListener('click', () => Sound.playCoin());
    });

    document.querySelectorAll('.inv-slot.has-item').forEach(btn => {
      btn.addEventListener('click', () => Sound.playAction());
    });

    document.getElementById('viewAchievementsBtn')?.addEventListener('click', () => {
      this.navigateTo('achievementsScreen');
    });

    document.querySelectorAll('.action-btn.arcade-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (window.App) {
          window.App.handleAction(action);
        }
      });
    });

    document.querySelectorAll('.type-option').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.type-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.updateCreatePreview();
      });
    });

    this.elements.petColorInput.addEventListener('input', () => this.updateCreatePreview());

    document.getElementById('btnA').addEventListener('click', () => {
      const activeBtn = document.querySelector('.menu-btn:not(.active)');
      if (activeBtn) activeBtn.click();
    });

    document.getElementById('btnB').addEventListener('click', () => {
      this.navigateTo('mainMenu');
    });

    document.querySelectorAll('.dpad-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const dir = btn.dataset.dir;
        this.handleDpad(dir);
      });
    });
  },

  navigateTo(screen) {
    const screens = ['mainMenu', 'gameScreen', 'inventoryScreen', 'gamesScreen', 'statsScreen', 'storeScreen', 'petSelect', 'createPetScreen', 'catchGame', 'memoryGame', 'reactionGame', 'achievementsScreen', 'missionsScreen'];
    screens.forEach(s => {
      const el = document.getElementById(s) || this.elements[s];
      if (el) {
        el.style.display = (s === screen) ? 'flex' : 'none';
        if (s === screen) el.classList.add('active');
        else el.classList.remove('active');
      }
    });
    this.currentScreen = screen;
    
    if (screen === 'storeScreen') {
      this.updateStoreScreen();
    }
    if (screen === 'inventoryScreen') {
      this.updateInventoryScreen();
    }
    if (screen === 'statsScreen') {
      this.updateStatsScreen();
    }
    if (screen === 'petSelect') {
      this.updatePetSelect();
    }
    if (screen === 'gameScreen' && window.App) {
      window.App.updateCurrentPetDisplay();
    }
    if (screen === 'achievementsScreen') {
      this.updateAchievementsScreen();
    }
    if (screen === 'missionsScreen') {
      this.updateMissionsScreen();
    }
    if (screen === 'statsScreen') this.updateStatsScreen();
    if (screen === 'inventoryScreen') this.updateInventoryScreen();
    if (screen === 'petSelect') this.updatePetSelect();
  },

  updateTime() {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour12: false });
    const el = document.getElementById('timeDisplay');
    if (el) el.textContent = time;
  },

  updatePetDisplay(pet) {
    if (!pet) return;
    
    const petEl = this.elements.activePet;
    petEl.className = `pet ${pet.type} ${pet.stage} ${pet.state}`;
    petEl.style.setProperty('--pet-color', pet.color);
    petEl.innerHTML = this.getPetHTML(pet.type);

    this.elements.hungerStat.style.width = pet.attributes.hunger + '%';
    this.elements.happinessStat.style.width = pet.attributes.happiness + '%';
    this.elements.energyStat.style.width = pet.attributes.energy + '%';
    this.elements.hungerVal.textContent = pet.attributes.hunger;
    this.elements.happinessVal.textContent = pet.attributes.happiness;
    this.elements.energyVal.textContent = pet.attributes.energy;
    this.elements.displayPetName.textContent = pet.name;
    this.elements.displayPetStage.textContent = pet.stage.toUpperCase();
    this.elements.displayPetAge.textContent = this.formatAge(pet.age);

    if (pet.skills) {
      const affectionEl = document.getElementById('affectionSkill');
      const intelEl = document.getElementById('intelligenceSkill');
      if (affectionEl) affectionEl.style.width = (pet.skills.affection || 0) + '%';
      if (intelEl) intelEl.style.width = (pet.skills.intelligence || 0) + '%';
    }

    this.updateDayNightCycle();
    this.updatePetSelector();
  },

  updateDayNightCycle() {
    const hour = new Date().getHours();
    const isNight = hour < 6 || hour >= 20;
    const overlay = document.getElementById('nightOverlay');
    const viewport = document.querySelector('.pet-viewport');
    
    if (overlay) {
      overlay.classList.toggle('night', isNight);
    }
    if (viewport) {
      viewport.classList.toggle('night', isNight);
    }
    
    const stars = document.getElementById('stars');
    if (stars && stars.children.length === 0) {
      for (let i = 0; i < 20; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 2 + 's';
        stars.appendChild(star);
      }
    }
  },

  getPetHTML(type) {
    let ears = '';
    switch(type) {
      case 'cat':
        ears = '<div class="pet-ears"></div>';
        break;
      case 'dog':
        ears = '<div class="pet-ear left"></div><div class="pet-ear right"></div><div class="pet-tongue"></div>';
        break;
      case 'bunny':
        ears = '<div class="pet-ear left"></div><div class="pet-ear right"></div>';
        break;
    }
    return `
      <div class="pet-body">
        ${ears}
        <div class="pet-face">
          <div class="pet-eyes">
            <div class="eye left"></div>
            <div class="eye right"></div>
          </div>
          <div class="pet-mouth"></div>
        </div>
        <div class="pet-tail"></div>
        <div class="pet-paws"></div>
      </div>
    `;
  },

  formatAge(hours) {
    if (hours < 1) return Math.floor(hours * 60) + 'M';
    if (hours < 24) return Math.floor(hours) + 'H';
    return Math.floor(hours / 24) + 'D';
  },

  updatePetSelector() {
    const pets = Storage.getPets();
    let html = '';
    pets.forEach((pet, i) => {
      const active = i === this.selectedPetIndex ? 'active' : '';
      html += `<button class="pet-tab-btn ${active}" data-pet="${i}">${i + 1}</button>`;
    });
    if (pets.length < 5) {
      html += '<button class="pet-tab-btn" data-pet="new">+</button>';
    }
    this.elements.petSelector.innerHTML = html;

    this.elements.petSelector.querySelectorAll('.pet-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.pet === 'new') {
          this.navigateTo('createPetScreen');
        } else {
          this.selectedPetIndex = parseInt(btn.dataset.pet);
          if (window.App) window.App.selectPetByIndex(this.selectedPetIndex);
          this.updatePetSelector();
        }
      });
    });
  },

  updatePetSelect() {
    const pets = Storage.getPets();
    let html = '';
    pets.forEach((pet, i) => {
      html += `
        <div class="pet-card ${i === this.selectedPetIndex ? 'selected' : ''}" data-index="${i}">
          <div class="pet-card-avatar" style="background: ${pet.color}"></div>
          <div class="pet-card-info">
            <div class="pet-card-name">${pet.name}</div>
            <div class="pet-card-details">${pet.type.toUpperCase()} | ${pet.stage.toUpperCase()}</div>
          </div>
        </div>
      `;
    });
    this.elements.petCards.innerHTML = html || '<p style="text-align:center;color:var(--text-dim);padding:20px;">NO PETS!<br>CLICK + NEW PET</p>';

    this.elements.petCards.querySelectorAll('.pet-card').forEach(card => {
      card.addEventListener('click', () => {
        this.selectedPetIndex = parseInt(card.dataset.index);
        this.updatePetSelect();
        this.navigateTo('gameScreen');
        if (window.App) window.App.selectPetByIndex(this.selectedPetIndex);
      });
    });
  },

  updateInventoryScreen() {
    const inventory = Storage.getInventory();
    const slots = this.elements.inventoryGrid.querySelectorAll('.inv-slot');
    slots.forEach((slot, i) => {
      slot.onclick = null;
      if (inventory[i]) {
        slot.className = 'inv-slot has-item';
        slot.innerHTML = `<span style="font-size:20px">${this.getItemIcon(inventory[i])}</span>`;
        slot.title = inventory[i];
        slot.dataset.item = inventory[i];
        slot.dataset.index = i;
        slot.onclick = () => this.useItem(i, inventory[i]);
      } else {
        slot.className = 'inv-slot empty';
        slot.innerHTML = '<span class="slot-empty">EMPTY</span>';
        slot.dataset.item = '';
        slot.dataset.index = i;
      }
    });
    this.elements.inventoryInfo.innerHTML = `<p>${inventory.length}/9 ITEMS - CLICK TO USE</p>`;
  },

  useItem(index, item) {
    const removedItem = Storage.removeFromInventory(index);
    if (!removedItem) return;
    
    const app = window.App;
    if (app && app.currentPetInstance) {
      const result = app.currentPetInstance.feed(removedItem);
      if (result) {
        this.showNotification(result.message, result.success ? 'success' : 'error');
        if (result.success) {
          this.updateInventoryScreen();
        } else {
          Storage.addToInventory(removedItem);
        }
      }
    } else {
      Storage.addToInventory(removedItem);
      this.showNotification('NO PET SELECTED!', 'error');
    }
  },

  getItemIcon(item) {
    const icons = { cookie: '🍪', apple: '🍎', cake: '🎂', candy: '🍬', potion: '🧪', diamond: '💎' };
    return icons[item] || '?';
  },

  updateStoreScreen() {
    const coins = Storage.getCoins();
    document.getElementById('storeCoins').textContent = coins;
    
    document.querySelectorAll('.store-item').forEach(item => {
      item.addEventListener('click', () => {
        const itemName = item.dataset.item;
        const price = parseInt(item.dataset.price);
        
        if (coins >= price) {
          Storage.addToInventory(itemName);
          Storage.addCoins(-price);
          this.updateStoreScreen();
          this.showNotification(`BOUGHT ${itemName.toUpperCase()}!`, 'success');
        } else {
          this.showNotification('NOT ENOUGH COINS!', 'error');
        }
      });
    });
  },

  updateStatsScreen() {
    const stats = Storage.getStats();
    this.elements.totalPets.textContent = Storage.getPets().length;
    this.elements.gamesPlayed.textContent = stats.gamesPlayed;
    this.elements.highScore.textContent = stats.highScore;
    this.elements.achievementCount.textContent = Storage.getAchievements().length;
  },

  updateAchievementsScreen() {
    const achievements = [
      { id: 'grown_up', name: 'GROWN UP', desc: 'Pet becomes adult (24h)', icon: '🌱' },
      { id: 'elder', name: 'ELDER WISDOM', desc: 'Pet becomes elder (72h)', icon: '👴' },
      { id: 'game_master', name: 'GAME MASTER', desc: 'Play 10 mini-games', icon: '🎮' },
      { id: 'high_scorer', name: 'HIGH SCORER', desc: 'Score 100+ points', icon: '🏆' },
      { id: 'pet_lover', name: 'PET LOVER', desc: 'Have 3 pets', icon: '❤️' }
    ];
    const unlocked = Storage.getAchievements();
    
    let html = '';
    achievements.forEach(ach => {
      const isUnlocked = unlocked.includes(ach.id);
      html += `
        <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}">
          <span class="achievement-icon">${ach.icon}</span>
          <div class="achievement-info">
            <div class="achievement-name">${ach.name}</div>
            <div class="achievement-desc">${ach.desc}</div>
          </div>
        </div>
      `;
    });
    
    const list = document.getElementById('achievementsList');
    if (list) list.innerHTML = html;
  },

  updateMissionsScreen() {
    const missions = Storage.getMissions();
    let html = '';
    
    missions.forEach(mission => {
      const progress = Math.round((mission.progress / mission.target) * 100);
      const isComplete = mission.progress >= mission.target;
      html += `
        <div class="mission-card ${isComplete ? 'completed' : ''}" data-id="${mission.id}">
          <div class="mission-title">${mission.title}</div>
          <div class="mission-desc">${mission.desc} (${mission.progress}/${mission.target})</div>
          <div class="mission-progress">
            <div class="mission-progress-fill" style="width: ${progress}%"></div>
          </div>
          <div style="color: var(--accent-warning); font-size: 11px; margin-top: 3px;">REWARD: ${mission.reward} COINS</div>
        </div>
      `;
    });
    
    const list = document.getElementById('missionsList');
    if (list) list.innerHTML = html;
  },

  updateCreatePreview() {
    const type = document.querySelector('.type-option.selected')?.dataset.type || 'blob';
    const color = this.elements.petColorInput.value;
    const preview = this.elements.createPreviewPet;
    preview.className = `pet ${type}`;
    preview.style.setProperty('--pet-color', color);
    preview.innerHTML = this.getPetHTML(type);
  },

  handleDpad(dir) {
    const menuBtns = document.querySelectorAll('.menu-btn');
    let currentIndex = Array.from(menuBtns).findIndex(btn => btn.classList.contains('active'));
    
    if (currentIndex === -1) currentIndex = 0;
    
    if (dir === 'up') currentIndex = Math.max(0, currentIndex - 1);
    if (dir === 'down') currentIndex = Math.min(menuBtns.length - 1, currentIndex + 1);
    if (dir === 'left' || dir === 'right') currentIndex = (currentIndex + 1) % menuBtns.length;
    
    menuBtns.forEach((btn, i) => btn.classList.toggle('active', i === currentIndex));
    
    if (dir === 'left' || dir === 'right' || dir === 'down') {
      menuBtns[currentIndex].click();
    }
  },

  showNotification(message, type = 'info') {
    const notif = document.createElement('div');
    notif.className = `notification ${type}`;
    notif.textContent = message;
    this.elements.notifications.appendChild(notif);
    setTimeout(() => notif.remove(), 3000);
  }
};
