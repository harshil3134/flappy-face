# 🐦 Flappy Face

A revolutionary twist on the classic Flappy Bird game that combines traditional keyboard controls with cutting-edge **face detection technology**. Control your bird using facial expressions detected through your webcam!

> 💻 **Best experienced on desktop/laptop computers** with a built-in or external webcam for optimal face detection performance.

## 🌟 Features

### Dual Control Modes
- **🎮 Traditional Mode**: Classic spacebar controls for jumping
- **😊 Face Control Mode**: Jump using facial expressions detected via your webcam

### Facial Expression Controls
- **😄 Smile Detection**: Flash a smile to make your bird soar
- **😮 Jaw Open**: Open your mouth to jump
- **😉 Eye Blinks**: Blink to control your bird
- **😗 Mouth Pucker**: Pucker your lips for precise control


### Advanced Features
- **🎯 Customizable Expression Controls**: Toggle individual facial expressions on/off
- **📱 Responsive Design**: Beautiful gradient UI with smooth animations
- **❓ Interactive Help System**: Comprehensive guide for both control modes
- **🔧 Collapsible Settings**: Minimizable expression control panel
- **🎨 Modern UI**: Animated gradient title and sleek interface
- **🧠 Smart Detection**: Advanced debouncing prevents accidental multiple jumps

## 🚀 Getting Started

### System Requirements
- **💻 Desktop or Laptop Computer** (recommended for best experience)
- **📹 Webcam** (built-in or external) for face control mode
- **🌐 Modern Web Browser** (Chrome, Firefox, Safari, Edge)
- **💡 Good Lighting** for optimal face detection accuracy

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/harshil3134/flappy-face.git
   cd flappy-face
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` (or the URL shown in your terminal)

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment.

## 🎮 How to Play

### Traditional Mode (Default)
1. Click "Start Game" to begin
2. Press **Spacebar** to make the bird jump
3. Navigate through the pipes without hitting them
4. Try to achieve the highest score possible!

### Face Control Mode
1. Click "Enable Face Control" to activate webcam
2. Allow camera permissions when prompted
3. Position your face in view of the webcam
4. Use the configured facial expressions to make the bird jump:
   - **Smile** 😄
   - **Open Jaw** 😮  
   - **Blink Eyes** 😉
   - **Pucker Mouth** 😗


### Customizing Expression Controls
- Click the **gear icon** (⚙️) to open expression settings
- Toggle individual expressions on/off using checkboxes
- Use **"All"** or **"None"** buttons for quick selection
- Minimize the panel using the **minimize button** (➖)

## 🛠️ Technical Architecture

### Core Technologies
- **React 18** - Modern UI framework with hooks
- **Vite** - Lightning-fast build tool and dev server
- **Google MediaPipe Vision** - Advanced face detection AI
- **HTML5 Canvas** - Smooth game rendering
- **CSS3 Animations** - Beautiful visual effects

### Key Components

#### Face Detection System (`facecontrol.js`)
- Utilizes Google MediaPipe Vision Tasks for real-time face analysis
- Implements advanced facial landmark detection with 468+ points
- Features smart debouncing (700ms) to prevent rapid-fire jumping
- Configurable expression thresholds for optimal gameplay

#### Game Engine (`Game.jsx`)
- React-based game loop with requestAnimationFrame
- Physics simulation for bird movement and gravity
- Collision detection system for pipes and boundaries
- Dynamic scoring and game state management

#### Camera Integration (`Cam.jsx`)
- WebRTC getUserMedia API for webcam access
- Automatic camera cleanup and memory management
- Error handling for camera permissions and device issues
- Seamless integration with face detection pipeline

### Expression Detection Algorithm

The face detection system uses MediaPipe's Face Blendshapes to detect expressions:

```javascript
// MediaPipe provides pre-calculated expression scores
const mouthPucker = result[38];    // Mouth pucker blendshape
const eyeBlinkLeft = result[8];    // Left eye blink
const eyeBlinkRight = result[9];   // Right eye blink
const jawOpen = result[25];        // Jaw opening
const smileLeft = result[44];      // Left smile
const smileRight = result[45];     // Right smile

// Check if expression exceeds threshold
if (smileLeft.score > 0.5 || smileRight.score > 0.5) {
  triggerJump();
}
```

## 🎨 UI/UX Features

### Visual Design
- **Gradient Animations**: Dynamic color transitions throughout the interface
- **3D Transform Effects**: Subtle depth and hover animations
- **Responsive Layout**: Optimized for desktop and mobile devices
- **Accessibility**: High contrast ratios and keyboard navigation support

### User Experience
- **Intuitive Controls**: Clear visual feedback for all interactions
- **Help System**: Comprehensive modal with control explanations
- **Settings Persistence**: Expression preferences saved locally
- **Smooth Transitions**: Fluid animations between game states

## 🔧 Configuration

### Expression Sensitivity
Expression detection uses MediaPipe's Face Blendshapes with these thresholds in `facecontrol.js`:

```javascript
// All expressions use a 0.5 score threshold
if (mouthPucker.score > 0.5) shouldJump = true;
if (eyeBlinkLeft.score > 0.5 || eyeBlinkRight.score > 0.5) shouldJump = true;
if (jawOpen.score > 0.5) shouldJump = true;
if (smileLeft.score > 0.5 || smileRight.score > 0.5) shouldJump = true;

// Debounce time to prevent rapid jumps
const DEBOUNCE_TIME = 700; // milliseconds
```

### Game Physics
Game parameters in `Game.jsx`:

```javascript
const gravity = 0.2;           // Downward acceleration
const jumpStrength = -6;       // Upward velocity on jump
const pipeWidth = 60;          // Width of obstacle pipes
const pipeGap = 180;           // Vertical gap between pipes
const baseSpeed = 2.5;         // Base horizontal pipe speed
const desiredPipeGap = 300;    // Horizontal distance between pipes

// Dynamic speed increase
const pipeSpeed = baseSpeed + Math.floor(score / 5) * 0.3;
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Getting Started
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Ideas
- 🎵 **Audio System**: Add sound effects and background music
- 🏆 **Leaderboards**: Implement high score tracking and persistence
- 🎨 **Themes**: Create different visual themes and bird characters
- 🌐 **Multiplayer**: Add real-time multiplayer capabilities
- 📱 **Mobile App**: Convert to React Native for mobile platforms
- 🧠 **AI Difficulty**: Dynamic difficulty adjustment based on performance

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google MediaPipe** - For providing excellent face detection capabilities
- **Flappy Bird** - Original game concept by Dong Nguyen
- **React Community** - For the amazing ecosystem and tools
- **Vite Team** - For the incredible build tool experience

**🎮 Ready to play? Start the game and try controlling it with your face!**  
*Works best on desktop/laptop computers with webcam* 😄
