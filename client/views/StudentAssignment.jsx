import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom'

const StudentAssignment = () => {

    const {assignmentId} = useParams();
    const navigate = useNavigate();

    const user = useSelector( (state) => state.user);
    const token = useSelector( (state) => state.token);

    const [submissions, setSubmissions] = useState([]);
    const [assignment, setAssignment] = useState(null);
    const [submissionOpen, setSubmissionOpen] = useState(false);
    const [comment, setComment] = useState("");
    const [filename, setFilename] = useState("");


    const loadAssignmentInfo = async () => {
        const request = await fetch(`https://localhost:7004/api/assignments/${assignmentId}`, {
            method: "GET",
            headers: {
                "Authorization" : `Bearer ${token}`
            }
        });
        if(request.ok){
            const response = await request.json();
            setAssignment(response); 
        }
        const submissionsRequest = await fetch(`https://localhost:7004/api/assignments/submissions_student?studentId=${user.id}&assignmentId=${assignmentId}`, {
            method: "GET",
            headers: {
                "Authorization" : `Bearer ${token}`
            }
        });
        if (submissionsRequest.ok){
            const submissionsResponse = await submissionsRequest.json();
            setSubmissions(submissionsResponse)
        }
    }

    const executeCreateSubmission = async (e) => {
        e.preventDefault();
        if (new Date(assignment.dueDate) < new Date()){
            alert("The submission date has passed while you had this submission box open! You are not able to submit anymore")
            return
        }
        const request = await fetch(`https://localhost:7004/api/assignments/submit`, {
            method: "POST",
            headers: {
                "Authorization" : `Bearer ${token}`,
                "Content-Type" : "application/json",
            },
            body: JSON.stringify({
                "studentID" : user.id,
                "assignmentID" : assignmentId,
                "comments" : comment,
                "submissionFilename" : filename
            })
        })
        if(request.ok){
            const response = await request.json();
            setSubmissions([...submissions, response])
            alert("Submitted!")
            setSubmissionOpen(false)
            setComment("");
            setFilename("");
        }
    }
    useEffect( () => {
        loadAssignmentInfo();
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
                <h1>{assignment && assignment.name}</h1>
                <hr/>
                <p>{assignment && assignment.description}</p>
                <p
                    style={{
                    display: "inline",
                    color: new Date() > new Date(assignment.dueDate) ? "red" : "black",
                    }}
                    >
                    Due on{" "}
                    {new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                    }).format(new Date(assignment.dueDate))}
                </p>
                <hr/>
                <h2>Submissions</h2>
                { submissions && submissions.map( (submission, i) => (
                    <div>
                        <p style={{textDecoration: "underline"}}><b>Submission {i + 1}: </b></p>
                        <p><b>Comments: </b>{submission.comments}</p>
                        <p><b>Filename: </b>{submission.submissionFilename ?? ""}</p>
                    </div>
                ))}
                <hr/>
                <p>Submission Count: {submissions.length} / {assignment && assignment.submissionLimit} </p>
                {(assignment &&submissions.length < assignment.submissionLimit && new Date(assignment.dueDate) > new Date()) && (
                    <button type="button" className={submissionOpen ? 'red-button' : 'blue-button'} onClick={() => setSubmissionOpen(!submissionOpen)}>{submissionOpen ? "Cancel Submission" : "New Submission"}</button>
                )}
                <hr/>
                {submissionOpen && 
                    <form onSubmit={(e) => executeCreateSubmission(e)}>
                        <h3>New Submission:</h3>
                        <label for="comments">Comments: </label>
                        <textarea value={comment} onChange={(e) => setComment(e.target.value)} id="comments" className="common-input" width="80%" style={{display: "block", borderRadius: "5px"}}></textarea>
                        <br/>
                        {assignment && assignment.requiresFileSubmission && 
                        <>
                        <label>Submit a file</label><br/>
                        <input onChange={(e) => setFilename(e.target.files[0].name)} type="file"></input>
                        </>
                        }
                        <button className="blue-button" type="submit">Submit</button>
                    </form>
                }
            </div>
        </div>       
    )
}

export default StudentAssignment