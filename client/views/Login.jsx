import React, {useState} from 'react'
import './styles/Auth.css'
import '../src/App.css'
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setEnrollments, setLogin } from '../store';

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginType, setLoginType] = useState("student");
  const [errorTriggered, setErrorTriggered] = useState(false);
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
    try{
      const request = await fetch("https://localhost:7004/api/students/login", {
        method: "POST",
        headers: { "Content-Type" : "application/json" },
        body: JSON.stringify({ "email" : email, "password" : password })
      })
      if (!request.ok) {
        setErrorTriggered(true);
        setTimeout(() =>  setErrorTriggered(false), 5000);
        return; // Stop execution if login fails
      }
      const response = await request.json();
      dispatch(setLogin({ user: response.student, token: response.token, role: "student" }));

      const enrollmentsRequest = await fetch(`https://localhost:7004/api/sections/enrollments/${response.student.id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${response.token}`
        }
      })

      const enrollmentsResponse = await enrollmentsRequest.json();
      const sectionIds = enrollmentsResponse.map( (e) => e.id);
      dispatch(setEnrollments({enrollments: sectionIds}))
      navigate("/");
    } catch (error) {
      setErrorTriggered(true);
      setTimeout(() => setErrorTriggered(false), 5000);
    }  
  }
  
  const loginInstructor = async () => {
    try{
      const request = await fetch("https://localhost:7004/api/instructors/login", {
        method: "POST",
        headers: { "Content-Type" : "application/json" },
        body: JSON.stringify({ "email" : email, "password" : password })
      })
      if (!request.ok) {
        setErrorTriggered(true);
        setTimeout(() =>  setErrorTriggered(false), 5000);
        return; // Stop execution if login fails
      }
      const response = await request.json();
      dispatch(setLogin({ user: response.instructor, token: response.token, role: "instructor" }));
      navigate("/");
    } catch (error) {
      setErrorTriggered(true);
      setTimeout(() => setErrorTriggered(false), 5000);
    }  
  }

  const loginAdministrator = async () => {
    try {
      const request = await fetch("https://localhost:7004/api/authority/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!request.ok) {
        setErrorTriggered(true);
        setTimeout(() =>  setErrorTriggered(false), 5000);
        return; // Stop execution if login fails
      }
  
      const response = await request.json();
      dispatch(setLogin({ user: response.admin, token: response.token, role: "admin" }));
      navigate("/");
    } catch (error) {
      setErrorTriggered(true);
      setTimeout(() => setErrorTriggered(false), 5000);
    }
  };
  

  return (
      <form style={{justifyContent: "center", margin: "auto auto"}} className="form-container" onSubmit={(e) => executeLogin(e)}>
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
        {errorTriggered && 
        <div className='error-box'>
          Credentials not Valid, User Not found
        </div>
        }
        { loginType == "admin" ? (
          <>
            <label htmlFor='username'>Username:</label>
            <input type="text" onChange={(e) => setUsername(e.target.value)} value={username}></input>
          </>
        ) : (
            <>
              <label htmlFor='email'>Email:</label>
              <input type="email" onChange={(e) => setEmail(e.target.value)} value={email}></input>
            </>
        )}

        <label htmlFor='password'>Password:</label>
        <input type="password" onChange={(e) => setPassword(e.target.value)} value={password}></input>

        <button style={{width:"75%"}} type='submit' className='blue-btn'>Login</button>
      </form>
  )
}

export default Login