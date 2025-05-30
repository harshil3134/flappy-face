import * as vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision";

const { FaceLandmarker, FilesetResolver } = vision;

export function setupFaceControl(onJump) {
  const videoBlendShapes = document.getElementById("video-blend-shapes");
  let faceLandmarker;
  let runningMode = "VIDEO";
  let webcamRunning = false;

  // Debounce state for gestures
  let prevJawOpen = false;
  let prevKissy = false;
  let prevBrowInnerUp = false;

  async function createFaceLandmarker() {
    const filesetResolver = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
    );
    faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
        delegate: "GPU",
        useGpu: true
      },
      outputFaceBlendshapes: true,
      enableFaceGeometry: false,
      refineLandmarks: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
      runningMode,
      numFaces: 1,
      maxNumFaces: 1,
      useGpu: true
    });
    console.log('loaded model')
  }
  createFaceLandmarker();

  const video = document.getElementById("webcam");
  const startbtn = document.getElementById("startbtn");
  const webcamConnected = document.getElementById("webcamConnected");

  function hasGetUserMedia() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  if (hasGetUserMedia() && startbtn) {
    startbtn.addEventListener("click", enableCam);
  } else if (!hasGetUserMedia()) {
    console.warn("getUserMedia() is not supported by your browser");
  }

  function enableCam(event) {
    if (!faceLandmarker) {
      console.log("Wait! faceLandmarker not loaded yet.");
      return;
    }

    if (webcamRunning === true) {
      webcamRunning = false;
      if (startbtn) startbtn.style.opacity = 1;
      if (webcamConnected) webcamConnected.style.opacity = 0;
    } else {
      webcamRunning = true;
      if (startbtn) startbtn.style.opacity = 0;
      if (webcamConnected) webcamConnected.style.opacity = 1;
    }

    const constraints = {
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 12 } }, audio: false
    };

    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      video.srcObject = stream;
      video.addEventListener("loadeddata", predictWebcam);
    });
  }

  let lastVideoTime = -1;
  let results = undefined;

  async function predictWebcam() {
    let startTimeMs = performance.now();
    if (lastVideoTime !== video.currentTime) {
      lastVideoTime = video.currentTime;
      results = faceLandmarker.detectForVideo(video, startTimeMs);
    }
    drawBlendShapes(videoBlendShapes, results.faceBlendshapes);
    if (webcamRunning === true) {
      window.requestAnimationFrame(predictWebcam);
    }
  }

  function drawBlendShapes(el, blendShapes) {
    if (!blendShapes.length) {
      // Reset debounce if no face
      prevJawOpen = false;
      prevKissy = false;
      prevBrowInnerUp = false;
      return;
    }
    const jawOpen = blendShapes[0].categories.find((shape) => shape.categoryName == 'jawOpen');
    if (jawOpen && jawOpen.score > .5) {
      if (!prevJawOpen) {
        prevJawOpen = true;
        console.log('jump');
        onJump();
      }
    } else {
      prevJawOpen = false;
    }
    const kissy = blendShapes[0].categories.find((shape) => shape.categoryName == 'mouthPucker');
    if (kissy && kissy.score > .5) {
      if (!prevKissy) {
        prevKissy = true;
        console.log('kiss');
        onJump();
      }
    } else {
      prevKissy = false;
    }
    const browInnerUp = blendShapes[0].categories.find((shape) => shape.categoryName == 'browInnerUp');
    if (browInnerUp && browInnerUp.score > .5) {
      if (!prevBrowInnerUp) {
        prevBrowInnerUp = true;
        console.log('brow');
        onJump();
      }
    } else {
      prevBrowInnerUp = false;
    }
  }
}

