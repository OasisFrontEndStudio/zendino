# Zendino - Zen Dino 🌸

> Jump over cacti and make them bloom - a healing game without pressure

## About

Zendino is a minimalist dinosaur game focused on mindfulness and relaxation. Unlike traditional games, there's no score, no Game Over, no pressure - just creating beautiful moments.

### Core Philosophy

- **Instant Healing**: No progress saving, every game is a fresh journey
- **Zero Pressure**: No failure penalties, no stress
- **Beautiful Moments**: Every action creates instant visual rewards
- **Peaceful Experience**: Just the joy of creating beauty

## How It Works

### Game Logic (One Line)

```javascript
if (dino jumps over cactus) {
  cactus.bloom();
  screen.sprinklePetals();
  play.windChimeSound();
}
```

### Three Interaction Effects

| Action | Effect | Duration |
|--------|--------|----------|
| Jump over cactus | Blooms + 5 petals | 2 seconds |
| Pass through bird | 3 floating feathers | 3 seconds |
| 3 consecutive successes | Small rainbow arc | 1.5 seconds |

### Visual Feedback Layers

1. **Layer 1**: Obstacle transformation (cactus blooms)
2. **Layer 2**: Particle effects (petals/feathers)
3. **Layer 3**: Background gradient (becomes greener with blooms)
4. **Layer 4**: Screen edge glow (beauty level)

## Controls

- **Space**: Jump / Restart
- **Down Arrow**: Duck
- **ESC**: Pause

## Game Flow

```
Start → Create Beauty → Reach 100% Beauty → Celebration → End
```

Or simply play for any duration and close - no pressure at all.

### Beauty System

```javascript
let beauty = 0; // Independent per game, not saved

function addBeauty(amount) {
  beauty += amount;
  if (beauty > 100) beauty = 100;
  
  updateProgressBar(beauty);
  updateBackgroundColor(beauty);
  if (beauty === 100) triggerCelebration();
}
```

## Installation

### As Chrome Extension

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `zendino` folder

### As Web Game

Simply open `index.html` in any modern browser.

## File Structure

```
zendino/
├── manifest.json          # Chrome extension config
├── background.js          # Service worker
├── index.html            # Single page game
├── style.css             # All styles
├── game.js               # Game logic (<500 lines)
├── assets/
│   ├── dino.png          # Dino sprite
│   ├── cactus.png        # Cactus
│   └── bird.png          # Bird
└── icon.png              # Extension icon
```

## Features

### ✨ What's Included

- Instant visual feedback
- Particle effects (petals, feathers)
- Dynamic background colors
- Soft, healing sound effects
- Responsive design
- Offline capable

### ❌ What's Not Included (By Design)

- ❌ Progress saving/loading
- ❌ Achievement system
- ❌ Leaderboards
- ❌ Character unlocks
- ❌ Item shops
- ❌ Complex levels
- ❌ Difficulty scaling
- ❌ Time limits

## Target Use Cases

- **Stress relief**: Play for 3 minutes to relax your mind
- **Waiting moments**: Fill fragmented time
- **Before focus**: Use as a ritual to enter flow state
- **Before sleep**: Calm your thoughts

## Design Philosophy

Zendino isn't about escaping reality - it's about practicing finding beauty within reality.

Each jumping bloom trains your brain to:

- Find beautiful possibilities in difficulties
- See obstacles as growth opportunities
- Enjoy the process, not just the result
- Discover change within repetition

This is a 3-minute meditation for busy modern people.

It's not about making you unable to stop playing - it's about helping you stop after playing.

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Any modern browser

## License

MIT License - Feel free to use and modify for personal projects.

## Credits

Created by **zbbsdsb (ceaserzhao)** with love for mindfulness and digital wellbeing.

## Author

- **GitHub**: [ceaserzhao](https://github.com/OasisFrontEndStudio)
- **Username**: zbbsdsb
