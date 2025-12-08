# 🌌 Solar System 3D Visualization

[中文文档](./README_CN.md) | **English**

A stunning, interactive 3D simulation of the Solar System built with modern Web technologies. This project visualizes planetary orbits, celestial bodies, and cosmic environments with immersive audio and visual effects.

## ✨ Features

- **Interactive 3D Environment**: Explore the solar system with free-moving camera controls.
- **Realistic Physics**: Accurate orbital mechanics and planetary physics simulation.
- **Rich Details**:
  - ☀️ **Sun & Planets**: Detailed textures and lighting effects.
  - 🌑 **Moons**: Planetary satellites with their own orbits.
  - ☄️ **Comets & Asteroid Belts**: Dynamic particle systems.
  - ✨ **Constellations & Far Galaxy**: Immersive background environments.
- **Audio Experience**: Integrated background music and sound effects for a complete atmospheric experience.

## 🛠️ Tech Stack

- **Core**: JavaScript (ES6+), HTML5, CSS3
- **Rendering**: WebGL / Three.js
- **Build Tool**: Node.js / Vercel

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/solar-system-3d.git
   cd solar-system-3d
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm start
   ```
   *This will start a local server at `http://localhost:3000`*

## 📂 Project Structure

```
├── src/
│   ├── sun.js, moon.js, comet.js   # Celestial bodies
│   ├── belts.js, constellation.js  # Environment details
│   ├── orbit.js, physics.js        # Physics engine
│   ├── camera.js                   # Camera controls
│   ├── audio.js                    # Audio system
│   ├── config.js                   # Configuration
│   └── utils.js                    # Utilities
├── textures/                       # Image assets
├── script.js                       # Main entry point
└── index.html                      # Entry HTML
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
