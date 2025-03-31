import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

const FaceRecognition = ({ videoRef, registerFace }) => {
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



  const recognizeFace = async () => {
    if (!videoRef.current) return;

    const storedDescriptor = localStorage.getItem("registeredFace");
    if (!storedDescriptor) {
      alert("No registered face found.");
      return;
    }

    // Parse the stored descriptor back into a Float32Array
    const storedArray = new Float32Array(JSON.parse(storedDescriptor));

    // Create LabeledFaceDescriptors with the stored descriptor
    const labeledDescriptor = new faceapi.LabeledFaceDescriptors("User", [storedArray]);

    const faceMatcher = new faceapi.FaceMatcher([labeledDescriptor], 0.6);

    const detections = await faceapi.detectSingleFace(videoRef.current,
      new faceapi.TinyFaceDetectorOptions()
    ).withFaceLandmarks().withFaceDescriptor();

    if (!detections) {
      setStatus("No face detected.");
      return;
    }

    // Compare the live descriptor with the stored one
    const bestMatch = faceMatcher.findBestMatch(detections.descriptor);
    setStatus(bestMatch.toString());
  };

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
