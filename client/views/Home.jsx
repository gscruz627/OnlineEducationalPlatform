import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import "../src/App.css"

const Home = () => {
  const token = useSelector( (state) => state.token);
  const role = useSelector( (state) => state.role);
  const kind = role;
  const user = useSelector( (state) => state.user);
  const navigate = useNavigate();

  // Information for Instructor
  const [sections, setSections] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect( () => {
    if (role === "instructor") {
      sections.forEach(section => loadAssignments(section.id));
    } else {
      sections.forEach(section => loadAnnouncements(section.id));
    }
  }, [sections])

  const loadAnnouncements = async (sectionId) => {
    const request = await fetch(`https://localhost:7004/api/announcements/section/${sectionId}`, {
        method: "GET",
        headers: {
            "Authorization" : `Bearer ${token}`
        }
    });
    if(request.ok){
        const response = await request.json();
        setAnnouncements(prev => ({
          ...prev,
          [sectionId]: response, // Store assignments under sectionId
        }));
    }
  }
  const loadSections = async () => {
      const route = (role === "instructor") ? `https://localhost:7004/api/instructors/sections/${user.id}`
                    : `https://localhost:7004/api/sections/enrollments/${user.id}`
      let request = null;
      try{
        request = await fetch(route, {
          method: "GET",
          headers: {
            "Authorization" : `Bearer ${token}`,
          }
        })
      } catch(error){
        alert("Fatal, something wrong happened! Please reload")
        return;
      }
      if (request.ok){
        const response = await request.json();
        setSections(response);
      }
    }

    const loadAssignments = async (sectionId) => {
      const request = await fetch(`https://localhost:7004/api/assignments/sections/${sectionId}`, {
          method: "GET",
          headers: {
              "Authorization": `Bearer ${token}`
          }
      })
      if (request.ok){
          const response = await request.json();
          setAssignments(prev => ({
            ...prev,
            [sectionId]: response, // Store assignments under sectionId
          }));
        
          // Fetch submissions for each assignment
          response.forEach(assignment => loadSubmissions(assignment.id));
      }
    }
    const loadSubmissions = async (assignmentId) => {
      let request = null;
      try{
        request = await fetch(`https://localhost:7004/api/assignments/submissions/${assignmentId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      } catch(error){
        alert("Fatal Error, try again!");
        return;
      }
      const response = await request.json();
      setSubmissions(prev => ({
        ...prev,
        [assignmentId]: response, // Store submissions under assignmentId
      }));
    }
  useEffect( () => {
    console.log(typeof announcements);
  }, [announcements])
  useEffect( () => {
    if (role !== "admin"){
      loadSections();
    }
  }, [])
  return (
    <>
    { (!user) && (
      <section className="font-formal" style={{textAlign: "center"}}>
      <h1 className="color-gray" style={{fontSize: "48px"}}>Welcome</h1>
      <p>Please login to access your courses.</p>

      <button style={{margin: "2rem 0", textAlign: "center"}} className='blue-btn'><Link to="/login">Sign In Here</Link></button>
    </section>  
    )}
    { user && (role == "admin") && 
      <section style={{fontFamily: "Lisu Bosa"}}>
        <h1 style={{fontSize: "48px"}}>Online Learning Platform</h1>
        <h2 className='color-gray'>Admin Manager Center</h2>
        <hr/>
        <p style={{marginTop: "2rem"}}>Manage: <Link to="/admin_courses" style={{color: "#298D29"}}>Courses</Link>, <Link to="/admin_members/student" style={{color: "#298D29"}}>Students</Link>, <Link to="/admin_members/instructor" style={{color: "#298D29"}}>Instructors</Link></p>
      
        <h1>Created by Gustavo La Cruz, February 2025</h1>
      </section>
    }
    { user && (role === "student" || role === "instructor") &&
    <div style={{fontFamily: "Lisu Bosa"}}>
      <h1 className="color-gray">My Courses</h1>
      <hr/>
      <div className="course-card-holder holder-xl">
          {sections && sections.map( (section, i) => (
            <div key={i} className="course-card" onClick={() => navigate(`/course_page/${kind}/${section.id}`)}>
            <img src={section.imageURL} />
            <div>
              <h2>{section.courseCode} - {section.sectionCode}</h2>
              <p>{section.title}</p>
            </div>
          </div>
          ))}
      </div>

      <h1 className="color-gray">Announcements</h1>
      <hr style={{marginBottom: "1rem"}}/>
      {sections && sections.map((section) => (
            <div key={section.id}>
              <h2 style={{ textDecoration: "underline" }}>
                {section.courseCode} - {section.sectionCode}: {section.title}
              </h2>

              {announcements[section.id] && announcements[section.id].length > 0 ? (
                announcements[section.id].map((announcement) => (
                  <div key={announcement.id} className="announcement-box" style={{margin: "1rem 0"}}>
                    <h2>{announcement.title}</h2>
                    <p>{announcement.description}</p>
                    <hr />
                  </div>
                ))
              ) : (
                <p>No announcements to show</p>
              )}
            </div>
      ))}

    </div>
    }
    { user && (role === "instructor") && 
    <div style={{fontFamily: "Lisu Bosa"}}>
      <h1 className='color-gray'>Student Submissions</h1>
      <hr/>
      <div>
        {sections.map((section) => (
          <div key={section.id} style={{margin: "1rem 0", borderBottom: "1px dashed gray"}}>
            <h2 style={{textDecoration: "underline"}}>{section.courseCode} - {section.sectionCode}: {section.title}</h2>
            {assignments[section.id] && assignments[section.id].length > 0 ? (
              assignments[section.id].map((assignment) => (
                <div key={assignment.id}>
                  <h2 style={{color: "#1F6A6A"}}>{assignment.name}</h2> 

                  {submissions[assignment.id] && submissions[assignment.id].length > 0 ? (
                    <ul style={{padding:'0'}}>
                      {submissions[assignment.id].map((submission, i) => (
                        <div className="member-item" key={i}>
                          <div>
                              <span className="member-item-user-logo" style={{ fontSize: "48px", textAlign: "center" }}>&#128221;</span>
                          </div>
                          <div>
                              <h2><Link to={`/profile/${submission.studentId}`}>{kind === "instructor" ? submission.studentName : `Submission ${i + 1}`}</Link></h2>
                              <p><b>Comments: </b>{submission.comments}</p>
                              {assignment.requiresFileSubmission && <p><b>FileName: </b>{submission.submissionFilename}</p>}
                          </div>
                        </div>
                      ))}
                    </ul>
                  ) : (
                    <p>No submissions yet.</p> // Ensures assignment name is still shown
                  )}
                </div>
              ))
            ) : (
              <p>No assignments yet.</p>
            )}
          </div>
        ))}
      </div>
    </div>}
    </>
  )
}

export default Home