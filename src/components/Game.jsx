import { useEffect, useRef, useState } from "react";
import "./game.css";
import { createFaceLandmarker, initializeWebcam, isFaceModelLoaded, startFaceDetection, stopFaceDetection } from "../facecontrol";


function Game() {
  const canvasRef = useRef(null);
  const [birdPos, setBirdPos] = useState({ x: 100, y: 250 });
  const [gameState, setGameState] = useState("start"); // "start", "running", "gameover"
  const [score, setScore] = useState(0);
    const [controlMode, setControlMode] = useState(null); // 'keyboard' or 'webcam'
  const [showHelp, setShowHelp] = useState(false);
  const [showExpressionControls, setShowExpressionControls] = useState(false);
  const [expressionSettings, setExpressionSettings] = useState({
    smile: true,
    jawOpen: true,
    eyeBlink: true,
    mouthPucker: true
  });
  const velocityYRef = useRef(0);

  // ✅ Camera cleanup function
  const cleanupCamera = () => {
    // Stop face detection
    stopFaceDetection();
    
    // Stop camera stream
    const video = document.getElementById("webcam");
    if (video && video.srcObject) {
      const stream = video.srcObject;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => {
        track.stop();
        console.log('Camera track stopped');
      });
      
      video.srcObject = null;
      console.log('Camera stream cleaned up');
    }
  };

  // ✅ Cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanupCamera();
    };
  }, []);

  // ✅ Cleanup when game state changes from running to gameover
  useEffect(() => {
    if (gameState === "gameover" && controlMode === "webcam") {
      cleanupCamera();
    }
  }, [gameState, controlMode]);

  // Setup face control only if webcam mode is selected

