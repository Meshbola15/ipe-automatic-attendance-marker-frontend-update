// utils/database.js
import { ref, get, child, set } from "firebase/database";
import db from "./firebase";

export const databaseKeys = {
  ATTENDANCE: "attendance",
  STUDENTS: "students",
  DEPARTMENTS: "departments",
};

export const saveToDatabase = async (key, newData) => {
  if (key && newData) {
    console.log(key,newData)
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, key));

    let dataArray = [];

    if (snapshot.exists()) {
      dataArray = snapshot.val();
      if (!Array.isArray(dataArray)) {
        dataArray = [];
      }
    }

    const existingIndex = dataArray.findIndex(item => item.id === newData.id);

    if (existingIndex >= 0) {
      dataArray[existingIndex] = newData; // update
    } else {
      dataArray.push(newData); // insert
    }

    await set(child(dbRef, key), dataArray); // set to the correct key!
    console.log('Saved successfully!');
  }

  else if (key) {
    set(ref(db, `${key}/`), newData);
  }
};

export const loadFromDatabase = async (key) => {
  const dbRef = ref(db);
  try {
    const snapshot = await get(child(dbRef, key));
    if (snapshot.exists()) {
      console.log(snapshot.val())
      return snapshot.val();
    } else {
      console.log("No data available");
    }
  } catch (error) {
    console.error(error);
  }
};
