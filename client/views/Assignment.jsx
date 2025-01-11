import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

const Assignment = () => {

    const {assignmentId} = useParams();
    const token = useSelector( (state) => state.token);
    const [assignment, setAssignment] = useState(null);
    const [assignmentDate, setAssignmentDate] = useState(null);
    const [assignmentDescription, setAssignmentDescription] = useState("");
    const [assignmentLimit, setAssignmentLimit] = useState("");
    const [assignmentName, setAssignmentName] = useState("");
    const [assignmentRequiresFile, setAssignmentRequiresFile] = useState(false);
    const [submissions, setSubmissions] = useState(null);

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
            setAssignmentDate(Intl.DateTimeFormat("en-CA").format( new Date(response.dueDate)));
            setAssignmentDescription(response.description);
            setAssignmentLimit(response.submissionLimit);
            setAssignmentName(response.name)
            setAssignmentRequiresFile(response.requiresFileSubmission); 
        }
        const submissionsRequest = await fetch(`https://localhost:7004/api/assignments/submissions/${assignmentId}`, {
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

    const editAssignment = async (e) => {
        e.preventDefault();
        const request = await fetch(`https://localhost:7004/api/assignments/${assignment.id}`, {
            method: "PATCH",
            headers: {
                "Authorization" : `Bearer ${token}`,
                "Content-Type" : "application/json"
            },
            body: JSON.stringify({
                "description" : assignmentDescription,
                "duedate" : assignmentDate,
                "isactive" : true,
                "name" : assignmentName,
                "sectionID" : assignment.sectionID,
                "submissionLimit" : assignmentLimit,
                "requiresFileSubmission" : assignmentRequiresFile
            })
        });
        if (request.ok){
            const response = await request.json();
            alert("Changes were saved!")
            setAssignment(response)
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
                        <li onClick={() => { navigate(`/course_view/instructor/${assignment.sectionId}`)}}>- Announcements</li>
                        <li onClick={() => { navigate(`/course_view/instructor/assignments/${assignment.sectionId}`)}}>- Assignments</li>
                        <li onClick={()=>{}}>- Students</li>
                    </ul>
                </div>
            </div>
            <div>
                <h1>{assignment && assignment.name} Edit</h1>
                <hr/>
                <form onSubmit={(e) => editAssignment(e)}>
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
                    <button className="blue-button">Save Changes</button>
                </form>
                <hr/>
                <h2>Submissions</h2>
                { submissions && submissions.map( (submission, i) => (
                    <div>
                        <p><b>{submission.studentName}:</b></p>
                        <p><b>Comments: </b>{submission.comments}</p>
                        <p><b>Fillename: </b>{submission.submissionFilename ?? ""}</p>
                        <hr/>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Assignment