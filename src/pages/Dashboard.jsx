// src/pages/Dashboard.jsx
import { useState, useEffect,  } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
// import useSound from "use-sound";
// import successSound from "../assets/sound.mp3";
import { loadFromDatabase, databaseKeys } from "../utils/database";
import { FaUser } from "react-icons/fa6";

const Dashboard = () => {
  // const [play] = useSound(successSound);
  const [attendanceLists, setAttendanceLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);

  useEffect(() => {
    const getAttendanceLists = async () => {
      await loadFromDatabase(databaseKeys.ATTENDANCE).then((data) => {
        setAttendanceLists(data);
      });
    };

    getAttendanceLists();
  }, []);

  return (
    <div className="w-full">
      {selectedList ? (
        <div className="min-h-screen bg-purple-50 p-4 py-8 md:p-8 flex flex-col items-center">
          {/* Recent Entries Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-6 mt-6"
          >
            <h2 className="text-purple-600 text-xl font-bold mb-4 text-center">
              Recent Entries ({selectedList?.fileName})
            </h2>
            <div className="space-y-4">
              {selectedList?.attendees?.length > 0 ? (
                selectedList?.attendees?.map((entry, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex justify-between items-center bg-purple-100 p-3 rounded-lg shadow-sm"
                  >
                    <span className="font-medium text-purple-700">
                      {entry?.name}
                    </span>
                    <span className="text-gray-600 text-sm">
                      {entry?.matricNo}
                    </span>
                    <span className="text-gray-500 text-sm">{entry?.time}</span>
                  </motion.div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-6">
                  No recent entries detected yet
                </div>
              )}
            </div>
          </motion.div>

          {/* Simulate Detection Button */}

          <div className="flex flex-col flex-grow justify-center mt-[4rem] items-center gap-4">
            <h3 className="text-lg font-semibold">Select Attendance List</h3>
            <div className="p-2 border-2 flex flex-col gap-4 rounded-md border-purple-600">
              {attendanceLists.map((list, index) => (
                <div
                  onClick={() => {
                    setSelectedList(list);
                    // scroller.scrollTo('dashboard', {
                    //   smooth: true,
                    //   offset: -100
                    // })
                  }}
                  key={index}
                  className="w-full p-4 bg-gray-100 rounded-md cursor-pointer flex gap-8 font-medium justify-between"
                >
                  <p>{list?.fileName}</p>
                  <p className="flex items-center gap-2">
                    {list?.attendees?.length}{" "}
                    <FaUser className="text-purple-600" />
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col flex-grow justify-center items-center gap-4">
          <h3 className="text-lg font-semibold">Select Attendance List</h3>
          {!attendanceLists || attendanceLists?.length === 0 ? (
            <div>Login as admin to create a list</div>
          ) : (
            <div className="p-2 border-2 flex flex-col gap-4 rounded-md border-purple-600">
              {attendanceLists.map((list, index) => (
                <div
                  onClick={() => {
                    setSelectedList(list);
                    // scroller.scrollTo('dashboard', {
                    //   smooth: true,
                    //   offset: -100
                    // })
                  }}
                  key={index}
                  className="w-full p-4 bg-gray-100 rounded-md cursor-pointer flex gap-8 font-medium justify-between"
                >
                  <p>{list?.fileName}</p>
                  <p className="flex items-center gap-2">
                    {list?.attendees?.length}{" "}
                    <FaUser className="text-purple-600" />
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
