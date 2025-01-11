import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux';

const StudentList = () => {
    const { sectionId } = useParams();
    const [students, setStudents] = useState(null);
    const token = useSelector( (state) => state.token);
    const navigate = useNavigate();

    const loadStudentsEnrolled = async () => {
        const request = await fetch(`https://localhost:7004/api/sections/students/${sectionId}`, {
            method: "GET",
            headers: {
                "Authorization" : `Bearer ${token}`
            }
        })
        if(request.ok){
            const response = await request.json();
            setStudents(response)
        }     
    }
    useEffect( () => {
        loadStudentsEnrolled();
    }, [])
    return (
        <div className='context-menu'>
            <div className="side-bar">
                <h2 style={{display: "inline-block", paddingButtom: "10px"}}>&#128270; Navigate </h2>
                <div className="side-bar-item">
                    <ul>
                        <li onClick={() => { navigate(`/course_view/instructor/${sectionId}`)}}>- Announcements</li>
                        <li onClick={() => { navigate(`/course_view/instructor/assignments/${sectionId}`)}}>- Assignments</li>
                        <li onClick={() => { navigate(`/course_view/instructor/student_list/${sectionId}`)}}>- Students</li>
                    </ul>
                </div>
            </div>
            <div>
                <h1>Students Enrolled</h1>
                <hr/>
                { students && students.map( (student) => (
                <div style={{marginRight: "5%", display: "flex", justifyContent: "space-between"}}>
                    <p>{student.name}</p>
                    <p>{student.email}</p>
                </div>  
                ))}
            </div>
        </div>
    )
}

export default StudentList