import React, {useState, useEffect} from 'react'
import { useSelector } from 'react-redux'
import "../public/CourseAndSection.css"
import "../src/App.css"
import "../public/MyCourses.css"
import { useNavigate, useParams } from 'react-router-dom'

const CourseViewStudent = () => {

    const {sectionId} = useParams();
    const [announcements, setAnnouncements] = useState(null);

    const navigate = useNavigate();
    const token = useSelector( (state) => state.token)
    
    const loadAnnouncements = async () => {
        const request = await fetch(`https://localhost:7004/api/announcements/section/${sectionId}`, {
            method: "GET",
            headers: {
                "Authorization" : `Bearer ${token}`
            }
        });
        if(request.ok){
            const response = await request.json();
            setAnnouncements(response)
        }
    }
    

    useEffect( () => {
        loadAnnouncements();
    }, [])
    return (
        <div className='context-menu'>
            <div className="side-bar">
                <h2 style={{display: "inline-block", paddingButtom: "10px"}}>&#128270; Navigate </h2>
                <div className="side-bar-item">
                    <ul>
                        <li onClick={() => { navigate(`/course_view/student/${sectionId}`)}}>- Announcements</li>
                        <li onClick={() => { navigate(`/course_view/student/assignments/${sectionId}`)}}>- Assignments</li>
                        <li onClick={() => { navigate(`/course_view/instructor/student_list/${sectionId}`)}}>- Students</li>
                    </ul>
                </div>
            </div>
            <div>
                <h1>Announcements</h1>
                <hr/>
                <p>Here you can see announcements</p>
                
                <h2>List of Announcements</h2>
                <hr/>
                {announcements && announcements.map( (announcement) => (
                    <div className='announcement-box'>
                        <h3>{announcement.title}</h3>
                        <p>{announcement.description}</p>    
                        <hr/>
                    </div>
                ))}

            </div>
        </div>
    )
}

export default CourseViewStudent