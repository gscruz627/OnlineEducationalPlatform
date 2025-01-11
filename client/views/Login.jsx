import React, {useState} from 'react'
import '../public/Auth.css'
import '../src/App.css'
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setLogin } from '../store';
import { jwtDecode}  from "jwt-decode";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginType, setLoginType] = useState("student");
  const [email, setEmail] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const executeLogin = async (e) => {
    e.preventDefault();
    if (loginType === "admin"){
      if (username !== "" && password !== ""){
        await loginAdministrator();
      }
    }
    if (loginType === "student"){
      if (email !== "" && password !== ""){
        await loginStudent();
      }
    }
    if (loginType === "instructor"){
      if (email !== "" && password !== ""){
        await loginInstructor();
      }
    }
  }
  const loginStudent = async () => {
      const request = await fetch("https://localhost:7004/api/students/login", {
        method: "POST",
        headers: {
          "Content-Type" : "application/json"
        },
        body: JSON.stringify({
          "email" : email,
          "password" : password
        })
      })
      const response = await request.json();
      if (request.ok){
        dispatch(setLogin({user:response.student, token: response.token, role: "student"}))
        navigate("/");
      }
  }
  
  const loginInstructor = async () => {
    const request = await fetch("https://localhost:7004/api/instructors/login", {
      method: "POST",
      headers: {
        "Content-Type" : "application/json"
      },
      body: JSON.stringify({
        "email" : email,
        "password" : password
      })
    })
    const response = await request.json();
    if (request.ok){
      dispatch(setLogin({user:response.instructor, token: response.token, role: "instructor"}))
      navigate("/");
    }
  }

  const loginAdministrator = async () => {
      const request = await fetch( "https://localhost:7004/api/authority/login", {
        method: "POST",
        headers: {
          "Content-Type" : "application/json",
        },
        body: JSON.stringify({
          "username":username,
          "password":password
        })
      })
      const response = await request.json()
      if(request.ok){
        dispatch( setLogin({user: response.admin, token: response.token, role: 'admin'}))
        navigate("/")
      }
  }

  return (
    <div className='form-container'>
      <form onSubmit={(e) => executeLogin(e)}>
        <h1>Login</h1>
        <div className='form-tab-slide'>
          <ul>
            { (loginType == "student") ? (
              <li className='selected-choice'>Student</li>
            ) : (
              <li onClick={() => setLoginType("student")}>Student</li>
            )}
            { (loginType == "instructor") ? (
              <li className='selected-choice'>Instructor</li>
            ) : (
              <li onClick={() => setLoginType("instructor")}>Instructor</li>
            )}            
            { (loginType == "admin") ? (
              <li className='selected-choice'>Admin</li>
            ) : (
              <li onClick={() => setLoginType("admin")}>Admin</li>
            )}
          </ul>
        </div>
        { loginType == "admin" ? (
          <>
            <label for='username'>Username:</label><br/>
            <input type="text" onChange={(e) => setUsername(e.target.value)} value={username}></input>
          </>
        ) : (
            <>
              <label for='email'>Email:</label><br/>
              <input type="email" onChange={(e) => setEmail(e.target.value)} value={email}></input>
            </>
        )}
        
        <br/>
        <br/>

        <label for='password'>Password:</label><br/>
        <input type="password" onChange={(e) => setPassword(e.target.value)} value={password}></input>

        <button type='submit' className='blue-button'>Login</button>
      </form>
      
    </div>
  )
}

export default Login