const handlefacecontrol=async()=>{
    try{
         
        
    if(!isFaceModelLoaded())
    {
        let modelloader=await createFaceLandmarker()
        if(modelloader==true)
        {
           
          
          return true;
        }
    }
    else{
        return true;
    }
}
    catch(err)
    {
         
        return false;
    }     
    
}


  useEffect(() => {
    if (gameState !== "running") return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = 900;
    canvas.height = 600;

    let birdY = 250;
    velocityYRef.current = 0;
    let x = 100;
    const gravity = 0.2;
    let jumpStrength = -6;

    let distanceSinceLastPipe = 0;
const desiredPipeGap = 300; 

    const pipes = [];
    const pipeWidth = 60;
    const pipeGap = 180;
    let collisiondetection = false;
    let frameCount = 0;
    let scoreValue = 0;

    function handleKeyDown(e) {
      if ((e.code === "Space" || e.key === " ") && gameState === "running" && controlMode=='keyboard') {
        velocityYRef.current = jumpStrength;
      }
    }

    function checkCollision(birdPos, pipe) {

      let obj1r=birdPos.x + 35;
      let obj1l=birdPos.x;
      let obj1t=birdPos.y;
      let obj1b=birdPos.y+15;

      let obj2l=pipe.x;
      let obj2r=pipe.x+pipeWidth;
      let obj2b_top=pipe.topHeight;

      let obj2t_bottom=canvas.height-pipe.bottomHeight;
      
      if((obj1r>=obj2l)&&(obj1l<=obj2r))
      {
        if((pipe.type=='top'&& (obj1t<=obj2b_top)))
        {
        collisiondetection=true;
        }
        else if((pipe.type=='bottom') && (obj1b>=obj2t_bottom))
        {
          collisiondetection=true;
        }
        else if((pipe.type=='both')&&((obj1t<=obj2b_top)||(obj1b>=obj2t_bottom)))
        {
          collisiondetection=true;
        }
      }

    }
    function drawPipeCap(x, y, width, isTop) {
      ctx.save();
      ctx.fillStyle = "#e0c080"; // light wood/yellow for cap
      ctx.beginPath();
      if (isTop) {
        ctx.ellipse(x + width / 2, y , width / 2, 8, 0, Math.PI, 2 * Math.PI);
      } else {
        ctx.ellipse(x + width / 2, y  , width / 2, 8, 0, 0, Math.PI);
      }
      ctx.fill();
      ctx.restore();
    }


    function generatepipe() {
      const pipe = {
        x: canvas.width,
        type: "",
        topHeight: 0,
        bottomY: 0,
        bottomHeight: 0,
      };

      const choice = ["top", "bottom", "combine"];

      const selected = choice[Math.floor(Math.random() * choice.length)];
      // let selected="combine"

      switch (selected) {
        case "top":
          pipe.type = "top";
          pipe.topHeight = Math.max(
            250,
            Math.floor(Math.random() * (canvas.height - 220))
          );
          break;
        case "bottom":
          pipe.type = "bottom";
          pipe.bottomHeight = Math.max(
            250,
            Math.floor(Math.random() * (canvas.height - 220))
          );
          break;
        case "combine":
          pipe.type = "both";
          pipe.topHeight = Math.max(
            250,
            Math.floor(Math.random() * (canvas.height - 220))
          );
          pipe.bottomHeight = canvas.height - pipe.topHeight - pipeGap;
          break;
      }
      pipes.push(pipe);
    }

    window.addEventListener("keydown", handleKeyDown);

    function draw() {
      if (collisiondetection === true) {
        setGameState("gameover");
        setScore(scoreValue);
        return;
      }
      frameCount++;
     const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGradient.addColorStop(0, "#223a70");   // deep blue top
      skyGradient.addColorStop(0.5, "#4f8edc"); // mid blue
      skyGradient.addColorStop(1, "#b3e0ff");   // light blue bottom
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Remove the yellow square, only update birdPos for the HTML bird
      setBirdPos({ x, y: birdY });        

      // apply gravity
      velocityYRef.current += gravity;
      birdY += velocityYRef.current;

      if (birdY > canvas.height - 30) {
        birdY = canvas.height - 30;
        velocityYRef.current = 0;
      }
      if (birdY < 0) {
        birdY = 0;
        velocityYRef.current = 0;
      }

      // Calculate pipe speed based on scoreValue
      const baseSpeed = 2.5;
      const pipeSpeed = baseSpeed + Math.floor(scoreValue / 5) * 0.3;

      pipes.forEach((pipe) => {
        pipe.x -= pipeSpeed;

  // Brick-like reddish gradient
  const brickGradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipeWidth, 0);
  brickGradient.addColorStop(0, "#7c2f1b");   // dark brick red
  brickGradient.addColorStop(0.3, "#b5522c"); // mid brick
  brickGradient.addColorStop(0.7, "#e07a5f"); // light brick
  brickGradient.addColorStop(1, "#7c2f1b");   // dark brick red

  ctx.fillStyle = brickGradient;

  // Helper for moss


  // Helper for brick lines
  function drawBrickLines(x, y, width, height, isTop) {
    ctx.save();
    ctx.strokeStyle = "#a0522d"; // slightly lighter brown for brick lines
    ctx.lineWidth = 2;
    const brickHeight = 18;
    let startY = isTop ? y : y + height - brickHeight;
    let endY = isTop ? y + height : y;
    let step = isTop ? brickHeight : -brickHeight;
    for (let currY = startY; isTop ? currY < endY : currY > endY; currY += step) {
      ctx.beginPath();
      ctx.moveTo(x, currY);
      ctx.lineTo(x + width, currY);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Draw pipes and caps with brick lines and moss
  if (pipe.type === "top") {
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
    drawBrickLines(pipe.x, 0, pipeWidth, pipe.topHeight, true);
    drawPipeCap(pipe.x, pipe.topHeight, pipeWidth, false);
  
  } else if (pipe.type === "bottom") {
    ctx.fillRect(
      pipe.x,
      canvas.height - pipe.bottomHeight,
      pipeWidth,
      pipe.bottomHeight
    );
    drawBrickLines(pipe.x, canvas.height - pipe.bottomHeight, pipeWidth, pipe.bottomHeight, false);
    drawPipeCap(pipe.x, canvas.height - pipe.bottomHeight, pipeWidth, true);
   
  } else if (pipe.type === "both") {
    // Top
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
    drawBrickLines(pipe.x, 0, pipeWidth, pipe.topHeight, true);
    drawPipeCap(pipe.x, pipe.topHeight, pipeWidth, false);
   
    // Bottom
    ctx.fillRect(
      pipe.x,
      canvas.height - pipe.bottomHeight,
      pipeWidth,
      pipe.bottomHeight
    );
    drawBrickLines(pipe.x, canvas.height - pipe.bottomHeight, pipeWidth, pipe.bottomHeight, false);
    drawPipeCap(pipe.x, canvas.height - pipe.bottomHeight, pipeWidth, true);
   
  }

  // Score logic: count only once per pipe
  if (!pipe.passed && pipe.x + pipeWidth < x) {
    pipe.passed = true;
    scoreValue++;
    setScore(scoreValue)
  }
  checkCollision({ x, y: birdY }, pipe);
});

   distanceSinceLastPipe += pipeSpeed;

if (distanceSinceLastPipe >= desiredPipeGap) {
  generatepipe();
  distanceSinceLastPipe = 0;
}
      requestAnimationFrame(draw);
    }

    draw();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameState]);

  // Start button handlers
  function handleStartKeyboard() {
    setControlMode("keyboard");
    setGameState("running");
    setBirdPos({ x: 100, y: 250 });
    setScore(0);
  }

async function handleStartWebcam() {
  const res = await handlefacecontrol()
   
  
  if(res == true) {
    // ✅ Clean up any existing camera first
    cleanupCamera();
    
    // ✅ FIRST: Initialize webcam and get camera permission
    let resweb = await initializeWebcam()
     
    
    if(resweb == true) {
      // ✅ SECOND: Start face detection AFTER webcam is ready
      setTimeout(() => {
        startFaceDetection(() => {
          // Add jump callback for bird control
          velocityYRef.current = -6;
            
        }, expressionSettings);
         
      }, 1000); // Wait for video stream to be ready
      
      setControlMode("webcam");
      setGameState("running");
      setBirdPos({ x: 100, y: 250 });
      setScore(0);
    } else {
      console.error('Failed to initialize webcam');
    }
  } else {
    console.error('Failed to load face detection model');
  }
}
  function handleRestart() {
    // ✅ Clean up camera before restarting
    if (controlMode === "webcam") {
      cleanupCamera();
    }
    
    setGameState("start");
    setBirdPos({ x: 100, y: 250 });
    setScore(0);
    setControlMode(null);
  }

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen"
      style={{ position: "relative" }}
    >
      {/* Score Display */}
      {gameState === "running" && (
        <div style={{
          position: "absolute",
          top: 48,
          left: 25,
          color: "#fff",
          fontSize: 36,
          fontWeight: 700,
          textShadow: "2px 2px 8px #000, 0 2px 8px #ffa751",
          zIndex: 20,
          fontFamily: 'Fredoka One, Comic Sans MS, Arial, sans-serif',
          letterSpacing: 1
        }}>
          Score: {score}
        </div>
      )}
      {/* Start Screen Overlay */}
      {gameState === "start" && (
        <div style={{
          position: "absolute", left: 0, top: 0, width: "100%", height: "100%", zIndex: 10,
          background: "rgba(0,0,0,0.6)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
        }}>
<h1
  style={{
    fontSize: 72,
    fontWeight: 900,
    marginBottom: 32,
    // ✅ Enhanced gradient with more colors
    background: "linear-gradient(45deg, #ff6b6b 0%, #feca57 25%, #48dbfb 50%, #ff9ff3 75%, #54a0ff 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundSize: "400% 400%",
    // ✅ Animated gradient
    animation: "gradientShift 3s ease-in-out infinite",
    // ✅ Enhanced shadow with multiple layers
    textShadow: `
      0 0 20px rgba(255, 107, 107, 0.5),
      0 0 40px rgba(254, 202, 87, 0.3),
      0 4px 8px rgba(0, 0, 0, 0.8),
      0 8px 16px rgba(0, 0, 0, 0.4)
    `,
    fontFamily: 'Fredoka One, Comic Sans MS, Arial, sans-serif',
    letterSpacing: 3,
    padding: "0 24px",
    // ✅ Add transform for 3D effect
    transform: "perspective(500px) rotateX(15deg)",
    transformStyle: "preserve-3d",
    // ✅ Hover effect
    transition: "all 0.3s ease",
    cursor: "default"
  }}
  // ✅ Add hover animations
  onMouseEnter={(e) => {
    e.target.style.transform = "perspective(500px) rotateX(0deg) scale(1.05)";
    e.target.style.filter = "brightness(1.2)";
  }}
  onMouseLeave={(e) => {
    e.target.style.transform = "perspective(500px) rotateX(15deg) scale(1)";
    e.target.style.filter = "brightness(1)";
  }}
>
  Flappy Face 🎮
</h1>
          <div style={{ display: "flex", gap: 32 }}>
            <button onClick={handleStartKeyboard} style={{ fontSize: 32, padding: "16px 32px", borderRadius: 12, background: "#4f8edc", color: "#fff", border: "none", cursor: "pointer", boxShadow: "2px 2px 8px #000" }}>Play with Keyboard</button>
            <button onClick={handleStartWebcam} style={{ fontSize: 32, padding: "16px 32px", borderRadius: 12, background: "#43a047", color: "#fff", border: "none", cursor: "pointer", boxShadow: "2px 2px 8px #000" }}>Play with Webcam</button>
          </div>
          
          {/* Expression Settings Toggle Button - Compact */}
          <div style={{ marginTop: 20 }}>
            <button 
              onClick={() => setShowExpressionControls(!showExpressionControls)}
              style={{
                fontSize: 14,
                padding: "8px 16px",
                borderRadius: 8,
                background: showExpressionControls ? "#ff9ff3" : "rgba(255,159,243,0.2)",
                color: "#fff",
                border: "1px solid rgba(255,159,243,0.4)",
                cursor: "pointer",
                fontWeight: 500,
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                gap: 6,
                position: "relative"
              }}
              onMouseEnter={(e) => {
                e.target.style.background = showExpressionControls ? "#e589d1" : "rgba(255,159,243,0.4)";
                e.target.style.transform = "scale(1.02)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = showExpressionControls ? "#ff9ff3" : "rgba(255,159,243,0.2)";
                e.target.style.transform = "scale(1)";
              }}
            >
              <span style={{ fontSize: 16 }}>🎭</span>
              <span>Webcam Settings</span>
              {!showExpressionControls && (
                <span style={{ 
                  fontSize: 11, 
                  background: "rgba(255,255,255,0.2)", 
                  padding: "2px 6px", 
                  borderRadius: 4,
                  marginLeft: 4
                }}>
                  {Object.values(expressionSettings).filter(Boolean).length}/4
                </span>
              )}
              <span style={{ 
                transform: showExpressionControls ? 'rotate(180deg)' : 'rotate(0deg)', 
                transition: 'transform 0.3s ease',
                fontSize: 12,
                marginLeft: 'auto'
              }}>
                ⌄
              </span>
            </button>
          </div>

          {/* Expression Settings for Webcam Mode - Ultra Compact */}
          {showExpressionControls && (
            <div style={{ 
              marginTop: 12, 
              padding: 12, 
              background: "rgba(255,255,255,0.08)", 
              borderRadius: 8, 
              border: "1px solid rgba(255,159,243,0.2)",
              backdropFilter: "blur(8px)",
              animation: "slideUp 0.3s ease-out",
              maxWidth: 360
            }}>
              <p style={{ 
                fontSize: 12, 
                color: "#ccc", 
                textAlign: "center", 
                marginBottom: 10,
                lineHeight: 1.2
              }}>
                Select facial expressions to trigger jumps
              </p>
              
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "1fr 1fr", 
                gap: 6, 
                marginBottom: 10
              }}>
                {/* Smile Checkbox - Compact */}
                <label style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  cursor: "pointer",
                  padding: "6px 8px",
                  background: expressionSettings.smile ? "rgba(72, 219, 251, 0.15)" : "rgba(255,255,255,0.05)",
                  borderRadius: 6,
                  border: `1px solid ${expressionSettings.smile ? "#48dbfb" : "rgba(255,255,255,0.1)"}`,
                  transition: "all 0.2s ease",
                  fontSize: 12
                }}>
                  <input 
                    type="checkbox" 
                    checked={expressionSettings.smile}
                    onChange={(e) => setExpressionSettings(prev => ({...prev, smile: e.target.checked}))}
                    style={{ 
                      marginRight: 6, 
                      transform: "scale(0.9)",
                      accentColor: "#48dbfb"
                    }}
                  />
                  <span style={{ fontSize: 14, marginRight: 4 }}>😊</span>
                  <span style={{ color: "#fff", fontWeight: 500 }}>Smile</span>
                </label>

                {/* Jaw Open Checkbox - Compact */}
                <label style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  cursor: "pointer",
                  padding: "6px 8px",
                  background: expressionSettings.jawOpen ? "rgba(254, 202, 87, 0.15)" : "rgba(255,255,255,0.05)",
                  borderRadius: 6,
                  border: `1px solid ${expressionSettings.jawOpen ? "#feca57" : "rgba(255,255,255,0.1)"}`,
                  transition: "all 0.2s ease",
                  fontSize: 12
                }}>
                  <input 
                    type="checkbox" 
                    checked={expressionSettings.jawOpen}
                    onChange={(e) => setExpressionSettings(prev => ({...prev, jawOpen: e.target.checked}))}
                    style={{ 
                      marginRight: 6, 
                      transform: "scale(0.9)",
                      accentColor: "#feca57"
                    }}
                  />
                  <span style={{ fontSize: 14, marginRight: 4 }}>😮</span>
                  <span style={{ color: "#fff", fontWeight: 500 }}>Open</span>
                </label>

                {/* Eye Blink Checkbox - Compact */}
                <label style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  cursor: "pointer",
                  padding: "6px 8px",
                  background: expressionSettings.eyeBlink ? "rgba(84, 160, 255, 0.15)" : "rgba(255,255,255,0.05)",
                  borderRadius: 6,
                  border: `1px solid ${expressionSettings.eyeBlink ? "#54a0ff" : "rgba(255,255,255,0.1)"}`,
                  transition: "all 0.2s ease",
                  fontSize: 12
                }}>
                  <input 
                    type="checkbox" 
                    checked={expressionSettings.eyeBlink}
                    onChange={(e) => setExpressionSettings(prev => ({...prev, eyeBlink: e.target.checked}))}
                    style={{ 
                      marginRight: 6, 
                      transform: "scale(0.9)",
                      accentColor: "#54a0ff"
                    }}
                  />
                  <span style={{ fontSize: 14, marginRight: 4 }}>😉</span>
                  <span style={{ color: "#fff", fontWeight: 500 }}>Blink</span>
                </label>

                {/* Mouth Pucker Checkbox - Compact */}
                <label style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  cursor: "pointer",
                  padding: "6px 8px",
                  background: expressionSettings.mouthPucker ? "rgba(255, 107, 107, 0.15)" : "rgba(255,255,255,0.05)",
                  borderRadius: 6,
                  border: `1px solid ${expressionSettings.mouthPucker ? "#ff6b6b" : "rgba(255,255,255,0.1)"}`,
                  transition: "all 0.2s ease",
                  fontSize: 12
                }}>
                  <input 
                    type="checkbox" 
                    checked={expressionSettings.mouthPucker}
                    onChange={(e) => setExpressionSettings(prev => ({...prev, mouthPucker: e.target.checked}))}
                    style={{ 
                      marginRight: 6, 
                      transform: "scale(0.9)",
                      accentColor: "#ff6b6b"
                    }}
                  />
                  <span style={{ fontSize: 14, marginRight: 4 }}>😙</span>
                  <span style={{ color: "#fff", fontWeight: 500 }}>Kiss</span>
                </label>
              </div>

              {/* Quick Select Buttons - Mini */}
              <div style={{ 
                display: "flex", 
                gap: 6, 
                justifyContent: "center"
              }}>
                <button 
                  onClick={() => setExpressionSettings({smile: true, jawOpen: true, eyeBlink: true, mouthPucker: true})}
                  style={{
                    padding: "4px 10px",
                    fontSize: 11,
                    background: "#43a047",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                    fontWeight: 500,
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => e.target.style.background = "#388e3c"}
                  onMouseLeave={(e) => e.target.style.background = "#43a047"}
                >
                  ✅ All
                </button>
                <button 
                  onClick={() => setExpressionSettings({smile: false, jawOpen: false, eyeBlink: false, mouthPucker: false})}
                  style={{
                    padding: "4px 10px",
                    fontSize: 11,
                    background: "#e53935",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                    fontWeight: 500,
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => e.target.style.background = "#c62828"}
                  onMouseLeave={(e) => e.target.style.background = "#e53935"}
                >
                  ❌ None
                </button>
              </div>
            </div>
          )}
          
          {/* Help Button */}
          <div style={{ marginTop: 40 }}>
            <button 
              onClick={() => setShowHelp(true)}
              style={{ 
                fontSize: 24, 
                padding: "12px 24px", 
                borderRadius: 12, 
                background: "#ff6b6b", 
                color: "#fff", 
                border: "none", 
                cursor: "pointer", 
                boxShadow: "2px 2px 8px #000",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#ff5252";
                e.target.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "#ff6b6b";
                e.target.style.transform = "scale(1)";
              }}
            >
              📖 How to Play
            </button>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelp && (
        <div 
          style={{
            position: "fixed", 
            left: 0, 
            top: 0, 
            width: "100%", 
            height: "100%", 
            zIndex: 50,
            background: "rgba(0,0,0,0.8)", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            animation: "fadeIn 0.3s ease-in-out"
          }}
          onClick={() => setShowHelp(false)}
        >
          <div 
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: 20,
              padding: 40,
              maxWidth: 600,
              maxHeight: "80vh",
              overflowY: "auto",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              animation: "slideUp 0.4s ease-out",
              color: "#fff"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
              <h2 style={{ 
                fontSize: 36, 
                fontWeight: 700, 
                margin: 0,
                background: "linear-gradient(45deg, #feca57, #ff9ff3)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontFamily: 'Fredoka One, Comic Sans MS, Arial, sans-serif'
              }}>
                How to Play Flappy Face 🎮
              </h2>
              <button 
                onClick={() => setShowHelp(false)}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  borderRadius: "50%",
                  width: 40,
                  height: 40,
                  fontSize: 20,
                  color: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "rgba(255,255,255,0.3)";
                  e.target.style.transform = "scale(1.1)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "rgba(255,255,255,0.2)";
                  e.target.style.transform = "scale(1)";
                }}
              >
                ✕
              </button>
            </div>

            {/* Game Objective */}
            <div style={{ marginBottom: 30 }}>
              <h3 style={{ 
                fontSize: 24, 
                fontWeight: 600, 
                marginBottom: 12,
                color: "#feca57"
              }}>
                🎯 Objective
              </h3>
              <p style={{ fontSize: 16, lineHeight: 1.6, margin: 0 }}>
                Navigate your colorful bird through pipes without crashing! Score points by successfully passing through pipe gaps. The game gets faster as your score increases.
              </p>
            </div>

            {/* Keyboard Controls */}
            <div style={{ marginBottom: 30 }}>
              <h3 style={{ 
                fontSize: 24, 
                fontWeight: 600, 
                marginBottom: 12,
                color: "#48dbfb"
              }}>
                ⌨️ Keyboard Mode
              </h3>
              <div style={{ 
                background: "rgba(255,255,255,0.1)", 
                borderRadius: 12, 
                padding: 20,
                border: "2px solid rgba(72, 219, 251, 0.3)"
              }}>
                <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ 
                    background: "#4f8edc", 
                    color: "#fff", 
                    padding: "8px 16px", 
                    borderRadius: 8, 
                    fontWeight: 600, 
                    marginRight: 12,
                    fontFamily: "monospace"
                  }}>
                    SPACEBAR
                  </span>
                  <span style={{ fontSize: 16 }}>Press to make the bird jump upward</span>
                </div>
                <p style={{ fontSize: 14, color: "#ccc", margin: 0 }}>
                  💡 <strong>Tip:</strong> Timing is everything! Press spacebar at the right moment to navigate through pipe gaps.
                </p>
              </div>
            </div>

            {/* Webcam Controls */}
            <div style={{ marginBottom: 30 }}>
              <h3 style={{ 
                fontSize: 24, 
                fontWeight: 600, 
                marginBottom: 12,
                color: "#ff9ff3"
              }}>
                📷 Webcam Mode (Face Control)
              </h3>
              <div style={{ 
                background: "rgba(255,255,255,0.1)", 
                borderRadius: 12, 
                padding: 20,
                border: "2px solid rgba(255, 159, 243, 0.3)"
              }}>
                <p style={{ fontSize: 16, marginBottom: 16, color: "#feca57" }}>
                  🎭 <strong>Control the bird with your facial expressions!</strong>
                </p>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ fontSize: 20, marginRight: 8 }}>😮</span>
                    <span style={{ fontSize: 14 }}>Open your mouth</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ fontSize: 20, marginRight: 8 }}>😙</span>
                    <span style={{ fontSize: 14 }}>Pucker lips (kiss)</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ fontSize: 20, marginRight: 8 }}>😊</span>
                    <span style={{ fontSize: 14 }}>Smile big</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ fontSize: 20, marginRight: 8 }}>😉</span>
                    <span style={{ fontSize: 14 }}>Blink either eye</span>
                  </div>
                </div>

                <div style={{ 
                  background: "rgba(67, 160, 71, 0.2)", 
                  borderRadius: 8, 
                  padding: 12, 
                  marginBottom: 12,
                  border: "1px solid rgba(67, 160, 71, 0.4)"
                }}>
                  <p style={{ fontSize: 14, margin: 0 }}>
                    🟢 <strong>Camera Setup:</strong> Allow camera permission when prompted. Your webcam feed will be processed locally for face detection.
                  </p>
                </div>

                <div style={{ 
                  background: "rgba(255, 107, 107, 0.2)", 
                  borderRadius: 8, 
                  padding: 12,
                  border: "1px solid rgba(255, 107, 107, 0.4)"
                }}>
                  <p style={{ fontSize: 14, margin: 0 }}>
                    ⚠️ <strong>Privacy:</strong> No video data is stored or transmitted. Face detection runs entirely in your browser using Google MediaPipe.
                  </p>
                </div>
              </div>
            </div>

            {/* Pro Tips */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ 
                fontSize: 24, 
                fontWeight: 600, 
                marginBottom: 12,
                color: "#54a0ff"
              }}>
                🏆 Pro Tips
              </h3>
              <ul style={{ fontSize: 16, lineHeight: 1.8, paddingLeft: 20 }}>
                <li>Start with keyboard mode to learn the game mechanics</li>
                <li>In webcam mode, sit in good lighting for better face detection</li>
                <li>Practice gentle expressions - exaggerated gestures work best</li>
                <li>The bird has momentum - plan your jumps ahead of time</li>
                <li>Game speed increases every 5 points - stay focused!</li>
              </ul>
            </div>

            {/* Close Button */}
            <div style={{ textAlign: "center" }}>
              <button 
                onClick={() => setShowHelp(false)}
                style={{
                  fontSize: 20,
                  padding: "12px 32px",
                  borderRadius: 12,
                  background: "linear-gradient(45deg, #feca57, #ff6b6b)",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "scale(1.05)";
                  e.target.style.boxShadow = "0 6px 20px rgba(0,0,0,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "scale(1)";
                  e.target.style.boxShadow = "0 4px 15px rgba(0,0,0,0.2)";
                }}
              >
                Got it! Let's Play 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Overlay */}
      {gameState === "gameover" && (
        <div style={{
          position: "absolute", left: 0, top: 0, width: "100%", height: "100%", zIndex: 10,
          background: "rgba(0,0,0,0.7)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
        }}>
          <h1 style={{ color: "#fff", fontSize: 64, marginBottom: 32, textShadow: "2px 2px 8px #000" }}>Game Over</h1>
          <div style={{ color: "#ffe259", fontSize: 40, fontWeight: 700, marginBottom: 24, textShadow: "2px 2px 8px #000" }}>
            Score: {score}
          </div>
          <button onClick={handleRestart} style={{ fontSize: 32, padding: "16px 48px", borderRadius: 12, background: "#e07a5f", color: "#fff", border: "none", cursor: "pointer", boxShadow: "2px 2px 8px #000" }}>Restart</button>
        </div>
      )}
      {/* Absolutely position the HTML/CSS bird over the canvas, following birdPos */}
      <div
        className="sky"
        style={{
          position: "absolute",
          left: 1,
          top: 110,
          width: 900,
          height: 600,
          pointerEvents: "none",
          zIndex: 2,
        }}
      >
        <div
          className="bird"
          style={{
            position: "absolute",
            left: `${birdPos.x}px`,
            top: `${birdPos.y}px`,
            width:10,
            height: 10,
           
            pointerEvents: "none",
          }}
        >
          <div className="body">
            <div className="head"></div>
            <div className="left-wing">
              <div className="left-top-wing"></div>
            </div>
            <div className="right-wing">
              <div className="right-top-wing"></div>
            </div>
            <div className="left-tail"></div>
            <div className="right-tail"></div>
          </div>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className="border-2"
        width={900}
        height={600}
        style={{ position: "relative", zIndex: 1 }}
      />
      {/* Webcam/FaceControl Elements for facecontrol.js */}
      <video 
  id="webcam" 
  style={{ 
   visibility:"hidden",
    position: "fixed", 
    top: 100, 
    right: 10, 
    width: 320, 
    height: 240, 
    border: "2px solid #fff",
    zIndex: 1000
  }} 
  autoPlay 
  playsInline 
  muted
/>
      <button id="startbtn" style={{display:"none", position: "fixed", top: 10, right: 10, zIndex: 1000 }}>Start Webcam</button>
      <div id="webcamConnected" style={{ display:"none", position: "fixed", top: 50, right: 10, zIndex: 1000, color: "lime" }}>Webcam Connected</div>
      {/* <div id="video-blend-shapes" style={{ }}></div> */}
    </div>
  );
}

export default Game;
