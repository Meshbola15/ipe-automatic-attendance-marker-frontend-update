/* eslint-disable react-refresh/only-export-components */
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  databaseKeys,
  findItemById,
  updateInDatabase,
} from "../utils/database";

export const AdminContext = React.createContext();

const AdminContextProvider = ({ children }) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [currentFileName, setCurrentFileName] = useState("");
  const [cameraTimeString, setCameraTimeString] = useState("02:00:00");
  const [hasNotified, setHasNotified] = useState(false);
  const [adminDetails, setAdminDetails] = useState({});
  const [loading, setLoading] = useState(false);

  const convertTimeStringToSeconds = (timeStr) => {
    const [hours, minutes, seconds] = timeStr.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };

  const updateLastCameraActiveTimeStamp = async () => {
    if (!adminDetails?.id) return;

    const expiryTime =
      Date.now() + convertTimeStringToSeconds(cameraTimeString) * 1000;

    await updateInDatabase(databaseKeys.ADMIN, adminDetails.id, {
      ...adminDetails,
      cameraLastActiveTime: expiryTime,
    });

    setHasNotified(false);
  };

  const onCameraTimeExhausted = () => {
    if (!hasNotified) {
      toast.info("Camera time has been exhausted.");
      setHasNotified(true);
    }
    setIsCameraActive(false);
  };

  const checkCameraTimeExhausted = async () => {
    if (!adminDetails.id) return;

    const userData = await findItemById(databaseKeys.ADMIN, adminDetails.id);
    if (!userData?.cameraLastActiveTime) return;

    const currentTime = Date.now();

    if (currentTime >= userData.cameraLastActiveTime) {
      onCameraTimeExhausted();
    } else {
      setIsCameraActive(true);
    }
  };

  // 👇 Load admin from localStorage once on mount
  useEffect(() => {
    const fetchAdmin = async () => {
      setLoading(true);
      try {
        const stored = localStorage.getItem("admin");
        if (stored) {
          setAdminDetails(
            await findItemById(databaseKeys.ADMIN, JSON.parse(stored).id)
          );
        }
      } catch (e) {
        toast.error("Error fetching admin details");
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
  }, []);

  // 👇 Check camera time every 1 second
  useEffect(() => {
    const interval = setInterval(() => {
      if (adminDetails?.id) checkCameraTimeExhausted();
    }, 1000);

    return () => clearInterval(interval);
  }, [adminDetails.id]); // only re-run if the admin ID changes

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
        adminDetails,
        setAdminDetails,
        loading,
        setLoading,
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
