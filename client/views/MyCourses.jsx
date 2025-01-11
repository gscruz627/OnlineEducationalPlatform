import React, { useEffect, useState } from 'react'
import "../public/MyCourses.css"
import "../src/App.css"
import "../public/CourseAndSection.css"
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const MyCourses = () => {
  const [sections, setSections] = useState([]);
  const user = useSelector( (state) => state.user);
  const token = useSelector( (state) => state.token);
  const navigate = useNavigate();
  const loadSections = async () => {
    const request = await fetch(`https://localhost:7004/api/sections/enrollments/${user.id}`, {
      method: "GET",
      headers: {
        "Authorization" : `Bearer ${token}`,
      }
    })
    if (request.ok){
      const response = await request.json();
      setSections(response);
    }
  }
  useEffect( () => {
    loadSections();
  }, [])

  return (
    <div>
        <h1>My Courses</h1>
        <hr/>
        <p>These are active course sections you are taking</p>
        <div className="courses-holder">
          {sections && sections.map( (section) => (
            <div className="course-card" onClick={() => navigate(`/course_view/student/${section.id}`)}>
            <img src={section.image} />
            <div>
              <h2>{section.courseCode} - {section.sectionCode}</h2>
              <p>{section.title}</p>
            </div>
          </div>
          ))}
        </div>
    </div>
  )
}

export default MyCourses