import React from "react";
import { useParams } from "react-router-dom";

const CameraPage = () => {
  const params = useParams();
  const { id } = params;

  if (!id) {
    return <div>Camera not found</div>;
  }
  return <div></div>;
};

export default CameraPage;
