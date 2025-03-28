// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import useSound from "use-sound";
import successSound from "../assets/sound.mp3";
import {
  saveToDatabase,
  loadFromDatabase,
  databaseKeys,
} from "../utils/database";
import CameraWidget from "../components/CameraWidget";

const Dashboard = () => {
  const [play] = useSound(successSound);
  const [recentEntries, setRecentEntries] = useState([]);
  const [isMarked, setIsMarked] = useState(false);

  // Load existing entries on mount
  useEffect(() => {
    const savedEntries = loadFromDatabase(databaseKeys.ATTENDANCE) || [];
    setRecentEntries(savedEntries.slice(0, 5));
  }, []);

  const handleNewEntry = (newEntry) => {
    const allEntries = loadFromDatabase(databaseKeys.ATTENDANCE) || [];
    const updatedEntries = [newEntry, ...allEntries];
    saveToDatabase(databaseKeys.ATTENDANCE, updatedEntries);
    setRecentEntries([newEntry, ...allEntries.slice(0, 4)]);
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
    <div className="min-h-screen bg-purple-50 p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <CameraWidget />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl shadow-lg p-4 md:p-6"
        >
          <h2 className="text-purple-600 text-xl font-bold mb-4">
            Recent Entries
          </h2>
          <div className="space-y-4">
            {recentEntries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="grid grid-cols-3 md:grid-cols-4 gap-4 items-center bg-purple-50/50 p-3 rounded-lg"
              >
                <span className="font-medium text-purple-600">
                  {entry.name}
                </span>
                <span className="text-gray-600 text-sm">{entry.matricNo}</span>
                <span className="text-gray-500 text-sm col-span-2 md:col-span-1">
                  {entry.time}
                </span>
              </motion.div>
            ))}

            {recentEntries.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No recent entries detected yet
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <button
        onClick={simulateFaceDetection}
        className="fixed bottom-4 right-4 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
      >
        Simulate Detection
      </button>
    </div>
  );
};

export default Dashboard;
