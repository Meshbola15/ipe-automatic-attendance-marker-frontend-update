/* eslint-disable react-refresh/only-export-components */
import React, { useEffect, useState } from "react";
import { databaseKeys, loadFromDatabase } from "../utils/database";

export const LecturerContext = React.createContext();

const LecturerContextProvider = ({ children }) => {
  const [lecturerDetails, setLecturerDetails] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLecturer = async () => {
      setLoading(true);
      try {
        const stored = localStorage.getItem("lecturer");
        if (stored) {
          const parsed = JSON.parse(stored);
          const all = (await loadFromDatabase(databaseKeys.LECTURERS)) || [];
          const found = (Array.isArray(all) ? all : []).find((l) => l.id === parsed.id);
          if (found) setLecturerDetails(found);
        }
      } catch (e) {
        console.error("Error loading lecturer details", e);
      } finally {
        setLoading(false);
      }
    };
    fetchLecturer();
  }, []);

  return (
    <LecturerContext.Provider value={{ lecturerDetails, setLecturerDetails, loading, setLoading }}>
      {children}
    </LecturerContext.Provider>
  );
};

export const useLecturerContext = () => {
  const context = React.useContext(LecturerContext);
  if (!context) throw new Error("useLecturerContext must be used within a LecturerContextProvider");
  return context;
};

export { LecturerContextProvider };
