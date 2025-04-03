// src/pages/Dashboard.jsx
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import useSound from "use-sound";
import successSound from "../assets/sound.mp3";
import {
  saveToDatabase,
  loadFromDatabase,
  databaseKeys,
} from "../utils/database";
import CameraWidget from "../components/CameraWidget";
import { toast } from "react-toastify";

const Dashboard = () => {
  const [play] = useSound(successSound);
  const [recentEntries, setRecentEntries] = useState([]);
  const [isMarked, setIsMarked] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const savedEntries = loadFromDatabase(databaseKeys.ATTENDANCE) || [];
    if (savedEntries.length > 0) {
      setRecentEntries(savedEntries[savedEntries.length - 1].attendees || []);
    }
  }, []);

  const handleNewEntry = (newEntry) => {
    let currentAttendance = loadFromDatabase(databaseKeys.ATTENDANCE) || [];
    let latestAttendance = currentAttendance[currentAttendance.length - 1];

    if (!latestAttendance) {
      latestAttendance = {
        date: new Date().toLocaleDateString(),
        attendees: [],
      };
      currentAttendance.push(latestAttendance);
    }

    const alreadyMarked = latestAttendance.attendees.some(
      (entry) => entry.id === newEntry.id
    );

    if (alreadyMarked) {
      toast.error("Entry already exists");
      return;
    }

    latestAttendance.attendees.push(newEntry);
    saveToDatabase(databaseKeys.ATTENDANCE, currentAttendance);

    setRecentEntries([newEntry, ...recentEntries]);
    toast.success(`${newEntry.name} has been marked Present!`);
  };

  const simulateFaceDetection = () => {
    if (!isMarked) {
      const newEntry = {
        id: Date.now(),
        name: "John Doe",
        matricNo: "STD001",
        time: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString(),
        status: "Present",
      };
      handleNewEntry(newEntry);
      play();
      setIsMarked(true);
      setTimeout(() => setIsMarked(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-purple-50 p-6 md:p-8 flex flex-col items-center">
      {/* Camera Widget */}
      <div className="w-full max-w-3xl" ref={videoRef}>
        <CameraWidget videoRef={videoRef} />
      </div>

      {/* Recent Entries Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-6 mt-6"
      >
        <h2 className="text-purple-600 text-xl font-bold mb-4 text-center">
          Recent Entries
        </h2>
        <div className="space-y-4">
          {recentEntries.length > 0 ? (
            recentEntries.map((entry, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex justify-between items-center bg-purple-100 p-3 rounded-lg shadow-sm"
              >
                <span className="font-medium text-purple-700">
                  {entry?.name}
                </span>
                <span className="text-gray-600 text-sm">{entry?.matricNo}</span>
                <span className="text-gray-500 text-sm">{entry?.time}</span>
              </motion.div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-6">
              No recent entries detected yet
            </div>
          )}
        </div>
      </motion.div>

      {/* Simulate Detection Button */}
      <button
        onClick={simulateFaceDetection}
        className="fixed bottom-6 right-6 bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition-colors focus:outline-none"
      >
        Simulate Detection
      </button>
    </div>
  );
};

export default Dashboard;
