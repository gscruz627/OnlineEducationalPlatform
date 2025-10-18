import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../src/App.css";
import { useSnapshot } from "valtio";
import state from "../store";
import checkAuth from "../functions";
import Loading from "../components/Loading";

const Home = () => {
  const navigate = useNavigate();
  const SERVER_URL = import.meta.env["VITE_SERVER_URL"];
 
  const [loading, setLoading] = useState<boolean>(false);
  const snap = useSnapshot(state);
  // Information for Instructor
  const [sections, setSections] = useState<any>([]);
  const [submissions, setSubmissions] = useState<any>([]);
  const [assignments, setAssignments] = useState<any>([]);
  const [announcements, setAnnouncements] = useState<any>([]);

  useEffect(() => {
    if (snap.user?.role === "instructor") {
      sections.forEach((section:any) => loadAssignments(section.id));
    } else {
      sections.forEach((section:any) => loadAnnouncements(section.sectionId));
    }
  }, [sections]);

  const loadAnnouncements = async (sectionId:string) => {
    setLoading(true);
    try{

      await checkAuth(navigate);
      const request = await fetch(
      `${SERVER_URL}/api/announcements?sectionId=${sectionId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${state.token}`,
        },
      }
      );
      if (request.ok) {
        const response = await request.json();
        setAnnouncements((prev:any) => ({
          ...prev,
          [sectionId]: response, // Store assignments under sectionId
        }));
      }
    } catch(err: unknown){
      alert("Fatal, something wrong happened! Please reload");
      return;
    } finally {
      setLoading(false);
    }
  };
  const loadSections = async () => {
    setLoading(true);
    let route = "";
    if(snap.user?.role){
      route = (snap.user?.role === "instructor")
        ? `${SERVER_URL}/api/sections?instructorId=${snap.user.userId}`
        : `${SERVER_URL}/api/enrollments?userId=${snap.user.userId}`; 
    }
    console.log(route);
    let request = null;
    try {
      await checkAuth(navigate);
      request = await fetch(route, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${state.token}`,
        },
      });
      console.log(request.status)
      if (request.ok) {
        const response = await request.json();
        console.log(response);
        setSections(response);
      }
    } catch (error) {
      alert("Fatal, something wrong happened! Please reload");
      return;
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = async (sectionId:string) => {
    setLoading(true);
    try{
      
      await checkAuth(navigate);
      const request = await fetch(
        `${SERVER_URL}/api/assignments?sectionId=${sectionId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${state.token}`,
          },
        }
      );
      if (request.ok) {
        const response = await request.json();
        setAssignments((prev:any) => ({
          ...prev,
          [sectionId]: response, // Store assignments under sectionId
        }));
  
        // Fetch submissions for each assignment
        response.forEach((assignment:any) => loadSubmissions(assignment.id));
      }
    } catch(err: unknown){
      alert("Fatal, something wrong happened! Please reload");
      return;
    } finally {
      setLoading(false);
    }
  };
  const loadSubmissions = async (assignmentId:string) => {
    setLoading(true);
    let request = null;
    try {
      await checkAuth(navigate);
      request = await fetch(
        `${SERVER_URL}/api/assignments/${assignmentId}/submissions`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${state.token}`,
          },
        }
      );
      const response = await request.json();
      setSubmissions((prev:any) => ({
        ...prev,
        [assignmentId]: response, // Store submissions under assignmentId
      }));
    } catch (error) {
      alert("Fatal Error, try again!");
      return;
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    console.log(typeof announcements);
  }, [announcements]);
  useEffect(() => {
    if (snap.role !== "admin") {
      loadSections();
    }
  }, []);
  return (
    <>
      {loading && <Loading /> }
      {!snap.user && (
        <section className="font-formal" style={{ textAlign: "center" }}>
          <h1 className="color-gray" style={{ fontSize: "48px" }}>
            Welcome
          </h1>
          <p>Please login to access your courses.</p>

          <button
            style={{ margin: "2rem 0", textAlign: "center" }}
            className="blue-btn"
          >
            <Link to="/login">Sign In Here</Link>
          </button>
        </section>
      )}
      {snap.user && snap.user.role === "admin" && (
        <section style={{ fontFamily: "Lisu Bosa" }}>
          <h1 style={{ fontSize: "48px" }}>Online Learning Platform</h1>
          <h2 className="color-gray">Admin Manager Center</h2>
          <hr />
          <p style={{ marginTop: "2rem" }}>
            Manage:{" "}
            <Link to="/admin_courses" style={{ color: "#298D29" }}>
              Courses
            </Link>
            ,{" "}
            <Link to="/admin_members/student" style={{ color: "#298D29" }}>
              Students
            </Link>
            ,{" "}
            <Link to="/admin_members/instructor" style={{ color: "#298D29" }}>
              Instructors
            </Link>
          </p>

          <h1>Created by Gustavo La Cruz, February 2025</h1>
        </section>
      )}
      {snap.user && (snap.user.role === "student" || snap.user.role === "instructor") && (
        <div style={{ fontFamily: "Lisu Bosa" }}>
          <h1 className="color-gray">My Courses</h1>
          <hr />
          <div className="course-card-holder holder-xl">
            {sections &&
              sections.map((section:any) => (
                <div
                  key={section.id}
                  className="course-card"
                  onClick={() => navigate(`/course_page/${snap.user?.role}/${section.id ?? section.sectionId}`)}
                >
                  <img src={section.imageURL ?? section.course?.imageURL} />
                  <div>
                    <h2>
                      {section.courseCode ?? section.course?.courseCode} - {section.sectionCode}
                    </h2>
                    <p>{section.title ?? section.course?.title}</p>
                  </div>
                </div>
              ))}
          </div>

          <h1 className="color-gray">Announcements</h1>
          <hr style={{ marginBottom: "1rem" }} />
          {sections &&
            sections.map((section:any) => (
              <div key={section.id}>
                <h2 style={{ fontFamily: "Sofia Pro", color: "red" }}>
                  {section.courseCode ?? section.course?.courseCode} - {section.sectionCode}: {section.title ?? section.course?.title}
                </h2>

                {announcements[section.id] &&
                announcements[section.id].length > 0 ? (
                  announcements[section.id].map((announcement:any) => (
                    <div
                      key={announcement.id}
                      className="announcement-box"
                      style={{ margin: "1rem 0" }}
                    >
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
      )}
      {snap.user && snap.user.role === "instructor" && (
        <div style={{ fontFamily: "Lisu Bosa" }}>
          <h1 className="color-gray">Student Submissions</h1>
          <hr />
          <div>
            {sections.map((section:any) => (
              <div
                key={section.id}
                style={{ margin: "1rem 0", borderBottom: "1px dashed gray" }}
              >
                <h2 style={{ fontFamily: "Sofia Pro", color: "red" }}>
                  {section.courseCode ?? section.course?.courseCode} - {section.sectionCode}: {section.title ?? section.course?.title}
                </h2>
                {assignments[section.id] &&
                assignments[section.id].length > 0 ? (
                  assignments[section.id].map((assignment:any) => (
                    <div key={assignment.id}>
                      <h2 style={{ color: "#1F6A6A" }}>{assignment.name}</h2>

                      {submissions[assignment.id] &&
                      submissions[assignment.id].length > 0 ? (
                        <ul style={{ padding: "0" }}>
                          {submissions[assignment.id].map((submission:any, i:number) => (
                            <div className="member-item" key={submission.id}>
                              <div>
                                <span
                                  className="member-item-user-logo"
                                  style={{
                                    fontSize: "48px",
                                    textAlign: "center",
                                  }}
                                >
                                 <i className="fa-solid fa-upload"></i>
                                </span>
                              </div>
                              <div>
                                <h2>
                                  <Link to={`/profile/${submission.studentId}`}>
                                    {snap.role === "instructor"
                                      ? submission.studentName
                                      : `Submission ${i + 1}`}
                                  </Link>
                                </h2>
                                <p>
                                  <b>Comments: </b>
                                  {submission.comments}
                                </p>
                                {assignment.requiresFileSubmission && (
                                  <p>
                                    <b>FileName: </b>
                                    {submission.submissionFilename}
                                  </p>
                                )}
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
        </div>
      )}
    </>
  );
};

export default Home;
