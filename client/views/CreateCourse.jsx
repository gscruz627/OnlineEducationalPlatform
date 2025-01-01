import React, { useState } from 'react'
import "../src/App.css"
import "../public/auth.css"
import "../public/CourseAndSection.css"
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import CommonSideBar from '../components/CommonSideBar'

const CreateCourse = () => {
    const [title, setTitle] = useState("");
    const [courseCode, setCourseCode] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const token = useSelector( (state) => state.token);
    const navigate = useNavigate();

    const executeCreate = async (e) => {
        e.preventDefault();
        if ( (title === "") || (courseCode === "")){
            alert("Must have filled title and courseCode fields");
            return;
        }
        if (imageUrl == ""){
            setImageUrl("https://support.eaglepoint.com/hc/article_attachments/5818550696859/default_course.jpg");
        }
        const request = await fetch("https://localhost:7004/api/courses", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization" : `Bearer ${token}`
            },
            body: JSON.stringify({
                "title" : title,
                "courseCode" : courseCode,
                "imageUrl" : imageUrl
            })
        });
        if(request.ok){
            alert("Course was created!")
            navigate("/courses")
        }

    }
    return (
        <div className="context-menu">
        <CommonSideBar choice="course" />
        <div className="form-container">
            <form onSubmit={(e) => executeCreate(e)}>
                <h1>Create Course</h1>
                <label for="c_title">Title: </label><br/>
                <input placeholder="Ex. College Algebra"id="c_title" type="text" onChange={(e) => setTitle(e.target.value)} value={title}/><br/><br/>
                
                <label for="c_code">Course Code: </label><br/>
                <input placeholder="Ex. MATH 100" id="c_code" type="text" onChange={(e) => setCourseCode(e.target.value)} value={courseCode}/><br/><br/>
                
                <label for="c_image">Course Image: </label><br/>
                <input id="c_image" type="text" onChange={(e) => setImageUrl(e.target.value)} value={imageUrl} />

                {imageUrl && (
                 <div className="image-holder">
                    <img className="image-holder-img" src={imageUrl} width="100%"/>
                </div>   
                )}
                

                <button className="blue-button" type="submit">Create</button>
            </form>
        </div>
        </div>
    )
}

export default CreateCourse