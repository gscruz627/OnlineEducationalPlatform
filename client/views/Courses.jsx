import React, { useState, useEffect } from 'react'
import "../src/App.css"
import "../public/Instructors.css"
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CommonSideBar from '../components/CommonSideBar';

const Courses = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searched, setSearched] = useState(false);
  const [searchCapture, setSearchCapture] = useState("");
  const [courses, setCourses] = useState(null);
  
  const navigate = useNavigate();
  const token = useSelector( (state) => state.token);

  useEffect( () => {
    getAllCourses();
  }, [])

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

  const editCourse = async (i) => {
    const newname = prompt("Change the name of this course", courses[i].name);
    if (courses[i] && (newname == courses[i].name)){
      return;
    }
    if (newname == "" || newname == null){
      alert("Need a non-empty name")
      return;
    }
    const courseId = courses[i].id;
    const request = await fetch(`https://localhost:7004/api/courses/${courses[i].id}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "text/plain"
      },
      body: newname
    });
    const response = await request.json();
    if (request.ok){
      setCourses((prevCourses) => 
        prevCourses.map((course) => {
            if (course.id === courseId) {
                return response;
            }
            return course;
        })
    );
    }
  }

  const deleteCourse = async (id) => {
    const finalConfirm = confirm("Are you sure you want to remove this course?");
    if (finalConfirm === false){
      return;
    }
    const request = await fetch(`https://localhost:7004/api/courses/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization" : `Bearer ${token}`
      }
    });
    if (request.ok) {
      setCourses((prevCourses) => 
          prevCourses.filter((course) => course.id !== id)
      );
  }
  }
  return (
    <div className="context-menu">
      
      <CommonSideBar choice="course"/>
      <div>
        <h1>Manage Courses</h1>
        <hr/>
        <p>In this section you can manage courses and perform actions such as searching, creating, and deleting courses.
          <br/>You can use the help menu that will display a sub-menu below it for help in navigating.
          <br/>Use the search bar to begin searching or use the create a course form.
        </p>

        <form onSubmit={(e) => search(e)}>
            <h1>Search Course</h1>
            <hr/>
            <p>Search an course by first and last name or email</p>
            <input placeholder="Ex. John Doe" className="generic-bar" type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
            <button className="blue-button" type="submit">Search</button>
        </form>

        <h1>Courses {searched ? `(Searched: ${searchCapture})` : "" }</h1>
        {searchCapture && <span style={{color: "rgb(184, 65, 65)", cursor: "pointer"}} onClick={() => clearSearch()}>Clear Search</span>}
        <hr/>

        <div className="course-card-holder">
          {courses && courses[0] && courses.map( (course, i) => (
            <div className="course-card" onClick={() => navigate(`/course/${course.id}`)}>
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

export default Courses;