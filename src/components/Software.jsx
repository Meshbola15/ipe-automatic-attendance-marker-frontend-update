import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

const FaceRecognition = ({ videoRef, registerFace, recognizeFace }) => {
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("Waiting...");

  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
      await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
      console.log("Models Loaded!");
      startVideo();
    };

    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing webcam:", error);
      }
    };

    loadModels();
  }, []);

  return (
    <div>
      <video ref={videoRef} width="640" height="480" autoPlay></video>
      <canvas ref={canvasRef} />
      <p>Status: {status}</p>
      <button onClick={registerFace}>Register Face</button>
      <button onClick={recognizeFace}>Recognize Face</button>
    </div>
  );
};

export default FaceRecognition;
