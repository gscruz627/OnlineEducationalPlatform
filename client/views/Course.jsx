import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import CommonSideBar from '../components/CommonSideBar'
import "../public/CourseAndSection.css"

const Course = () => {

    const {courseId} = useParams()

    const token = useSelector( (state) => state.token)
    const navigate = useNavigate();
    const [course, setCourse] = useState("");
    const [changeTitle, setChangeTitle] = useState("");
    const [changeCourseCode, setChangeCourseCode] = useState("");
    const [changeImageurl, setChangeImageUrl] = useState("");
    const [instructors, setInstructors] = useState(null);

    const loadCourseInfo = async() => {
        const request = await fetch(`https://localhost:7004/api/courses/${courseId}`, {
            method: "GET",
            headers: {
                "Authorization" : `Bearer ${token}`
            }
        })
        if (request.status === 404){
            navigate("/NotFound");
            return;
        }
        const response = await request.json();
        setCourse(response);
        setChangeTitle(response.title);
        setChangeCourseCode(response.courseCode);
        setChangeImageUrl(response.imageURL);
    }

    const loadInstructors = async () => {
        
    }

    useEffect( () => {
        loadCourseInfo();
        loadInstructors();
    }, [])

    const edit = async (e) => {
        e.preventDefault();
        if(changeTitle === course.title && changeCourseCode === course.courseCode && changeImageurl === course.imageURL){
            // These are all the same => No change is done.
            console.log(changeTitle);
            console.log(course.title)
            console.log("hello there")
            return;
        }
        const request = await fetch(`https://localhost:7004/api/courses/${courseId}`, {
            method: "PATCH",
            headers: {
                "Authorization" : `Bearer ${token}`,
                "Content-Type" : "application/json"
            },
            body: JSON.stringify({
                "title": changeTitle,
                "courseCode": changeCourseCode,
                "imageUrl" : changeImageurl
            })
        });
        const response = await request.json();
        setCourse(response);
        setChangeTitle(response.title);
        setChangeCourseCode(response.courseCode);
        setChangeImageUrl(response.imageURL);
        if(request.ok){
            alert("Changes were saved")
        }
    }
    return (
        <div className="context-menu">
        
        <CommonSideBar choice="section"/>
        <div>
            <h1>{course.title}</h1>
            <hr/>
            <p>In this section you can edit the course's title, course code and image. You can also edit the sections of this course, you can create, delete and edit those.
            <br/>You can use the help menu that will display a sub-menu below it for help in navigating.
            </p>
            <form onSubmit={(e) => edit(e)}>
                <h1>Edit Information</h1>
                <hr/>
                <div className="course-edit-form">
                    <div>
                        <label for="c_title">Title:</label><br/>
                        <input type="text" id="c_title" defaultValue={course.title} onChange={(e) => setChangeTitle(e.target.value)} value={changeTitle}/><br/>   
                    </div>
                    <div>
                        <label for="courseCode">Course Code:</label><br/>
                        <input type="text" id="courseCode" defaultValue={course.courseCode} onChange={(e) => setChangeCourseCode(e.target.value)} value={changeCourseCode}/><br/>
                    </div>
                    <div>
                        <label for="imageUrl">Course Image URL:</label><br/>
                        <input type="text" id="imageUrl" defaultValue={course.imageURL} onChange={(e) => setChangeImageUrl(e.target.value)} value={changeImageurl}/><br/><br/>
                        <img src={changeImageurl} className="common-image"/>
                        <br/>
                        <button type="submit" className='blue-button'>Save Changes</button>
                    </div>
                </div>
            </form>
            <div className="section-manager">
                <h1>Manage Course Sections</h1>
                <hr/>
            </div>
        </div>

        </div>
    )
}

export default Course