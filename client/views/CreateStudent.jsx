import React, { useState } from 'react'
import "../src/App.css"
import "../public/auth.css"
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import CommonSideBar from '../components/CommonSideBar'

const CreateStudent = () => {
    const [studentName, setStudentName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const token = useSelector( (state) => state.token);
    const navigate = useNavigate();

    const executeCreate = async (e) => {
        e.preventDefault();
        if ( (studentName === "") || (email === "") || (password === "")){
            alert("Must have filled all fields");
            return;
        }
        const request = await fetch("https://localhost:7004/api/students/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization" : `Bearer ${token}`
            },
            body: JSON.stringify({
                "email": email,
                "name" : studentName,
                "password": password,
            })
        });
        if(request.ok){
            alert("Student was created!")
            navigate("/students")
        }

    }
    return (
        <div className="context-menu">
        <CommonSideBar choice="student" />
        <div className="form-container">
            <form onSubmit={(e) => executeCreate(e)}>
                <h1>New Student</h1>
                <label htmlFor="s_name">Name: </label><br/>
                <input id="s_name" type="text" onChange={(e) => setStudentName(e.target.value)} value={studentName}/><br/><br/>
                
                <label htmlFor="email">Email: </label><br/>
                <input id="email" type="text" onChange={(e) => setEmail(e.target.value)} value={email}/><br/><br/>
                
                <label htmlFor="password">Password: </label><br/>
                <input id="password" type="password" onChange={(e) => setPassword(e.target.value)} value={password} />

                <button className="blue-button" type="submit">Create</button>
            </form>
        </div>
        </div>
    )
}

export default CreateStudent;