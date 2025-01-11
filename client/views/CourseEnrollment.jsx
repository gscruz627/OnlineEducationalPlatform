import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import "../src/App.css"
import "../public/MyCourses.css"

const CourseEnrollment = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [searched, setSearched] = useState(false);
    const [searchCapture, setSearchCapture] = useState("");
    const [courses, setCourses] = useState(null);
    const [sections, setSections] = useState(null);
    const [course, setCourse] = useState(null);
    const [instructors, setInstructors] = useState(null);

    const navigate = useNavigate();
    const user = useSelector( (state) => state.user);
    const token = useSelector( (state) => state.token);

    const getAllCourses = async () => {
        const request = await fetch('https://localhost:7004/api/courses', {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const response = await request.json();
        if(request.ok){
          setCourses(response);
        }
      }
      const search = async (e) => {
        e.preventDefault();
        if (searchTerm === ""){
          return;
        }
        setSearched(true);
        setSearchCapture(searchTerm);
        
        const request = await fetch(`https://localhost:7004/api/courses/search?q=${searchTerm}`, {
          method: "GET",
          headers: {
            "Authorization" : `Bearer ${token}`
          }
        })
        const response = await request.json();
        if(request.ok){
          setCourses(response)
        }
      }
      const clearSearch = async () => {
        setSearched(false);
        setSearchCapture(null);
        setSearchTerm("");
        await getAllCourses();
      }
      const selectCourse = async (course, courseId) => {
        const request = await fetch(`https://localhost:7004/api/sections/course/${courseId}`, {
            method: "GET",
            headers: {
                "Authorization" : `Bearer ${token}`,
            }
        })
        const response = await request.json();
        if (request.ok){
            setCourse(course)
            setSections(response)
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
    const executeEnroll = async (sectionId) => {
      const request = await fetch("https://localhost:7004/api/sections/enroll", {
        method: "POST",
        headers: {
          "Content-Type" : "application/json",
          "Authorization" : `Bearer ${token}`
        },
        body: JSON.stringify({
          sectionId: sectionId,
          studentId: user.id
        })
      });
      if (request.ok){
        alert("You enrolled successfully!");
        navigate("/mycourses")
        return;
      } else if (request.status === 400){
        alert("You are already enrolled in that course or section!")
        return;
      }
    }
      useEffect( () => {
        getAllCourses();
        loadInstructors();
      }, [])
    return (
        <div className="context-menu">
            <div className="section-selector-holder">
                {sections ? (
                    <>
                    <h2>Sections for {course.title}</h2>
                    {sections.map ( (section) => (
                        section.isActive && (
                            <div className="section-selector-item">
                                <h3 onClick={() => executeEnroll(section.id)}>{course.courseCode}-{section.sectionCode}</h3>
                                {/* You must change this brooo &*/}
                                <p>By {instructors.filter( (instructor) => instructor.id === section.instructorID)[0].name}</p>
                            </div>
                        )
                    ))}
                    </>
                ) : (
                    <>
                    </>
                )}
            </div>

            <div>
            <h1>Enroll in a course</h1>
                <hr/>
                <p>Select a course and then select a section to enroll.</p>
                <div className="course-card-holder">
                {courses && courses[0] && courses.map( (course, i) => (
                    <div className="course-card" onClick={() => selectCourse(course, course.id)}>
                        <img src={course.imageURL} />
                        <div>
                            <h2>{course.courseCode}</h2>
                            <p>{course.title}</p>
                        </div>
                    </div>
                ))}
                </div>
            </div>
        </div>
    )
}

export default CourseEnrollment