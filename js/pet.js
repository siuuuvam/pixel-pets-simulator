const PetState = {
  HAPPY: 'happy',
  NEUTRAL: 'neutral',
  SAD: 'sad',
  HUNGRY: 'hungry',
  SLEEPING: 'sleeping',
  DEAD: 'dead'
};

const PetStage = {
  BABY: 'baby',
  ADULT: 'adult',
  ELDER: 'elder'
};

const PetType = {
  BLOB: 'blob',
  CAT: 'cat',
  DOG: 'dog',
  BUNNY: 'bunny'
};

const DECAY_INTERVAL = 30000;
const HUNGER_DECAY = 5;
const HAPPINESS_DECAY = 3;
const ENERGY_DECAY = 2;

const FEED_HUNGER_BOOST = 30;
const FEED_ENERGY_BOOST = 5;
const PLAY_HAPPINESS_BOOST = 25;
const PLAY_ENERGY_COST = 15;
const SLEEP_ENERGY_BOOST = 40;
const SLEEP_DURATION = 5000;

const ITEMS = {
  cookie: { name: 'Cookie', hunger: 20, happiness: 10, energy: 0, rarity: 1 },
  apple: { name: 'Apple', hunger: 25, happiness: 5, energy: 0, rarity: 1 },
  cake: { name: 'Cake', hunger: 35, happiness: 20, energy: 5, rarity: 2 },
  candy: { name: 'Candy', hunger: 15, happiness: 30, energy: 0, rarity: 2 },
  potion: { name: 'Potion', hunger: 0, happiness: 0, energy: 50, rarity: 3 },
  diamond: { name: 'Diamond', hunger: 50, happiness: 50, energy: 50, rarity: 3 }
};

class Pet {
  constructor(name, type, color) {
    this.id = Storage.generateId();
    this.name = name;
    this.type = type;
    this.color = color;
    this.attributes = {
      hunger: 100,
      happiness: 100,
      energy: 100
    };
    this.health = 100;
    this.state = PetState.NEUTRAL;
    this.stage = PetStage.BABY;
    this.age = 0;
    this.createdAt = Date.now();
    this.lastUpdated = Date.now();
    this.isSleeping = false;
    this.decayInterval = null;
    this.skills = {
      affection: 0,
      intelligence: 0,
      energy: 0
    };
  }

  static fromData(data) {
    const pet = new Pet(data.name, data.type, data.color);
    Object.assign(pet, data);
    pet.calculateOfflineDecay();
    return pet;
  }

  calculateOfflineDecay() {
    const now = Date.now();
    const elapsed = now - this.lastUpdated;
    const minutesPassed = Math.floor(elapsed / 60000);
    
    if (minutesPassed > 0 && !this.isSleeping && this.state !== PetState.DEAD) {
      const decayMultiplier = this.stage === PetStage.ELDER ? 1.5 : 1;
      this.attributes.hunger = Math.max(0, this.attributes.hunger - (HUNGER_DECAY * Math.floor(minutesPassed / 0.5) * decayMultiplier));
      this.attributes.happiness = Math.max(0, this.attributes.happiness - (HAPPINESS_DECAY * Math.floor(minutesPassed / 0.5) * decayMultiplier));
      this.attributes.energy = Math.max(0, this.attributes.energy - (ENERGY_DECAY * Math.floor(minutesPassed / 0.5) * decayMultiplier));
      this.health = Math.max(0, this.health - (Math.floor(minutesPassed / 5) * decayMultiplier));
      this.age += Math.floor(minutesPassed / 60);
      this.updateState();
      this.updateStage();
    }
    this.lastUpdated = now;
  }

  startDecay() {
    if (this.decayInterval) return;
    this.decayInterval = setInterval(() => {
      this.tick();
    }, DECAY_INTERVAL);
  }

  stopDecay() {
    if (this.decayInterval) {
      clearInterval(this.decayInterval);
      this.decayInterval = null;
    }
  }

  tick() {
    if (this.isSleeping || this.state === PetState.DEAD) return;

    const decayMultiplier = this.stage === PetStage.ELDER ? 1.5 : 1;
    this.attributes.hunger = Math.max(0, this.attributes.hunger - (HUNGER_DECAY * decayMultiplier));
    this.attributes.happiness = Math.max(0, this.attributes.happiness - (HAPPINESS_DECAY * decayMultiplier));
    this.attributes.energy = Math.max(0, this.attributes.energy - (ENERGY_DECAY * decayMultiplier));
    
    if (this.attributes.hunger < 20 || this.attributes.happiness < 20) {
      this.health = Math.max(0, this.health - 2);
    }
    
    this.age += 1 / 120;
    this.updateState();
    this.updateStage();
    this.save();
    this.checkDeath();
  }

