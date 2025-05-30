import React, { useEffect, useRef } from 'react'
import "./cam.css"

export const Cam = () => {
  const demosRef = useRef(null);
  const imageBlendShapesRef = useRef(null);
  const videoBlendShapesRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    let faceLandmarker;
    let runningMode = "IMAGE";
    let enableWebcamButton;
    let webcamRunning = false;
    const videoWidth = 480;

    // Import MediaPipe vision
    const initMediaPipe = async () => {
      const vision = await import("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3");
      const { FaceLandmarker, FilesetResolver, DrawingUtils } = vision;

      // Create face landmarker
      const createFaceLandmarker = async () => {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "GPU"
          },
          outputFaceBlendshapes: true,
          runningMode,
          numFaces: 1
        });
        if (demosRef.current) {
          demosRef.current.classList.remove("invisible");
        }
      };

      await createFaceLandmarker();

      // Handle image click detection
      const handleImageClick = async (event) => {
        if (!faceLandmarker) {
          console.log("Wait for faceLandmarker to load before clicking!");
          return;
        }

        if (runningMode === "VIDEO") {
          runningMode = "IMAGE";
          try {
            await faceLandmarker.setOptions({ runningMode });
          } catch (error) {
            console.error("Error setting running mode:", error);
          }
        }

        // Remove previous canvas elements
        const allCanvas = event.target.parentNode.getElementsByClassName("canvas");
        for (var i = allCanvas.length - 1; i >= 0; i--) {
          const n = allCanvas[i];
          n.parentNode.removeChild(n);
        }

        // Detect face landmarks
        const faceLandmarkerResult = faceLandmarker.detect(event.target);
        const canvas = document.createElement("canvas");
        canvas.setAttribute("class", "canvas");
        canvas.setAttribute("width", event.target.naturalWidth + "px");
        canvas.setAttribute("height", event.target.naturalHeight + "px");
        canvas.style.left = "0px";
        canvas.style.top = "0px";
        canvas.style.width = `${event.target.width}px`;
        canvas.style.height = `${event.target.height}px`;

        event.target.parentNode.appendChild(canvas);
        const ctx = canvas.getContext("2d");
        const drawingUtils = new DrawingUtils(ctx);

        // Draw face landmarks
        for (const landmarks of faceLandmarkerResult.faceLandmarks) {
          drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_TESSELATION, { color: "#C0C0C070", lineWidth: 1 });
          drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE, { color: "#FF3030" });
          drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW, { color: "#FF3030" });
          drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYE, { color: "#30FF30" });
          drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW, { color: "#30FF30" });
          drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_FACE_OVAL, { color: "#E0E0E0" });
          drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LIPS, { color: "#E0E0E0" });
          drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS, { color: "#FF3030" });
          drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS, { color: "#30FF30" });
        }
        drawBlendShapes(imageBlendShapesRef.current, faceLandmarkerResult.faceBlendshapes);
      };

      // Setup image detection after function is defined
      const imageContainers = document.getElementsByClassName("detectOnClick");
      for (let imageContainer of imageContainers) {
        imageContainer.children[0].addEventListener("click", handleImageClick);
      }

      // Setup webcam detection
      const video = videoRef.current;
      const canvasElement = canvasRef.current;
      const canvasCtx = canvasElement.getContext("2d");
      let lastVideoTime = -1;
      let results = undefined;
      const drawingUtils = new DrawingUtils(canvasCtx);

      // Predict webcam function - defined before it's used
      const predictWebcam = async () => {
        const radio = video.videoHeight / video.videoWidth;
        video.style.width = videoWidth + "px";
        video.style.height = videoWidth * radio + "px";
        canvasElement.style.width = videoWidth + "px";
        canvasElement.style.height = videoWidth * radio + "px";
        canvasElement.width = video.videoWidth;
        canvasElement.height = video.videoHeight;

        if (runningMode === "IMAGE") {
          runningMode = "VIDEO";
          try {
            await faceLandmarker.setOptions({ runningMode: runningMode });
          } catch (error) {
            console.error("Error setting running mode:", error);
          }
        }

        let startTimeMs = performance.now();
        if (lastVideoTime !== video.currentTime) {
          lastVideoTime = video.currentTime;
          results = faceLandmarker.detectForVideo(video, startTimeMs);
        }

        if (results.faceLandmarks) {
          for (const landmarks of results.faceLandmarks) {
            drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_TESSELATION, { color: "#C0C0C070", lineWidth: 1 });
            drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE, { color: "#FF3030" });
            drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW, { color: "#FF3030" });
            drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYE, { color: "#30FF30" });
            drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW, { color: "#30FF30" });
            drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_FACE_OVAL, { color: "#E0E0E0" });
            drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LIPS, { color: "#E0E0E0" });
            drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS, { color: "#FF3030" });
            drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS, { color: "#30FF30" });
          }
        }
        drawBlendShapes(videoBlendShapesRef.current, results.faceBlendshapes);

        if (webcamRunning === true) {
          window.requestAnimationFrame(predictWebcam);
        }
      };

      // Check if webcam access is supported
      const hasGetUserMedia = () => {
        return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      };

      // Enable webcam function
      const enableCam = (event) => {
        if (!faceLandmarker) {
          console.log("Wait! faceLandmarker not loaded yet.");
          return;
        }

        if (webcamRunning === true) {
          webcamRunning = false;
          enableWebcamButton.innerText = "ENABLE WEBCAM";
          // Stop the webcam stream
          if (video.srcObject) {
            const stream = video.srcObject;
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
            video.srcObject = null;
          }
        } else {
          webcamRunning = true;
          enableWebcamButton.innerText = "DISABLE WEBCAM";

          const constraints = { 
            video: { 
              facingMode: 'user',
              width: { ideal: 640 },
              height: { ideal: 480 }
            } 
          };

          navigator.mediaDevices.getUserMedia(constraints)
            .then((stream) => {
              video.srcObject = stream;
              video.addEventListener("loadeddata", predictWebcam);
            })
            .catch((error) => {
              console.error("Error accessing webcam:", error);
              webcamRunning = false;
              enableWebcamButton.innerText = "ENABLE WEBCAM";
              alert("Unable to access webcam. Please check permissions and try again.");
            });
        }
      };

      if (hasGetUserMedia()) {
        enableWebcamButton = document.getElementById("webcamButton");
        if (enableWebcamButton) {
          enableWebcamButton.addEventListener("click", enableCam);
        }
      } else {
        console.warn("getUserMedia() is not supported by your browser");
      }

      // Draw blend shapes function
      const drawBlendShapes = (el, blendShapes) => {
        if (!blendShapes || !blendShapes.length || !el) {
          return;
        }

        console.log(blendShapes[0]);
        
        let htmlMaker = "";
        blendShapes[0].categories.map((shape) => {
          htmlMaker += `
            <li className="blend-shapes-item">
              <span className="blend-shapes-label">${shape.displayName || shape.categoryName}</span>
              <span className="blend-shapes-value" style="width: calc(${+shape.score * 100}% - 120px)">${(+shape.score).toFixed(4)}</span>
            </li>
          `;
        });

        el.innerHTML = htmlMaker;
      };
    };

    initMediaPipe();

    // Cleanup function
    return () => {
      // Stop webcam if running
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <>
      <h1>Face landmark detection using the MediaPipe FaceLandmarker task</h1>

      <section id="demos" ref={demosRef} className="invisible">
        {/* <h2>Demo: Detecting Images</h2>
        <p><b>Click on an image below</b> to see the key landmarks of the face.</p>

        <div className="detectOnClick">
          <img src="https://storage.googleapis.com/mediapipe-assets/portrait.jpg" width="100%" crossOrigin="anonymous" title="Click to get detection!" />
        </div>
        <div className="blend-shapes">
          <ul className="blend-shapes-list" id="image-blend-shapes" ref={imageBlendShapesRef}></ul>
        </div> */}

        <h2>Demo: Webcam continuous face landmarks detection</h2>
        <p>Hold your face in front of your webcam to get real-time face landmarker detection. Click <b>enable webcam</b> below and grant access to the webcam if prompted.</p>

        <div id="liveView" className="videoView">
          <button id="webcamButton" className="mdc-button mdc-button--raised">
            <span className="mdc-button__ripple"></span>
            <span className="mdc-button__label">ENABLE WEBCAM</span>
          </button>
          <div style={{position: 'relative'}}>
            <video id="webcam" ref={videoRef} style={{position: 'absolute'}} autoPlay playsInline></video>
            <canvas className="output_canvas" id="output_canvas" ref={canvasRef} style={{position: 'absolute', left: 0, top: 0}}></canvas>
          </div>
        </div>
        <div className="blend-shapes">
          <ul className="blend-shapes-list" id="video-blend-shapes" ref={videoBlendShapesRef}></ul>
        </div>
      </section>
    </>
  )
}
