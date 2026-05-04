import React, { useState } from "react";
import { FiX, FiCalendar } from "react-icons/fi";
import ConfirmModal from "./ConfirmModal";

const NewAttendanceModal = ({
  setShowNewAttendanceModal,
  handleAttendanceSubmit,
  selectedDepartment,
  setSelectedDepartment,
  departments,
  levels,
  selectedLevel,
  setSelectedLevel,
  currentFileName,
  setCurrentFileName,
  sessionDuration,
  setSessionDuration,
  isScoped,
}) => {
  const [showDiscard, setShowDiscard] = useState(false);

  const requestClose = () => setShowDiscard(true);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={requestClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <FiCalendar className="text-emerald-600" size={17} />
            </div>
            <h2 className="text-base font-bold text-slate-800">New Attendance Session</h2>
          </div>
          <button
            type="button"
            onClick={requestClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleAttendanceSubmit} className="px-6 py-5 space-y-4">
          {isScoped ? (
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Department</label>
                <div className="input bg-slate-50 text-slate-600 cursor-not-allowed flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-violet-400 flex-shrink-0" />
                  {selectedDepartment}
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Level</label>
                <div className="input bg-slate-50 text-slate-600 cursor-not-allowed flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                  {selectedLevel}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Department
                </label>
                <select
                  id="department"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="input"
                >
                  <option value="">Select a department</option>
                  {departments.map((dept, i) => (
                    <option key={i} value={dept?.name}>{dept?.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="level" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Level
                </label>
                <select
                  id="level"
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="input"
                >
                  <option value="">Select a level</option>
                  {(levels || []).map((lvl, i) => (
                    <option key={i} value={lvl?.name}>{lvl?.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label htmlFor="fileName" className="block text-sm font-medium text-slate-700 mb-1.5">
              Session Name
            </label>
            <input
              id="fileName"
              type="text"
              value={currentFileName}
              onChange={(e) => setCurrentFileName(e.target.value)}
              placeholder="e.g. MTH101 Lecture"
              className="input"
            />
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-slate-700 mb-1.5">
              Session Duration (minutes)
            </label>
            <input
              id="duration"
              type="number"
              min="1"
              value={sessionDuration}
              onChange={(e) => setSessionDuration(e.target.value)}
              placeholder="e.g. 60"
              className="input"
            />
            <p className="text-xs text-slate-400 mt-1">Leave blank for no automatic close</p>
          </div>

          {currentFileName && selectedDepartment && selectedLevel && (
            <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
              <p className="text-xs text-slate-500 mb-0.5">Generated file name</p>
              <p className="text-sm font-semibold text-violet-700 truncate">
                {currentFileName}-{new Date().toLocaleDateString()}-{selectedDepartment}-{selectedLevel}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              className="btn-secondary flex-1"
              onClick={requestClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn-success flex-1">
              Create Session
            </button>
          </div>
        </form>
      </div>
      <ConfirmModal
        open={showDiscard}
        title="Discard Session?"
        message="Your changes will be lost. Are you sure you want to cancel?"
        confirmLabel="Discard"
        confirmClass="btn-danger"
        onConfirm={() => { setShowDiscard(false); setShowNewAttendanceModal(false); }}
        onCancel={() => setShowDiscard(false)}
      />
    </div>
  );
};

export default NewAttendanceModal;