  updateState() {
    if (this.state === PetState.DEAD) return;
    if (this.isSleeping) {
      this.state = PetState.SLEEPING;
      return;
    }
    if (this.health < 20) {
      this.state = PetState.SAD;
    } else if (this.attributes.hunger < 20) {
      this.state = PetState.HUNGRY;
    } else if (this.attributes.happiness < 30) {
      this.state = PetState.SAD;
    } else if (this.attributes.happiness >= 70 && this.attributes.hunger >= 50 && this.health >= 50) {
      this.state = PetState.HAPPY;
    } else {
      this.state = PetState.NEUTRAL;
    }
  }

  updateStage() {
    if (this.age >= 72) {
      this.stage = PetStage.ELDER;
    } else if (this.age >= 24) {
      this.stage = PetStage.ADULT;
    } else {
      this.stage = PetStage.BABY;
    }
  }

  feed(item = null) {
    if (this.isSleeping || this.state === PetState.DEAD) {
      return { success: false, message: 'CANT DO THAT!' };
    }

    if (item && ITEMS[item]) {
      const itm = ITEMS[item];
      this.attributes.hunger = Math.min(100, this.attributes.hunger + itm.hunger);
      this.attributes.happiness = Math.min(100, this.attributes.happiness + itm.happiness);
      this.attributes.energy = Math.min(100, this.attributes.energy + itm.energy);
      this.health = Math.min(100, this.health + 10);
      this.skills.affection = Math.min(100, this.skills.affection + 2);
      this.updateState();
      this.save();
      return { success: true, message: `ATE ${itm.name}!` };
    }

    this.attributes.hunger = Math.min(100, this.attributes.hunger + FEED_HUNGER_BOOST);
    this.attributes.energy = Math.min(100, this.attributes.energy + FEED_ENERGY_BOOST);
    this.health = Math.min(100, this.health + 5);
    this.skills.affection = Math.min(100, this.skills.affection + 1);
    this.updateState();
    this.save();
    return { success: true, message: 'YUMMY!' };
  }

  play() {
    if (this.isSleeping || this.state === PetState.DEAD) {
      return { success: false, message: 'CANT DO THAT!' };
    }
    if (this.attributes.energy < 10) {
      return { success: false, message: 'TOO TIRED!' };
    }
    this.attributes.happiness = Math.min(100, this.attributes.happiness + PLAY_HAPPINESS_BOOST);
    this.attributes.energy = Math.max(0, this.attributes.energy - PLAY_ENERGY_COST);
    this.attributes.hunger = Math.max(0, this.attributes.hunger - 5);
    this.skills.intelligence = Math.min(100, this.skills.intelligence + 2);
    this.updateState();
    this.save();
    return { success: true, message: 'FUN!' };
  }

  sleep() {
    if (this.state === PetState.DEAD) {
      return { success: false, message: '...' };
    }
    if (this.isSleeping) {
      return { success: false, message: 'ALREADY SLEEPING!' };
    }
    if (this.attributes.energy >= 100) {
      return { success: false, message: 'NOT TIRED!' };
    }
    
    this.isSleeping = true;
    this.updateState();
    this.save();

    setTimeout(() => {
      if (this.state !== PetState.DEAD) {
        this.attributes.energy = Math.min(100, this.attributes.energy + SLEEP_ENERGY_BOOST);
        this.isSleeping = false;
        this.updateState();
        this.save();
      }
    }, SLEEP_DURATION);

    return { success: true, message: 'Zzz...' };
  }

  heal() {
    if (this.isSleeping || this.state === PetState.DEAD) {
      return { success: false, message: 'CANT DO THAT!' };
    }
    this.health = Math.min(100, this.health + 30);
    this.attributes.happiness = Math.min(100, this.attributes.happiness + 10);
    this.skills.affection = Math.min(100, this.skills.affection + 5);
    this.updateState();
    this.save();
    return { success: true, message: 'FEELING BETTER!' };
  }

  checkDeath() {
    if (this.health === 0) {
      this.state = PetState.DEAD;
      this.stopDecay();
      this.save();
      return true;
    }
    return false;
  }

  save() {
    this.lastUpdated = Date.now();
    Storage.updatePet(this.id, {
      attributes: this.attributes,
      health: this.health,
      state: this.state,
      stage: this.stage,
      age: this.age,
      lastUpdated: this.lastUpdated,
      isSleeping: this.isSleeping,
      skills: this.skills
    });
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      color: this.color,
      attributes: this.attributes,
      health: this.health,
      state: this.state,
      stage: this.stage,
      age: this.age,
      createdAt: this.createdAt,
      lastUpdated: this.lastUpdated,
      isSleeping: this.isSleeping,
      skills: this.skills
    };
  }
}
