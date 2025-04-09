import React from "react";

const NewAttendanceModal = ({
    setShowNewAttendanceModal,
    handleAttendanceSubmit,
    selectedDepartment,
    setSelectedDepartment,
    departments,
    currentFileName,
    setCurrentFileName
}) => {
  return (
    <section className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={() => setShowNewAttendanceModal(false)}
      />
      <div className="relative bg-white p-6 rounded-md w-11/12 max-w-md">
        <h2 className="text-lg font-bold mb-4 text-black">
          Create New Attendance
        </h2>
        <form onSubmit={handleAttendanceSubmit}>
          <label htmlFor="department" className="block text-black mb-2">
            Select Department
          </label>
          <select
            id="department"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full p-2 mb-4 bg-white border border-gray-400 rounded-md text-black outline-green-500"
          >
            {departments.map((dept, i) => (
              <option key={i} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <label htmlFor="fileName" className="block text-black mb-2">
            Enter File Name
          </label>
          <input
            id="fileName"
            type="text"
            value={currentFileName}
            onChange={(e) => setCurrentFileName(e.target.value)}
            className="w-full p-2 mb-4 bg-white border border-gray-400 rounded-md text-black outline-green-500"
          />

          <p className="mb-4 text-black">
            <strong>Generated File Name:</strong>{" "}
            {currentFileName && selectedDepartment
              ? `${currentFileName}-${selectedDepartment}`
              : "—"}
          </p>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              className="px-4 py-2 bg-gray-500 text-white rounded-md"
              onClick={() => setShowNewAttendanceModal(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md"
            >
              Add Attendance
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default NewAttendanceModal;
