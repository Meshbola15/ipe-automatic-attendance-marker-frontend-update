// utils/crypto.js
import CryptoJS from "crypto-js";

const SECRET_KEY = "super-secret-key"; // 🔐 Keep this safe

export const encrypt = (text) => {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};


export const decrypt = (cipherText) => {
  const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};
