import { ref, get, child, set } from "firebase/database";
import db from "./firebase";

export const databaseKeys = {
  ATTENDANCE: "attendance",
  STUDENTS: "students",
  DEPARTMENTS: "departments",
  ADMIN: "admin",
  LAST_CAMERA_ACTIVE_TIMESTAMP: "lastCameraActiveTimestamp",
  COURSES: "courses",
};

// 🔐 Save to DB with merge behavior for objects and replacement for arrays
export const saveToDatabase = async (key, newData) => {
  if (!key || !newData) {
    console.error("Missing key or newData for saveToDatabase");
    return;
  }

  try {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, key));
    const existingData = snapshot.exists() ? snapshot.val() : null;

    // 🔁 If data is array-based (legacy), merge by ID
    if (Array.isArray(existingData)) {
      const index = existingData.findIndex((item) => item.id === newData.id);
      if (index >= 0) {
        existingData[index] = newData;
      } else {
        existingData.push(newData);
      }
      await set(child(dbRef, key), existingData);
    } else if (newData.id) {
      // 🧱 Object-based storage (e.g., ADMIN)
      await set(child(dbRef, `${key}/${newData.id}`), newData);
    } else {
      // 🧼 Just replace the whole key (fallback)
      await set(child(dbRef, key), newData);
    }

    console.log("✅ Data saved to", key);
  } catch (error) {
    console.error("❌ Error saving to database:", error);
  }
};

// 🧲 Load data (optionally by ID)
export const loadFromDatabase = async (key, userId = null) => {
  try {
    const dbRef = ref(db);
    const path = userId ? `${key}/${userId}` : key;
    const snapshot = await get(child(dbRef, path));

    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      console.log("⚠️ No data found at", path);
      return null;
    }
  } catch (error) {
    console.error("❌ Error loading data:", error);
    return null;
  }
};

// 🗑 Delete by ID
export const deleteFromDatabase = async (key, id) => {
  try {
    await set(child(ref(db), `${key}/${id}`), null);
    console.log(`🗑 Deleted entry with id '${id}' from '${key}'`);
  } catch (error) {
    console.error("❌ Error deleting from database:", error);
  }
};

// 🛠 Update and merge object data (not array-based)
export const updateInDatabase = async (key, id, newData) => {
  if (!id || !newData) {
    console.error("Missing ID or data for update.");
    return;
  }

  try {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, `${key}/${id}`));
    const existingData = snapshot.exists() ? snapshot.val() : {};

    const updatedData = {
      ...existingData,
      ...newData,
    };

    await set(child(dbRef, `${key}/${id}`), updatedData);
    console.log(`🔄 Updated '${key}/${id}'`);
  } catch (error) {
    console.error("❌ Error updating in database:", error);
  }
};

export const findItemById = async (key, id) => {
  if (!key || !id) {
    console.error("Missing key or id for findItemById");
    return null;
  }

  try {
    const data = await loadFromDatabase(key);

    // If object (e.g., { id1: {..}, id2: {..} })
    // if (typeof data === "object" && !Array.isArray(data)) {
    return data[id] || null;
    // }

    // If array (e.g., [ { id: "123", ... }, ... ])
    // if (Array.isArray(data)) {
    //   return data.find((item) => item.id === id) || null;
    // }

  //  
  } catch (error) {
    console.error("❌ Error in findItemById:", error);
    return null;
  }
};
