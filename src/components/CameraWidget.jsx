import { useState, useEffect } from "react";
import { FiCameraOff, FiCamera, FiRepeat } from "react-icons/fi";
import FaceRecognition from "./Software";

const CameraWidget = ({ registerFace, videoRef, recognizeFace }) => {
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [devices, setDevices] = useState([]);
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0);
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((mediaDevices) => {
      const videoDevices = mediaDevices.filter((device) => device.kind === "videoinput");
      setDevices(videoDevices);
    });
  }, []);

  const startCamera = async (deviceId) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: { exact: deviceId } },
    });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  };

  useEffect(() => {
    if (devices.length > 0 && isCameraOn) {
      startCamera(devices[currentDeviceIndex].deviceId);
    }
  }, [devices, currentDeviceIndex, isCameraOn]);

  const toggleCameraDevice = () => {
    const nextIndex = (currentDeviceIndex + 1) % devices.length;
    setCurrentDeviceIndex(nextIndex);
  };

  return (
    <div className="card !p-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isCameraOn ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
          <span className="text-sm font-semibold text-slate-700">
            {isCameraOn ? "Camera Active" : "Camera Off"}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsCameraOn(!isCameraOn)}
            type="button"
            title={isCameraOn ? "Turn off camera" : "Turn on camera"}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            {isCameraOn ? <FiCameraOff size={16} /> : <FiCamera size={16} />}
          </button>
          <button
            onClick={toggleCameraDevice}
            type="button"
            title="Switch camera"
            disabled={devices.length <= 1}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FiRepeat size={16} />
          </button>
        </div>
      </div>

      {/* Video */}
      {isCameraOn ? (
        <div className="relative rounded-xl overflow-hidden bg-slate-900 w-full">
          <FaceRecognition
            registerFace={registerFace}
            recognizeFace={recognizeFace}
            videoRef={videoRef}
          />
        </div>
      ) : (
        <div className="aspect-video bg-slate-100 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-400">
          <FiCameraOff size={28} className="opacity-50" />
          <p className="text-sm">Camera is turned off</p>
        </div>
      )}
    </div>
  );
};

export default CameraWidget;
