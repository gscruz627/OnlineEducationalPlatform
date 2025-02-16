import React from "react";
import { Link } from "react-router-dom";

const LoggedOut = () => {
  return (
    <section className="font-formal" style={{ textAlign: "center" }}>
      <h1 className="color-gray" style={{ fontSize: "48px" }}>
        You logged out
      </h1>
      <p>Please login to access your courses.</p>
      <br />

      <Link to="/">Go To Home</Link>
      <br />
      <button
        style={{ margin: "2rem 0", textAlign: "center" }}
        className="blue-btn"
      >
        <Link to="/login">Sign In Here</Link>
      </button>
    </section>
  );
};

export default LoggedOut;
