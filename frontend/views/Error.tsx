import React from "react";

const Error = () => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "48px",
        height: "min(750px, 100vh)",
      }}
    >
      :( Sorry, this page does not exist (Error 404)
    </div>
  );
};

export default Error;
