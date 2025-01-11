import React, {useState, useEffect} from 'react'
import { useSelector } from 'react-redux'
import "../public/CourseAndSection.css"
import "../src/App.css"
import "../public/MyCourses.css"
import { useNavigate, useParams } from 'react-router-dom'

const CourseViewInstructor = () => {

    const {sectionId} = useParams();
    const [announcementTitle, setAnnouncementTitle] = useState("");
    const [announcementDescription, setAnnouncementDescription] = useState("");
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
    const createAnnouncement = async (e) => {
        e.preventDefault();
        const request = await fetch("https://localhost:7004/api/announcements", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "title" : announcementTitle,
                "description" : announcementDescription,
                "sectionId" : sectionId
            })
        });
        if (request.ok){
            const response = await request.json();
            setAnnouncements([...announcements, response])
            alert("Announcement was created!")
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
                        <li onClick={() => { navigate(`/course_view/instructor/${sectionId}`)}}>- Announcements</li>
                        <li onClick={() => { navigate(`/course_view/instructor/assignments/${sectionId}`)}}>- Assignments</li>
                        <li onClick={() => { navigate(`/course_view/instructor/student_list/${sectionId}`)}}>- Students</li>
                    </ul>
                </div>
            </div>
            <div>
                <h1>Announcements</h1>
                <hr/>
                <p>Here you can create and see announcements</p>
                <h2>Create a new announcement</h2>
                <hr/>
                <form onSubmit={(e) => createAnnouncement(e)}>
                    <label for="announcement_title">Title:</label><br/>
                    <input className='common-input' type="text" id="announcement_title" onChange={(e) => setAnnouncementTitle(e.target.value)} value={announcementTitle}></input><br/>

                    <label for="announcement_content">Description:</label><br/>
                    <textarea className='common-input' style={{width: "80%" }} id="announcement_content" onChange={(e) => setAnnouncementDescription(e.target.value)} value={announcementDescription}></textarea><br/>

                    <button type="submit" className='blue-button'>Create</button>
                </form>
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

export default CourseViewInstructor