import React from "react";

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/60 z-[30000] backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-violet-300/30 border-t-violet-400 animate-spin" />
        <p className="text-white text-sm font-medium tracking-wide">Please wait…</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
