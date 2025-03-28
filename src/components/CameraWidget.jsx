import { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { motion } from 'framer-motion';
import { FiCameraOff, FiCamera } from 'react-icons/fi';

const CameraWidget = ({ onCapture }) => {
  const webcamRef = useRef(null);
  const [isCameraOn, setIsCameraOn] = useState(true);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    onCapture(imageSrc);
  };

  // Simulate face detection every 5 seconds
  useEffect(() => {
    if (isCameraOn) {
      const interval = setInterval(() => {
        capture();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isCameraOn]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-2xl shadow-lg p-4 md:p-6"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-purple-600 text-xl font-bold">Attendance Scanner</h2>
        <button
          onClick={() => setIsCameraOn(!isCameraOn)}
          className="bg-purple-100 p-2 rounded-lg hover:bg-purple-200"
        >
          {isCameraOn ? <FiCameraOff size={24} /> : <FiCamera size={24} />}
        </button>
      </div>
      
      {isCameraOn ? (
        <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden">
          <Webcam
            ref={webcamRef}
            className="w-full h-full object-cover"
            screenshotFormat="image/jpeg"
            mirrored
          />
        </div>
      ) : (
        <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
          <p className="text-gray-500">Camera is disabled</p>
        </div>
      )}
    </motion.div>
  );
};

export default CameraWidget;