import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import "../src/App.css";
import "../public/MyCourses.css"
import "../public/courseAndSection.css"

const CourseAssignmentsInstructor = () => {
    
    const {sectionId} = useParams();
    const token = useSelector((state) => state.token);
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState(null);
    const [assignmentDate, setAssignmentDate] = useState(null);
    const [assignmentDescription, setAssignmentDescription] = useState("");
    const [assignmentLimit, setAssignmentLimit] = useState("");
    const [assignmentName, setAssignmentName] = useState("");
    const [assignmentRequiresFile, setAssignmentRequiresFile] = useState(false);

    const loadAssignments = async () => {
        const request = await fetch(`https://localhost:7004/api/assignments/sections/${sectionId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        if (request.ok){
            const response = await request.json();
            setAssignments(response);
        }
    }

    const createAssignment = async (e) => {
        e.preventDefault();
        const request = await fetch("https://localhost:7004/api/assignments", {
            method: "POST",
            headers: {
                "Authorization" : `Bearer ${token}`,
                "Content-Type" : "application/json"
            },
            body: JSON.stringify({
                "description" : assignmentDescription,
                "duedate" : assignmentDate,
                "isactive" : true,
                "name" : assignmentName,
                "sectionID" : sectionId,
                "submissionLimit" : assignmentLimit,
                "requiresFileSubmission" : assignmentRequiresFile
            })
        });
        if (request.ok){
            const response = await request.json();
            alert("Assignment was created!")
            setAssignments([...assignments, response])
        }
    }
    useEffect( () => {
        loadAssignments();
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
                <h1>Assignments</h1>
                <hr/>
                <p>Here you can create and see assignments</p>
                <h2>Create a new assignment</h2>
                <hr/>
                <form onSubmit={(e) => createAssignment(e)}>
                    <label for="as_name">Name:</label><br/>
                    <input className="common-input" type="text" id="as_name" value={assignmentName} onChange={(e) => setAssignmentName(e.target.value)}/>
                    <br/>
                    <label for="as_description">Description:</label><br/>
                    <textarea className="common-input" id="as_description" value={assignmentDescription} onChange={(e) => setAssignmentDescription(e.target.value)}/>
                    <br/>
                    <label for="as_date">Due Date: </label><br/>
                    <input className="common-input" type="date" id="as_name" value={assignmentDate} onChange={(e) => setAssignmentDate(e.target.value)}/>
                    <br/>
                    <label for="as_limit">Submission Limit: </label><br/>
                    <input className="common-input" type="number" id="as_limit" value={assignmentLimit} onChange={(e) => setAssignmentLimit(e.target.value)}/>
                    <br/>
                    <label for="as_requiresfile">Requires File Submission?</label><br/>
                    <input style={{scale: "2.5", marginLeft: "10px"}} type="checkbox" id="as_requiresfile" checked={assignmentRequiresFile} onChange={(e) => setAssignmentRequiresFile(!assignmentRequiresFile)}></input>
                    <br/><br/>
                    <button className="blue-button">Create</button>
                </form>
                <hr/>
                <h2>All Assignments</h2>
                {assignments && assignments.map( (assignment) => (
                    <div style={{display:"flex", justifyContent: "space-between"}}>
                        <p className='blinking-blue' onClick={() => navigate(`/assignment/${assignment.id}`)}>{assignment.name}</p>
                        <div>
                            <p style={{display: "inline"}}>Due on {new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit"}).format(new Date(assignment.dueDate))}</p>
                            <button className='brown-btn'>Edit</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default CourseAssignmentsInstructor