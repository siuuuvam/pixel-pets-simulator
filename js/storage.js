const Storage = {
  STORAGE_KEY: 'pixelPets_v2',
  MAX_PETS: 5,

  getPets() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error loading pets:', e);
      return [];
    }
  },

  savePets(pets) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(pets));
      return true;
    } catch (e) {
      console.error('Error saving pets:', e);
      return false;
    }
  },

  addPet(pet) {
    const pets = this.getPets();
    if (pets.length >= this.MAX_PETS) {
      return { success: false, message: 'MAX 5 PETS!' };
    }
    pets.push(pet);
    this.savePets(pets);
    return { success: true };
  },

  updatePet(petId, updates) {
    const pets = this.getPets();
    const index = pets.findIndex(p => p.id === petId);
    if (index === -1) return false;
    pets[index] = { ...pets[index], ...updates };
    this.savePets(pets);
    return true;
  },

  deletePet(petId) {
    const pets = this.getPets();
    const filtered = pets.filter(p => p.id !== petId);
    this.savePets(filtered);
    return true;
  },

  getPet(petId) {
    const pets = this.getPets();
    return pets.find(p => p.id === petId) || null;
  },

  generateId() {
    return 'pet_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  },

  getStats() {
    try {
      const stats = localStorage.getItem('pixelPets_stats');
      return stats ? JSON.parse(stats) : { gamesPlayed: 0, highScore: 0 };
    } catch (e) {
      return { gamesPlayed: 0, highScore: 0 };
    }
  },

  updateStats(updates) {
    try {
      const stats = this.getStats();
      const newStats = { ...stats, ...updates };
      localStorage.setItem('pixelPets_stats', JSON.stringify(newStats));
      return newStats;
    } catch (e) {
      return { gamesPlayed: 0, highScore: 0 };
    }
  },

  getInventory() {
    try {
      const inv = localStorage.getItem('pixelPets_inventory');
      return inv ? JSON.parse(inv) : [];
    } catch (e) {
      return [];
    }
  },

  addToInventory(item) {
    const inv = this.getInventory();
    if (inv.length >= 9) return false;
    inv.push(item);
    try {
      localStorage.setItem('pixelPets_inventory', JSON.stringify(inv));
      return true;
    } catch (e) {
      return false;
    }
  },

  removeFromInventory(index) {
    const inv = this.getInventory();
    if (index < 0 || index >= inv.length) return null;
    const item = inv.splice(index, 1)[0];
    try {
      localStorage.setItem('pixelPets_inventory', JSON.stringify(inv));
      return item;
    } catch (e) {
      return null;
    }
  },

  getCoins() {
    try {
      return parseInt(localStorage.getItem('pixelPets_coins')) || 100;
    } catch (e) {
      return 100;
    }
  },

  addCoins(amount) {
    try {
      const current = this.getCoins();
      localStorage.setItem('pixelPets_coins', (current + amount).toString());
    } catch (e) {}
  },

  getAchievements() {
    try {
      const ach = localStorage.getItem('pixelPets_achievements');
      return ach ? JSON.parse(ach) : [];
    } catch (e) {
      return [];
    }
  },

  addAchievement(achievement) {
    const ach = this.getAchievements();
    if (!ach.includes(achievement)) {
      ach.push(achievement);
      try {
        localStorage.setItem('pixelPets_achievements', JSON.stringify(ach));
        return true;
      } catch (e) {}
    }
    return false;
  },

  checkAchievements(pet, stats) {
    const achievements = [];
    const current = this.getAchievements();
    
    if (pet && pet.age >= 24 && !current.includes('grown_up')) {
      this.addAchievement('grown_up');
      achievements.push('GROWN UP! Your pet became an adult!');
    }
    
    if (pet && pet.age >= 72 && !current.includes('elder')) {
      this.addAchievement('elder');
      achievements.push('ELDER PET! Your pet reached old age!');
    }
    
    if (stats && stats.gamesPlayed >= 10 && !current.includes('game_master')) {
      this.addAchievement('game_master');
      achievements.push('GAME MASTER! Played 10 mini-games!');
    }
    
    if (stats && stats.highScore >= 100 && !current.includes('high_scorer')) {
      this.addAchievement('high_scorer');
      achievements.push('HIGH SCORER! Got 100+ points!');
    }
    
    if (this.getPets().length >= 3 && !current.includes('pet_lover')) {
      this.addAchievement('pet_lover');
      achievements.push('PET LOVER! Have 3 pets!');
    }
    
    return achievements;
  },

  getMissions() {
    try {
      const data = localStorage.getItem('pixelPets_missions');
      const missions = data ? JSON.parse(data) : null;
      const today = new Date().toDateString();
      
      if (missions && missions.date === today) {
        return missions.list;
      }
      
      const newMissions = [
        { id: 'feed_pet', title: 'FEED PET', desc: 'Feed your pet 3 times', target: 3, progress: 0, reward: 20 },
        { id: 'play_time', title: 'PLAY TIME', desc: 'Play with your pet 3 times', target: 3, progress: 0, reward: 25 },
        { id: 'earn_coins', title: 'EARN COINS', desc: 'Earn 50 coins from games', target: 50, progress: 0, reward: 30 },
        { id: 'win_game', title: 'VICTORY', desc: 'Win any mini-game', target: 1, progress: 0, reward: 40 }
      ];
      
      localStorage.setItem('pixelPets_missions', JSON.stringify({ date: today, list: newMissions }));
      return newMissions;
    } catch (e) {
      return [];
    }
  },

  updateMission(missionId, amount) {
    const data = localStorage.getItem('pixelPets_missions');
    if (!data) return false;
    
    const missions = JSON.parse(data);
    const mission = missions.list.find(m => m.id === missionId);
    if (mission && mission.progress < mission.target) {
      mission.progress = Math.min(mission.target, mission.progress + amount);
      localStorage.setItem('pixelPets_missions', JSON.stringify(missions));
      return mission.progress >= mission.target;
    }
    return false;
  },

  completeMission(missionId) {
    const data = localStorage.getItem('pixelPets_missions');
    if (!data) return null;
    
    const missions = JSON.parse(data);
    const mission = missions.list.find(m => m.id === missionId);
    if (mission && mission.progress >= mission.target) {
      const reward = mission.reward;
      mission.progress = 0;
      this.addCoins(reward);
      localStorage.setItem('pixelPets_missions', JSON.stringify(missions));
      return reward;
    }
    return null;
  }
};
