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
    const [selectedInstructor, setSelectedInstructor] = useState("");
    const [newSectionCode, setNewSectionCode] = useState("");
    const [sections, setSections] = useState(null);

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
        const request = await fetch("https://localhost:7004/api/instructors", {
            method: "GET",
            headers: {
                "Authorization" : `Bearer ${token}`
            }
        });
        const response = await request.json();
        if(request.ok){
            setInstructors(response);
            setSelectedInstructor(response[0].id)
        }
    }

    useEffect( () => {
        loadCourseInfo();
        loadInstructors();
        loadSections();
    }, [])

    const loadSections = async () => {
        const request = await fetch(`https://localhost:7004/api/sections/course/${courseId}`, {
            method: "GET",
            headers: {
                "Authorization" : `Bearer ${token}`,
            }
        })
        const response = await request.json();
        if (request.ok){
            setSections(response)
        }
    }

    const edit = async (e) => {
        e.preventDefault();
        if(changeTitle === course.title && changeCourseCode === course.courseCode && changeImageurl === course.imageURL){
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
    const createSection = async (e) => {
        e.preventDefault();
        if(newSectionCode === "" || selectedInstructor === ""){
            console.log(selectedInstructor)
            return;
        }
        const request = await fetch("https://localhost:7004/api/sections", {
            method: "POST",
            headers: {
                "Authorization" : `Bearer ${token}`,
                "Content-Type" : "application/json"
            },
            body: JSON.stringify({
                "courseId" : courseId,
                "instructorId" : selectedInstructor,
                "sectionCode" : newSectionCode
            })
        })
        if (request.ok){
            const response = await request.json();
            setSections([...sections, response])
            setNewSectionCode("");
            alert("New Section was created!")
        } else if (request.status === 400){
            alert("Section already taken")
        }
    }
    const deleteCourse = async () => {
        const confirmed = confirm("Are you sure you want to delete this course? All of its sections, their enrollments and other content in each will be erased");
        if (!confirmed){
            return;
        }
        const request = await fetch(`https://localhost:7004/api/courses/${courseId}`, {
            method: "DELETE",
            headers: {
                "Authorization" : `Bearer ${token}`,
            }
        });
        if (request.ok){
            alert("Course was erased");
            navigate("/courses")
        }
    }
    return (
        <div className="context-menu">
        
            <CommonSideBar choice="course"/>
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
                            <button type="submit" className='blue-button'>Save Changes</button><br/><br/>
                            <button type="button" className='red-button' onClick={() => deleteCourse()}>Delete Course</button>
                        </div>
                    </div>
                </form>
                <div className="section-manager">
                    <h1>Manage Course Sections</h1>
                    <hr/>
                    <h3>New Section</h3>
                    <form onSubmit={(e) => createSection(e)}>
                        <div className="new-section">
                            <div>
                                <label for="s_code">Section Code: </label>
                                <input value={newSectionCode} onChange={(e) => setNewSectionCode(e.target.value)} type="number"></input>
                            </div>
                            <div>
                                <label for="s_instructors">Instructor: </label>
                                <select value={selectedInstructor} onChange={(e) => setSelectedInstructor(e.target.value)}>
                                    {instructors && instructors.map( (instructor) => (
                                        <option value={instructor.id} key={instructor.id}>{instructor.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <button type="submit" className="green-add-button">+</button>
                            </div> 
                        </div>
                    </form>
                    <hr/>

                    {sections && sections.map( (section) => (
                        <section className="section-line">
                            <h3 onClick={() => navigate(`/section/${section.id}`)}>{course.courseCode} - {section.sectionCode}</h3>
                            <p>By: {instructors && instructors.filter( (instructor) => instructor.id === section.instructorID)[0].name}</p>
                            {section.isActive ? 
                                <p style={{color:"green"}}>Active</p>
                                :
                                <p style={{color:"red"}}>Not Active</p>
                            }
                        </section>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Course