import { useEffect, useRef, useState } from "react";
import "./game.css";
import { createFaceLandmarker, initializeWebcam, isFaceModelLoaded, startFaceDetection, stopFaceDetection } from "../facecontrol";


function Game() {
  const canvasRef = useRef(null);
  const [birdPos, setBirdPos] = useState({ x: 100, y: 250 });
  const [gameState, setGameState] = useState("start"); // "start", "running", "gameover"
  const [score, setScore] = useState(0);
    const [controlMode, setControlMode] = useState(null); // 'keyboard' or 'webcam'
  const velocityYRef = useRef(0);

  // Setup face control only if webcam mode is selected

const handlefacecontrol=async()=>{
    try{
        console.log("face",isFaceModelLoaded());
        
    if(!isFaceModelLoaded())
    {
        let modelloader=await createFaceLandmarker()
        if(modelloader==true)
        {
          console.log("returned true in game",modelloader);
          
          return true;
        }
    }
    else{
        return true;
    }
}
    catch(err)
    {
        console.log("err",err);
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
  console.log("Model loaded:", res);
  
  if(res == true) {
    // ✅ FIRST: Initialize webcam and get camera permission
    let resweb = await initializeWebcam()
    console.log("Webcam initialized:", resweb);
    
    if(resweb == true) {
      // ✅ SECOND: Start face detection AFTER webcam is ready
      setTimeout(() => {
        startFaceDetection(() => {
          // Add jump callback for bird control
          velocityYRef.current = -6;
           console.log("🐦 Bird jumped from face!");
        });
        console.log("Face detection started!");
      }, 1000); // Wait for video stream to be ready
      
      setControlMode("webcam");
      setGameState("running");
      setBirdPos({ x: 100, y: 250 });
      setScore(0);
    }
  }
}
  function handleRestart() {
      stopFaceDetection();
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
