import React from "react";
import { RiLoaderFill } from "react-icons/ri";

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[30000] backdrop-blur-md min-h-screen min-w-screen">
      <RiLoaderFill className="animate-spin text-4xl" />
    </div>
  );
};

export default LoadingScreen;
