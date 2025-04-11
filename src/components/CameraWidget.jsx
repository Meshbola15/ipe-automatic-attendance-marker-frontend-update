import { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { FiCameraOff, FiCamera } from "react-icons/fi";
import FaceRecognition from "./Software";
import { useAdminContext } from "../context/adminContext";

const CameraWidget = ({ registerFace, videoRef, recognizeFace }) => {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const { isCameraActive } = useAdminContext();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-2xl shadow-lg p-4 md:p-6"
    >
      {isCameraActive ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-purple-600 text-xl font-bold">
              Attendance Scanner
            </h2>
            <button
              onClick={() => setIsCameraOn(!isCameraOn)}
              type="button"
              className="bg-purple-100 p-2 rounded-lg hover:bg-purple-200"
            >
              {isCameraOn ? <FiCameraOff size={24} /> : <FiCamera size={24} />}
            </button>
          </div>

          {isCameraOn ? (
            <div className="relative aspect-video bg-gray-100 rounded-xl w-full">
              <FaceRecognition
                registerFace={registerFace}
                recognizeFace={recognizeFace}
                videoRef={videoRef}
              />
            </div>
          ) : (
            <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
              <p className="text-gray-500">Camera is disabled</p>
            </div>
          )}
        </>
      ) : (
        <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
          <p className="text-gray-500">Admin has disabled the camera</p>
        </div>
      )}
    </motion.div>
  );
};

export default CameraWidget;
