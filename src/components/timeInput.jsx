import React, { useEffect, useState } from "react";
import { useAdminContext } from "../context/adminContext";

const TimeInput = () => {
  // Inside your component:
  const [durationHours, setDurationHours] = useState("02");
  const [durationMinutes, setDurationMinutes] = useState("00");
  const [durationSeconds, setDurationSeconds] = useState("00");
  const { setCameraTimeString } = useAdminContext();

  // Update cameraTimeString whenever one of the fields changes.
  useEffect(() => {
    const formattedHours = String(durationHours).padStart(2, "0");
    const formattedMinutes = String(durationMinutes).padStart(2, "0");
    const formattedSeconds = String(durationSeconds).padStart(2, "0");
    setCameraTimeString(
      `${formattedHours}:${formattedMinutes}:${formattedSeconds}`
    );
  }, [durationHours, durationMinutes, durationSeconds]);

  return (
    <div className="flex space-x-2">
      <input
        type="number"
        min="0"
        value={durationHours}
        onChange={(e) => setDurationHours(e.target.value)}
        className="text-xl md:text-3xl text-black font-bold w-1/3 bg-white border border-gray-400 rounded-md p-2"
        placeholder="Hours"
      />
      <input
        type="number"
        min="0"
        value={durationMinutes}
        onChange={(e) => setDurationMinutes(e.target.value)}
        className="text-xl md:text-3xl text-black font-bold w-1/3 bg-white border border-gray-400 rounded-md p-2"
        placeholder="Minutes"
      />
      <input
        type="number"
        min="0"
        value={durationSeconds}
        onChange={(e) => setDurationSeconds(e.target.value)}
        className="text-xl md:text-3xl text-black font-bold w-1/3 bg-white border border-gray-400 rounded-md p-2"
        placeholder="Seconds"
      />
    </div>
  );
};

export default TimeInput;
