const Games = {
  currentGame: null,
  catchScore: 0,
  catchTime: 30,
  catchInterval: null,
  memoryCards: [],
  memoryFlipped: [],
  memoryMatched: 0,
  reactionTime: 0,
  reactionStart: 0,
  reactionWaiting: false,

  init() {
    this.bindEvents();
  },

  bindEvents() {
    document.querySelectorAll('.game-card').forEach(card => {
      card.addEventListener('click', () => {
        const game = card.dataset.game;
        this.startGame(game);
      });
    });

    document.getElementById('startCatchBtn')?.addEventListener('click', () => {
      this.startCatchGame();
    });

    document.getElementById('catchArea')?.addEventListener('mousemove', (e) => {
      if (this.currentGame === 'catch') {
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const basket = document.getElementById('catchBasket');
        if (basket) {
          basket.style.left = Math.max(20, Math.min(rect.width - 60, x - 20)) + 'px';
        }
      }
    });
  },

  startGame(game) {
    this.currentGame = game;
    UI.navigateTo(game + 'Game');
    
    if (game === 'catch') {
      this.initCatchGame();
    } else if (game === 'memory') {
      this.initMemoryGame();
    } else if (game === 'reaction') {
      this.initReactionGame();
    }
  },

  initCatchGame() {
    this.catchScore = 0;
    this.catchTime = 30;
    document.getElementById('catchScore').textContent = '0';
    document.getElementById('catchTime').textContent = '30';
    document.getElementById('startCatchBtn').style.display = 'inline-block';
    
    const fallingItem = document.getElementById('fallingItem');
    if (fallingItem) fallingItem.style.display = 'none';
    
    const basket = document.getElementById('catchBasket');
    if (basket) basket.style.left = '50%';
  },

  startCatchGame() {
    document.getElementById('startCatchBtn').style.display = 'none';
    
    this.catchInterval = setInterval(() => {
      this.catchTime--;
      document.getElementById('catchTime').textContent = this.catchTime;
      
      if (this.catchTime <= 0) {
        this.endCatchGame();
      }
      
      this.spawnFallingItem();
    }, 1000);
  },

  spawnFallingItem() {
    const fallingItem = document.getElementById('fallingItem');
    if (!fallingItem) return;
    
    fallingItem.style.display = 'block';
    fallingItem.style.left = Math.random() * 260 + 'px';
    fallingItem.style.animation = 'none';
    
    void fallingItem.offsetWidth;
    fallingItem.style.animation = 'fall 1.5s linear';
    
    setTimeout(() => {
      if (fallingItem.style.display !== 'none') {
        this.checkCatch();
      }
    }, 1500);
  },

  checkCatch() {
    const fallingItem = document.getElementById('fallingItem');
    const basket = document.getElementById('catchBasket');
    if (!fallingItem || !basket) return;
    
    const itemRect = fallingItem.getBoundingClientRect();
    const basketRect = basket.getBoundingClientRect();
    
    if (itemRect.bottom >= basketRect.top && 
        itemRect.left >= basketRect.left - 10 && 
        itemRect.right <= basketRect.right + 10) {
      this.catchScore += 10;
      document.getElementById('catchScore').textContent = this.catchScore;
      fallingItem.style.display = 'none';
    }
  },

  endCatchGame() {
    clearInterval(this.catchInterval);
    
    const stats = Storage.getStats();
    const newStats = {
      gamesPlayed: stats.gamesPlayed + 1,
      highScore: Math.max(stats.highScore, this.catchScore)
    };
    Storage.updateStats(newStats);
    
    const coinsEarned = Math.floor(this.catchScore / 10);
    Storage.addCoins(coinsEarned);
    
    Storage.updateMission('earn_coins', coinsEarned);
    Storage.updateMission('win_game', 1);
    
    const missionComplete = Storage.completeMission('win_game');
    if (missionComplete) UI.showNotification(`MISSION COMPLETE! +${missionComplete} COINS`, 'success');
    
    const achievements = Storage.checkAchievements(null, newStats);
    achievements.forEach(a => UI.showNotification(a, 'success'));
    
    UI.showNotification(`GAME OVER! +${coinsEarned} COINS`);
    
    setTimeout(() => {
      this.initCatchGame();
    }, 2000);
  },

  initMemoryGame() {
    const symbols = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍒'];
    this.memoryCards = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
    this.memoryFlipped = [];
    this.memoryMatched = 0;
    
    const area = document.getElementById('memoryArea');
    if (!area) return;
    
    area.innerHTML = '<div class="memory-grid"></div>';
    const grid = area.querySelector('.memory-grid');
    
    this.memoryCards.forEach((symbol, i) => {
      const card = document.createElement('div');
      card.className = 'memory-card';
      card.dataset.index = i;
      card.dataset.symbol = symbol;
      card.innerHTML = '<span class="card-back">?</span><span class="card-front" style="display:none">' + symbol + '</span>';
      card.addEventListener('click', () => this.flipCard(card));
      grid.appendChild(card);
    });
  },

  flipCard(card) {
    if (this.memoryFlipped.length >= 2 || card.classList.contains('flipped')) return;
    
    card.classList.add('flipped');
    card.querySelector('.card-back').style.display = 'none';
    card.querySelector('.card-front').style.display = 'flex';
    
    this.memoryFlipped.push(card);
    
    if (this.memoryFlipped.length === 2) {
      setTimeout(() => this.checkMatch(), 1000);
    }
  },

  checkMatch() {
    const [card1, card2] = this.memoryFlipped;
    
    if (card1.dataset.symbol === card2.dataset.symbol) {
      card1.classList.add('matched');
      card2.classList.add('matched');
      this.memoryMatched++;
      
      if (this.memoryMatched === this.memoryCards.length / 2) {
        const points = 100;
        const stats = Storage.getStats();
        Storage.updateStats({
          gamesPlayed: stats.gamesPlayed + 1,
          highScore: Math.max(stats.highScore, points)
        });
        Storage.addCoins(20);
        
        Storage.updateMission('earn_coins', 20);
        Storage.updateMission('win_game', 1);
        
        const missionComplete = Storage.completeMission('win_game');
        if (missionComplete) UI.showNotification(`MISSION COMPLETE! +${missionComplete} COINS`, 'success');
        
        const achievements = Storage.checkAchievements(null, Storage.getStats());
        achievements.forEach(a => UI.showNotification(a, 'success'));
        
        UI.showNotification('YOU WIN! +20 COINS');
      }
    } else {
      card1.classList.remove('flipped');
      card2.classList.remove('flipped');
      card1.querySelector('.card-back').style.display = 'flex';
      card1.querySelector('.card-front').style.display = 'none';
      card2.querySelector('.card-back').style.display = 'flex';
      card2.querySelector('.card-front').style.display = 'none';
    }
    
    this.memoryFlipped = [];
  },

  initReactionGame() {
    this.reactionWaiting = false;
    const area = document.getElementById('reactionArea');
    if (!area) return;
    
    area.innerHTML = '<div class="reaction-target"></div><div class="reaction-instruction">WAIT FOR GREEN...</div>';
    
    const target = area.querySelector('.reaction-target');
    target.style.background = 'red';
    target.style.animation = 'none';
    
    setTimeout(() => {
      if (this.currentGame === 'reaction') {
        target.style.background = '#00ff88';
        this.reactionStart = Date.now();
        this.reactionWaiting = true;
      }
    }, 2000 + Math.random() * 3000);
    
    target.addEventListener('click', () => {
      if (!this.reactionWaiting) {
        UI.showNotification('TOO EARLY!');
        return;
      }
      
      this.reactionTime = Date.now() - this.reactionStart;
      this.reactionWaiting = false;
      
      const points = Math.max(0, 100 - this.reactionTime / 10);
      const stats = Storage.getStats();
      Storage.updateStats({
        gamesPlayed: stats.gamesPlayed + 1,
        highScore: Math.max(stats.highScore, Math.floor(points))
      });
      
      const coins = Math.max(1, Math.floor(points / 10));
      Storage.addCoins(coins);
      
      Storage.updateMission('earn_coins', coins);
      Storage.updateMission('win_game', 1);
      
      const missionComplete = Storage.completeMission('win_game');
      if (missionComplete) UI.showNotification(`MISSION COMPLETE! +${missionComplete} COINS`, 'success');
      
      const achievements = Storage.checkAchievements(null, Storage.getStats());
      achievements.forEach(a => UI.showNotification(a, 'success'));
      
      UI.showNotification(`${this.reactionTime}ms! +${coins} COINS`);
      
      setTimeout(() => this.initReactionGame(), 2000);
    });
  },

  quitGame() {
    if (this.catchInterval) {
      clearInterval(this.catchInterval);
    }
    this.currentGame = null;
    UI.navigateTo('gamesScreen');
  }
};
