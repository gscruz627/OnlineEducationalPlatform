import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import CommonSideBar from '../components/CommonSideBar'
import "../public/Instructors.css"
import "../public/CourseAndSection.css"

const Section = () => {

    const {sectionId} = useParams()

    const token = useSelector( (state) => state.token)
    const navigate = useNavigate();
    const [course, setCourse] = useState("");
    const [section, setSection] = useState("");
    const [changeSectionCode, setChangeSectionCode] = useState("");
    const [changeInstructorId, setChangeInstructorId] = useState("");
    const [students, setStudents] = useState("");
    const [instructors, setInstructors] = useState(null);

    const loadSectionInfo = async() => {
        const request = await fetch(`https://localhost:7004/api/sections/${sectionId}`, {
            method: "GET",
            headers: {
                "Authorization" : `Bearer ${token}`
            }
        })
        if (request.status === 404){
            console.log(request.status)
            navigate("/NotFound");
            return;
        }
        const response = await request.json();
        setSection(response);
        setChangeSectionCode(response.sectionCode);
        setChangeInstructorId(response.instructorID);
        const courseRequest = await fetch(`https://localhost:7004/api/courses/${response.courseID}`, {
            method: "GET",
            headers: {
                "Authorization" : `Bearer ${token}`
            }
        });
        if (courseRequest.ok){
            const courseResponse = await courseRequest.json();
            setCourse(courseResponse);
        }

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
        }
    }

    useEffect( () => {
        loadSectionInfo();
        loadInstructors();
        loadStudents();
    }, [])

    useEffect( () => {
        setChangeInstructorId(section.InstructorID)
    }, [section])

    const loadStudents = async () => {
        const request = await fetch(`https://localhost:7004/api/sections/students/${sectionId}`, {
            method: "GET",
            headers: {
                "Authorization" : `Bearer ${token}`,
            }
        })
        const response = await request.json();
        if (request.ok){
            setStudents(response)
        }
    }

    const edit = async (e) => {
        e.preventDefault();
        if(changeSectionCode === section.sectionCode && changeInstructorId === section.InstructorID){
            return;
        }
        const request = await fetch(`https://localhost:7004/api/sections/${sectionId}`, {
            method: "PATCH",
            headers: {
                "Authorization" : `Bearer ${token}`,
                "Content-Type" : "application/json"
            },
            body: JSON.stringify({
                "sectionCode" : changeSectionCode,
                "instructorId" : changeInstructorId,
                "courseId" : section.courseID
            })
        });
        if (request.ok){
            const response = await request.json();
            setSection(response);
            setChangeSectionCode(response.sectionCode);
            setChangeInstructorId(response.instructorID);
            alert("Changes were saved!")
        } else if (request.status === 400){
            alert("There is a section with that code already!")
            setChangeSectionCode(section.sectionCode)
        }
    }
    
    const switchActive = async () => {
        const confirmed = confirm("Are you sure you want to change the active status of this section? Instructors won't be able to add / access assignments, students won't be able to submit assignments or see announcements")
        if (!confirmed){
            return;
        }
        const request = await fetch(`https://localhost:7004/api/sections/set_active/${sectionId}`, {
            method: "PATCH",
            headers: {
                "Authorization" : `Bearer ${token}`
            }
        })
        const response = await request.json();
        if(request.ok){
            alert("Changed Active Status");
            setSection(response);
        }
    }

    const deleteSection = async () => {
        const confirmed = confirm("Are you sure you want to delete this section? All of the students will be expelled as well as the instructor and all of the content (announcements/assignments) in it")
        if (!confirmed){
            return;
        }
        const request = await fetch(`https://localhost:7004/api/sections/${sectionId}`,  {
            method: "DELETE",
            headers: {
                "Authorization" : `Bearer ${token}`,
                "Content-Type" : "application/json"
            }
        })
        if(request.ok){
            alert("Section was removed!")
            navigate(`/course/${section.courseID}`)
        }
    }

    const executeExpell = async (studentId) => {
        const request = await fetch(`https://localhost:7004/api/sections/expell`, {
            method: "PATCH",
            headers: {
                "Authorization" : `Bearer ${token}`,
                "Content-Type" : "application/json"
            },
            body: JSON.stringify({
                "memberId": studentId,
                "sectionId":sectionId
            })
        });
        if(request.ok){
            alert("Student was expelled")
            await loadStudents();
        }
    }
    return (
        <div className="context-menu">
        
            <CommonSideBar choice="course"/>
            <div>
                <h1>{course.courseCode} -{section.sectionCode}</h1>
                <hr/>
                <p>In this section you can edit the section code and change instructors. You can also expell students from this course, and change active status.
                <br/>You can use the help menu that will display a sub-menu below it for help in navigating.
                </p>
                <form onSubmit={(e) => edit(e)}>
                    <h1>Edit Information</h1>
                    <hr/>
                    <div className="course-edit-form">
                        <div>
                            <label for="sectionCode">Section Code:</label><br/>
                            <input type="number" id="sectionCode" defaultValue={section.sectionCode} onChange={(e) => setChangeSectionCode(e.target.value)} value={changeSectionCode}/><br/>
                        </div>
                        <div>
                        
                            <label for="s_instructors">Instructor: </label>
                            <select value={changeInstructorId} onChange={(e) => setChangeInstructorId(e.target.value)}>
                                {instructors && instructors.map( (instructor) => (
                                    <option value={instructor.id} key={instructor.id}>{instructor.name}</option>
                                ))}
                           </select>
                        </div>
                         <button style={{"gridColumnEnd":"2"}} onClick={() => switchActive()} className={ section.isActive ? "red-button" : "blue-button"}>{section.isActive ? "Set Inactive" : "Set Active"}</button>
 
                        <button style={{"width":"80%", }}className="red-button" onClick={() => deleteSection()}>DELETE THIS SECTION</button>
                        <button style={{"gridColumnStart":"1", "gridColumnEnd":"3", "width": "25%", "marginTop":"20px"}}type="submit" className="blue-button">Save Changes</button>
                    </div>
                </form>
                <div className="students-manager">
                    <h1>Manage Students Enrolled</h1>
                    <hr/>
                    {students && students.map( (student) => (
                        <section className="section-line">
                            <h3 style={{gridColumnStart: "1", gridColumnEnd: "3"}}>{student.name}</h3>
                            <button style={{"fontSize":"22px"}} className="red-button" onClick={() => executeExpell(student.id)}>×</button>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Section