/* eslint-disable react-refresh/only-export-components */
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

export const AdminContext = React.createContext();

const AdminContextProvider = ({ children }) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [currentFileName, setCurrentFileName] = useState("");
  const [cameraTimeString, setCameraTimeString] = useState("02:00:00");
  const [hasNotified, setHasNotified] = useState(false); // Prevent multiple toasts

  // Convert time string (HH:MM:SS) to seconds
  const convertTimeStringToSeconds = (timeStr) => {
    const [hours, minutes, seconds] = timeStr.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };

  // Save the timestamp when the camera is activated
  const updateLastCameraActiveTimeStamp = () => {
    const expiryTime =
      new Date().getTime() +
      convertTimeStringToSeconds(cameraTimeString) * 1000;
    localStorage.setItem("lastCameraActiveTimeStamp", expiryTime);
    setHasNotified(false); // Reset notification flag when activating the camera
  };

  // Handle camera time exhaustion
  const onCameraTimeExhausted = () => {
    if (!hasNotified) {
      toast.info("Camera time has been exhausted.");
      setHasNotified(true); // Prevent further toasts
    }
    setIsCameraActive(false);
    localStorage.removeItem("lastCameraActiveTimeStamp");
  };

  // Check if camera time is exhausted
  const checkCameraTimeExhausted = () => {
    const currentTime = new Date().getTime();
    const lastActiveTime =
      Number(localStorage.getItem("lastCameraActiveTimeStamp")) || 0;

    if (currentTime >= lastActiveTime && lastActiveTime > 0) {
      onCameraTimeExhausted();
    } else if (lastActiveTime > currentTime) {
      setIsCameraActive(true);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      checkCameraTimeExhausted();
    }, 1000);

    return () => clearTimeout(timer); // Cleanup to prevent multiple timers
  }, [isCameraActive]);

  return (
    <AdminContext.Provider
      value={{
        isCameraActive,
        setIsCameraActive,
        currentFileName,
        setCurrentFileName,
        cameraTimeString,
        setCameraTimeString,
        updateLastCameraActiveTimeStamp,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminContext = () => {
  const context = React.useContext(AdminContext);
  if (!context) {
    throw new Error(
      "useAdminContext must be used within an AdminContextProvider"
    );
  }
  return context;
};

export { AdminContextProvider };
