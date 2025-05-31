import vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";
const { FaceLandmarker, FilesetResolver, DrawingUtils } = vision;

let faceLandmarker;
let video;
let results;
let lastVideoTime = -1;
let webcamRunning = false;
let onJumpCallback=null;
let enabledExpressions = {
  smile: true,
  jawOpen: true,
  eyeBlink: true,
  mouthPucker: true
};

export async function createFaceLandmarker() {
  const filesetResolver = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
  );
  faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
      delegate: "GPU"
    },
    outputFaceBlendshapes: true,
    runningMode: "VIDEO",
    numFaces: 1
  });
  console.log("face model loaded successfully");
  return true;
}

export function isFaceModelLoaded() {
  console.log("isfacemodelloaded",faceLandmarker);
  
  return faceLandmarker !== null && faceLandmarker!==undefined;
}

export async function initializeWebcam() {
  video = document.getElementById("webcam"); // ✅ Now video is accessible
  
  try {
    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
      console.log("Camera not supported");
      return false; 
    }
    
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    console.log("Camera permission granted!");
    return true; 
    
  } catch (err) {
    console.log('Camera error:', err);
    return false; 
  }
}

// ✅ Start the prediction loop
export function startFaceDetection(jumpCallback, expressionConfig = null) {
  onJumpCallback=jumpCallback;
  if (expressionConfig) {
    enabledExpressions = { ...enabledExpressions, ...expressionConfig };
  }
  webcamRunning = true;
  predictwebcam(); // Start the loop
}

// ✅ Stop the prediction loop
export function stopFaceDetection() {
  webcamRunning = false;
}

async function predictwebcam() {

  
  // ✅ Check if we should continue
  if (!webcamRunning || !video || !video.videoWidth) {
    return;
  }

  try {
    let startTimeMs = performance.now();
    
    if (lastVideoTime !== video.currentTime) {
      lastVideoTime = video.currentTime;
      results = faceLandmarker.detectForVideo(video, startTimeMs);
    }
    
    // if (results && results.faceLandmarks) {
    //   for (const landmarks of results.faceLandmarks) {
    //     console.log("Face detected with", landmarks, "landmarks");
    //   }
    // }
    if(results && results.faceLandmarks)
    {
      // console.log("face detected with",results.faceLandmarks.length,"faces");
      
    }

if(results && results.faceBlendshapes.length>0)
{
  
  checkforexpression(results.faceBlendshapes[0].categories);
 
}


  } catch (err) {
    console.log("Prediction error:", err);
  }
  
  // ✅ Continue the loop
  if (webcamRunning) {
    requestAnimationFrame(predictwebcam);
  }
}
  let lasttime;
const checkforexpression=(result)=>{

  const now=Date.now();

  if((now - lasttime )< 700 )
  {
    console.log("jump blocked ");
    
    return;
  }

  // console.log("Res",result);
  const mouthPucker=result[38];
  const eyeblinkLeft=result[8];
  const eyeblinkRight=result[9];
  const jawopen=result[25];
  const smileLeft=result[44];
  const smileRight=result[45];
  
  let shouldJump = false;
  
  // Check each expression only if it's enabled
  if (enabledExpressions.mouthPucker && mouthPucker.score > 0.5) {
    console.log("🫦 Mouth pucker detected!", mouthPucker.score);
    shouldJump = true;
  }
  
  if (enabledExpressions.eyeBlink && (eyeblinkLeft.score > 0.5 || eyeblinkRight.score > 0.5)) {
    console.log("😉 Eye blink detected!", eyeblinkLeft.score, eyeblinkRight.score);
    shouldJump = true;
  }
  
  if (enabledExpressions.jawOpen && jawopen.score > 0.5) {
    console.log("😮 Jaw open detected!", jawopen.score);
    shouldJump = true;
  }
  
  if (enabledExpressions.smile && (smileLeft.score > 0.5 || smileRight.score > 0.5)) {
    console.log("😊 Smile detected!", smileLeft.score, smileRight.score);
    shouldJump = true;
  }

  if (shouldJump && onJumpCallback) {
    console.log("🐦 Jump operation performed!");
    onJumpCallback();
    lasttime = now;
  }
}