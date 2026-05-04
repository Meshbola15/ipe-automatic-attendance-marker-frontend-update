import React, { useEffect, useState } from "react";
import { useAdminContext } from "../context/adminContext";

const TimeInput = () => {
  const [durationHours, setDurationHours] = useState("02");
  const [durationMinutes, setDurationMinutes] = useState("00");
  const [durationSeconds, setDurationSeconds] = useState("00");
  const { setCameraTimeString } = useAdminContext();

  useEffect(() => {
    const formattedHours = String(durationHours).padStart(2, "0");
    const formattedMinutes = String(durationMinutes).padStart(2, "0");
    const formattedSeconds = String(durationSeconds).padStart(2, "0");
    setCameraTimeString(`${formattedHours}:${formattedMinutes}:${formattedSeconds}`);
  }, [durationHours, durationMinutes, durationSeconds]);

  const fieldClass = "input text-center text-xl font-bold !px-2 !py-2.5 w-full tabular-nums";

  return (
    <div className="flex items-end gap-2 w-full">
      <div className="flex-1">
        <p className="text-xs text-slate-500 text-center mb-1">HH</p>
        <input
          type="number"
          min="0"
          value={durationHours}
          onChange={(e) => setDurationHours(e.target.value)}
          className={fieldClass}
        />
      </div>
      <span className="text-xl font-bold text-slate-400 pb-2.5">:</span>
      <div className="flex-1">
        <p className="text-xs text-slate-500 text-center mb-1">MM</p>
        <input
          type="number"
          min="0"
          max="59"
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(e.target.value)}
          className={fieldClass}
        />
      </div>
      <span className="text-xl font-bold text-slate-400 pb-2.5">:</span>
      <div className="flex-1">
        <p className="text-xs text-slate-500 text-center mb-1">SS</p>
        <input
          type="number"
          min="0"
          max="59"
          value={durationSeconds}
          onChange={(e) => setDurationSeconds(e.target.value)}
          className={fieldClass}
        />
      </div>
    </div>
  );
};

export default TimeInput;
