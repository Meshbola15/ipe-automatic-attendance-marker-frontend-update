// utils/database.js
export const databaseKeys = {
    ATTENDANCE: "attendance",
    STUDENTS: "students",
  };
  
  export const saveToDatabase = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
  };
  
  export const loadFromDatabase = (key) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  };
  