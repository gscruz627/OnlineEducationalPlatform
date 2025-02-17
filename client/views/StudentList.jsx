import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";

const StudentList = () => {
  const { sectionId } = useParams();
  const kind = useSelector((state) => state.role);
  const enrollments = useSelector((state) => state.enrollments);
  const [section, setSection] = useState(null);
  const [students, setStudents] = useState(null);
  const [instructor, setInstructor] = useState(null);
  const token = useSelector((state) => state.token);
  const navigate = useNavigate();
  const SERVER_URL = import.meta.env["VITE_SERVER_URL"];


  const loadSectionInformation = async () => {
    let request = null;
    try {
      request = await fetch(
        `${SERVER_URL}/api/sections/${sectionId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      alert("Fatal Error, please reload");
      return;
    }
    if (!request.ok) {
      alert("Fatal Error, please reload");
      return;
    }
    const response = await request.json();
    setSection(response);

    let instructorRequest = null;
    try {
      instructorRequest = await fetch(
        `${SERVER_URL}/api/instructors/${response.instructorID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      alert("Fatal Error, please reload");
      return;
    }
    if (!request.ok) {
      alert("Fatal Error, please reload");
      return;
    }
    const instructorResponse = await instructorRequest.json();
    setInstructor(instructorResponse);
  };
  const loadStudentsEnrolled = async () => {
    const request = await fetch(
      `${SERVER_URL}/api/sections/${sectionId}/students`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (request.ok) {
      const response = await request.json();
      setStudents(response);
    }
  };
  useEffect(() => {
    if (!enrollments.includes(sectionId.toLowerCase())) {
      navigate("/404");
    }
    loadSectionInformation();
    loadStudentsEnrolled();
  }, []);
  return (
    <div className="context-menu">
      <div className="side-bar">
        <h1>{section && `${section.courseCode} - ${section.sectionCode}`}</h1>

        <ul>
          <li
            className="side-bar-item"
            onClick={() => {
              navigate(`/course_page/${kind}/${sectionId}/`);
            }}
          >
            Announcements
          </li>
          <li
            className="side-bar-item"
            onClick={() => {
              navigate(`/course_page/${kind}/${sectionId}/assignments/`);
            }}
          >
            Assignments
          </li>
          <li
            className="side-bar-item"
            onClick={() => {
              navigate(`/course_page/${sectionId}/students/`);
            }}
          >
            Students
          </li>
        </ul>
      </div>
      <div>
        <h1 className="color-gray">Instructor</h1>
        <hr />
        <div className="member-item">
          <div>
            <span
              className="member-item-user-logo"
              style={{ fontSize: "48px", textAlign: "center" }}
            >
              &#128100;
            </span>
          </div>
          <div>
            <h2>
              <Link to={`/profile/${instructor?.id}`}>{instructor?.name}</Link>
            </h2>
          </div>
        </div>
        <h1 className="color-gray">Students</h1>
        <hr />

        {students &&
          students[0] &&
          students.map((student, i) => (
            <div className="member-item" key={i}>
              <div>
                <span
                  className="member-item-user-logo"
                  style={{ fontSize: "48px", textAlign: "center" }}
                >
                  &#128100;
                </span>
              </div>
              <div>
                <h2>
                  <Link to={`/profile/${student.id}`}>{student.name}</Link>
                </h2>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default StudentList;
