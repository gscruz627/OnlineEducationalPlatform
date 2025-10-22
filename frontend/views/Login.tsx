import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import state from "../store";
import Loading from "../components/Loading";
import type { CustomJwtPayload } from "../sources";
import "./styles/Auth.css";
import "../src/App.css";

function Login(){

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginType, setLoginType] = useState("student");
  const [error, setError] = useState<string>("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState<boolean>(false);

  const SERVER_URL = import.meta.env["VITE_SERVER_URL"];

  async function login(e: React.FormEvent){
    setLoading(true);
    e.preventDefault();
    try{
      const request = await fetch(`${SERVER_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type" : "application/json"},
        body: JSON.stringify({email: email, password: password, username: username, role: loginType})
      });
      const tokens = await request.json();

      if(!request.ok){
        setError(tokens);
        return;
      }
      const contents = jwtDecode<CustomJwtPayload>(tokens.accessToken);
      const usernameResponse = contents["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
      const userId = contents["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
      const emailResponse = contents["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];
      const role = contents["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
      const expiryTime = contents.exp;
            
      // Change on Valtio for this session.
      state.user = {
        userId: userId,
        username: usernameResponse,
        email: emailResponse,
        role
      }
      state.token = tokens.accessToken;
      state.refreshToken = tokens.refreshToken;
      state.expiry = String(expiryTime);

      // Change on Local Storage for persistance.
      localStorage.setItem("access-token", tokens.accessToken);
      localStorage.setItem("refresh-token", tokens.refreshToken);
      localStorage.setItem("expiry", String(expiryTime)!);
      localStorage.setItem("user", JSON.stringify({ userId, username: usernameResponse, email: emailResponse, role}));

    } catch(err: unknown){
      setError("Something went wrong: " + err);
      return;
    } finally {
      setLoading(false);
    }
  }
  return (
    <>
    {loading && <Loading/> }
    <form
      style={{ justifyContent: "center", margin: "auto auto" }}
      className="form-container"
      onSubmit={(e) => login(e)}
      >
      <h1>Login</h1>

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
        <div className="error-box">Credentials not Valid, User Not found</div>
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
        Login
      </button>

      <small>Demo Login Information: <br/> 
        For Administators: admin, pw: demodemodemo
        For Student: Student1@company.com, pw: demodemodemo
        For Instructor: Instructor1@company.com, pw: demodemodemo
      </small>
    </form>
  </>
  );
};

export default Login;
