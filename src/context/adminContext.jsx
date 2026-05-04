/* eslint-disable react-refresh/only-export-components */
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  databaseKeys,
  findItemById,
} from "../utils/database";

export const AdminContext = React.createContext();

const AdminContextProvider = ({ children }) => {
  const [adminDetails, setAdminDetails] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAdmin = async () => {
      setLoading(true);
      try {
        const stored = localStorage.getItem("admin");
        if (stored) {
          setAdminDetails(
            await findItemById(databaseKeys.ADMIN, JSON.parse(stored)?.id)
          );
        }
      } catch (e) {
        toast.error("Error fetching admin details");
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
  }, []);


  return (
    <AdminContext.Provider
      value={{
        adminDetails,
        setAdminDetails,
        loading,
        setLoading,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminContext = () => {
  const context = React.useContext(AdminContext);
  if (!context) {
    throw new Error(
      "useAdminContext must be used within an AdminContextProvider"
    );
  }
  return context;
};

export { AdminContextProvider };
