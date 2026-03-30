# Virtual Pet Simulator

A feature-rich virtual pet game inspired by Tamagotchi and Tamaweb. Raise your pets from baby to elder, keep them happy, fed, and energetic!

## Features

- **Multiple Pets**: Have up to 5 pets at once
- **4 Pet Types**: Blob, Cat, Dog, Bunny - all CSS-drawn
- **Lifecycle System**: Baby (0-24h) → Adult (24-72h) → Elder (72h+)
- **Real-time Decay**: Attributes decrease over time (even offline!)
- **Persistent**: Saves automatically to LocalStorage
- **Rich Interactions**: Feed, Play, Sleep actions
- **State-based Animations**: Pet reacts to hunger, happiness, energy levels
- **Custom Colors**: Choose your pet's color

## How to Play

1. Open `index.html` in a web browser
2. Click "New Pet" to create your first pet
3. Choose a name, type, and color
4. Keep your pet alive by:
   - **Feeding** - Reduces hunger, small energy boost
   - **Playing** - Increases happiness, costs energy
   - **Sleeping** - Restores energy (5 second delay)
5. Watch your pet grow from baby → adult → elder
6. If neglected (hunger & happiness reach 0), your pet will pass away

## Pet Attributes

| Attribute | Decay Rate | Feed | Play | Sleep |
|-----------|-----------|------|------|-------|
| Hunger | -5/30s | +30 | -5 | 0 |
| Happiness | -3/30s | 0 | +25 | 0 |
| Energy | -2/30s | +5 | -15 | +40 |

## Offline Progression

Your pets continue to decay even when you're away! When you return, their stats will be calculated based on the time passed.

## Lifecycle Stages

- **Baby**: Small, cute, needs lots of attention
- **Adult**: Full size, more resilient
- **Elder**: Slower animations, faster decay, eventually passes peacefully

## File Structure

```
pet-simulator/
├── index.html          # Main HTML
├── css/
│   ├── style.css       # UI styles
│   └── pets.css       # CSS-drawn pets
├── js/
│   ├── app.js         # Main app logic
│   ├── pet.js         # Pet class & game logic
│   ├── storage.js     # LocalStorage wrapper
│   └── ui.js          # DOM manipulation
└── README.md
```

## Technologies

- HTML5
- CSS3 (animations, transitions)
- Vanilla JavaScript
- LocalStorage for persistence

## License

Created as a web development project.
