import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiAlertTriangle } from "react-icons/fi";

const ConfirmModal = ({ open, title, message, confirmLabel = "Confirm", confirmClass = "btn-danger", onConfirm, onCancel }) => {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 flex items-center justify-center z-[200] px-4">
          <motion.div
            key="backdrop"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />
          <motion.div
            key="modal"
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
                <FiAlertTriangle className="text-red-500" size={22} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">{title}</h2>
                {message && <p className="text-sm text-slate-500 mt-1 leading-relaxed">{message}</p>}
              </div>
              <div className="flex gap-3 w-full pt-1">
                <button onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
                <button onClick={onConfirm} className={`${confirmClass} flex-1`}>{confirmLabel}</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
