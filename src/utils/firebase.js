// src/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Replace with your actual Firebase config from the console
const firebaseConfig = {
    apiKey: "AIzaSyB5B9lwOyASy109YQk-MPAGPNKEDmIqNwI",
    authDomain: "aipes-database.firebaseapp.com",
    databaseURL: "https://aipes-database-default-rtdb.firebaseio.com",
    projectId: "aipes-database",
    storageBucket: "aipes-database.firebasestorage.app",
    messagingSenderId: "87419525654",
    appId: "1:87419525654:web:e67f789d37a87e0f867337",
    measurementId: "G-2P4F32QE58"
};


const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export default db;
