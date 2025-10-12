import React, { useState, useEffect } from "react";
import "./styles/Auth.css";
import "../src/App.css";
import { useNavigate } from "react-router-dom";


const Register = () => {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [loginType, setLoginType] = useState("student");
  const [error, setError] = useState<string>("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const SERVER_URL = import.meta.env["VITE_SERVER_URL"];

  async function register(e: React.FormEvent){
    e.preventDefault();
    try{
      const request = await fetch(`${SERVER_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type" : "application/json"},
        body: JSON.stringify({email: email, password: password, name: username, role: loginType})
      });
      if(!request.ok){
        const response = await request.json();
        if (typeof response === "object" && response !== null) {
          setError("Something went wrong");
        } else {
          setError(response as string);
        }
        return;
      }
      navigate("/login");
    } catch(err: unknown){
      setError("Something went wrong: " + err);
      return;
    }
  }
  useEffect( () => {

  }, [email, username, password, passwordCheck])
  return (
    <form
      style={{ justifyContent: "center", margin: "auto auto" }}
      className="form-container"
      onSubmit={(e) => register(e)}
    >
      <h1>Register</h1>

      <div className="form-tab-slide">
        <ul>
          {loginType == "student" ? (
            <li className="selected-choice">Student</li>
          ) : (
            <li onClick={() => setLoginType("student")}>Student</li>
          )}
          {loginType == "instructor" ? (
            <li className="selected-choice">Instructor</li>
          ) : (
            <li onClick={() => setLoginType("instructor")}>Instructor</li>
          )}
          {loginType == "admin" ? (
            <li className="selected-choice">Admin</li>
          ) : (
            <li onClick={() => setLoginType("admin")}>Admin</li>
          )}
        </ul>
      </div>
      {error && (
        <div className="error-box">Error: {error}</div>
      )}
      {loginType == "admin" ? (
        <>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            onChange={(e) => setUsername(e.target.value)}
            value={username}
          ></input>
        </>
      ) : (
        <>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          ></input>
        </>
      )}

      <label htmlFor="password">Password:</label>
      <input
        type="password"
        onChange={(e) => setPassword(e.target.value)}
        value={password}
      ></input>

      <button style={{ width: "75%" }} type="submit" className="blue-btn">
        Register
      </button>

    </form>
  );
};

export default Register;
