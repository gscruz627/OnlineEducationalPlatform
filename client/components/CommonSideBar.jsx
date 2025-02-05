import React, { useState } from 'react'
import "../src/App.css"
import "../public/instructors.css"
import "../public/Auth.css"
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const CommonSideBar = ({choice, updater}) => {
  
  const [title, setTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const token = useSelector( (state) => state.token);
  const navigate = useNavigate();

  const executeCreate = async (e) => {
      e.preventDefault();
      if ( (title === "") || (courseCode === "")){
          setErrorMessage("Title and CourseCode must have a value");
          setTimeout(() => {
            setErrorMessage("");
          }, 5000)
          return;
      }
      try{
        const request = await fetch("https://localhost:7004/api/courses", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization" : `Bearer ${token}`
            },
            body: JSON.stringify({
                "title" : title,
                "courseCode" : courseCode,
                "imageUrl" : imageUrl == "" ? "https://cdn.pixabay.com/photo/2016/11/26/15/14/mountains-1860897_1280.jpg" : imageUrl
            })
        });
        if(!request.ok){
          setErrorMessage("Invalid, name or code already exists");
          setTimeout(() => {
            setErrorMessage("");
          }, 5000)
          return;
        }
        const response = await request.json();
        updater( (prev) => [...prev, response])

        setSuccessMessage("Course was created!");
        setTimeout( () => {
          setSuccessMessage("");
        }, 5000);
        return;
      }
      catch(error){
        setErrorMessage("Something wrong has happened, try again");
        setTimeout( () =>{
          setErrorMessage("");
        }, 5000);
        return;
      }

  }
  return (
    <form className="form-container" onSubmit={(e) => executeCreate(e)}>
      {choice === "course" && <h1>Create Course</h1> }
      {choice === "instructor" && <h1>Register Instructor</h1> }
      {choice === "student" && <h1>Register Student</h1> }
      
      {(errorMessage != "") && <div style={{width: "75%"}} className="error-box">{errorMessage}</div> }
      {(successMessage != "") && <div style={{width: "75%"}} className="success-box">{successMessage}</div>}

      <label for="c_title">Title: </label>
      <input placeholder="Ex. College Algebra"id="c_title" type="text" onChange={(e) => setTitle(e.target.value)} value={title}/>
                
      <label for="c_code">Course Code: </label>
      <input placeholder="Ex. MATH 100" id="c_code" type="text" onChange={(e) => setCourseCode(e.target.value)} value={courseCode}/>
                
      <label for="c_image">Course Image: </label>
      <input id="c_image" type="text" onChange={(e) => setImageUrl(e.target.value)} value={imageUrl} />

      {imageUrl && (
        <div className="image-holder">
          <img className="image-holder-img" src={imageUrl} width="100%"/>
        </div>   
      )}
                
      <button style={{width: "75%"}} className="red-btn" type="submit">Create</button>
    </form>
  )
}

export default CommonSideBar;