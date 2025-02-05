import React, { useState } from 'react'
import "../src/App.css"
import "../public/auth.css"
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import CommonSideBar from '../components/CommonSideBar'

const CreateInstructor = () => {
    const [instructorName, setInstructorName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const token = useSelector( (state) => state.token);
    const navigate = useNavigate();

    const executeCreate = async (e) => {
        e.preventDefault();
        if ( (instructorName === "") || (email === "") || (password === "")){
            alert("Must have filled all fields");
            return;
        }
        const request = await fetch("https://localhost:7004/api/instructors/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization" : `Bearer ${token}`
            },
            body: JSON.stringify({
                "email": email,
                "name" : instructorName,
                "password": password,
            })
        });
        if(request.ok){
            alert("Instructor was created!")
            navigate("/instructors")
        }

    }
    return (
        <div className="context-menu">
        <CommonSideBar choice="instructor" />
        <div className="form-container">
            <form onSubmit={(e) => executeCreate(e)}>
                <h1>New Instructor</h1>
                <label for="i_name">Name: </label><br/>
                <input id="i_name" type="text" onChange={(e) => setInstructorName(e.target.value)} value={instructorName}/><br/><br/>
                
                <label for="email">Email: </label><br/>
                <input id="email" type="text" onChange={(e) => setEmail(e.target.value)} value={email}/><br/><br/>
                
                <label for="password">Password: </label><br/>
                <input id="password" type="password" onChange={(e) => setPassword(e.target.value)} value={password} />

                <button className="blue-button" type="submit">Create</button>
            </form>
        </div>
        </div>
    )
}

export default CreateInstructor