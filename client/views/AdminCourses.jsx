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
      
      <CommonSideBar choice="course" updater={setCourses}/>
      <div>
        <form onSubmit={(e) => search(e)} style={{marginBottom: "1rem"}}>
            <input className="input-with-side" placeholder="Ex. ART100 or Intro to Art" type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
            <button className="blue-btn side-with-input" type="submit">Search</button>
        </form>

        <h1 className='color-gray'>Courses {searched ? `(Searched: ${searchCapture})` : "" }</h1>
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