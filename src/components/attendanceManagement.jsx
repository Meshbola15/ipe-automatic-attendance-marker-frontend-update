import React from "react";
import { FiDownload, FiPlus } from "react-icons/fi";

const AttendanceManagement = ({
  sortedAttendance,
  setShowNewAttendanceModal,
  toggleOpen,
  openAttendance,
  handleExportAttendance,

  saving,

  handleStudentStatusChange,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 w-full">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-black">Attendance Management</h2>
        <button
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md text-white"
          onClick={() => setShowNewAttendanceModal(true)}
        >
          <FiPlus />
          {/* <span>New Attendance</span> */}
        </button>
      </div>
      <div className="mt-4">
        <h2 className="text-lg font-bold text-black mb-4">Attendance List</h2>
        <div className="space-y-4">
          {sortedAttendance.map((attendance, index) => {
            const presentCount = attendance?.attendees?.filter(
              (attendee) => attendee.status === "Present"
            )?.length;
            const totalCount = attendance?.attendees?.length;

            return (
              <div
                key={index}
                className="p-4 bg-white rounded-md text-black shadow-sm"
              >
                {/* Dropdown Header */}
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleOpen(attendance.fileName)}
                >
                  <div className="flex flex-col">
                    <span className="font-medium flex items-center gap-1 ">
                      File:{" "}
                      <span className="truncate w-48 inline-block text-cyan-600">
                        {attendance.fileName || "Untitled"}
                      </span>
                    </span>
                    {totalCount > 0 && (
                      <span className="text-sm text-gray-600">
                        {presentCount}/{totalCount} Present
                      </span>
                    )}
                  </div>
                  <button
                    className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExportAttendance(index);
                    }}
                    disabled={saving}
                    title="Export Attendance"
                  >
                    <FiDownload />
                  </button>
                </div>

                {/* Dropdown Content: Attendee Details */}
                {openAttendance[attendance.fileName] && (
                  <div className="mt-4">
                    {attendance.attendees && attendance.attendees.length > 0 ? (
                      <table className="min-w-full">
                        <thead>
                          <tr className="text-left">
                            <th className="p-2">Name</th>
                            <th className="p-2">Matric No</th>
                            <th className="p-2">Status</th>
                            <th className="p-2">Edit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attendance.attendees.map((student, sIdx) => (
                            <tr key={sIdx} className="hover:bg-gray-100">
                              <td className="p-2">{student.name}</td>
                              <td className="p-2">{student.matricNo}</td>
                              <td className="p-2">{student.status}</td>
                              <td className="p-2">
                                <select
                                  value={student.status}
                                  onChange={(e) =>
                                    handleStudentStatusChange(
                                      attendance,
                                      sIdx,
                                      e.target.value
                                    )
                                  }
                                  className="p-1 rounded-md"
                                >
                                  <option value="Present">Present</option>
                                  <option value="Absent">Absent</option>
                                  <option value="Late">Late</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-gray-600">No attendees recorded.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AttendanceManagement;
