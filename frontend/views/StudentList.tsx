import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import state from "../store";
import { useSnapshot } from "valtio";
import checkAuth from "../functions";
import Loading from "../components/Loading";

const StudentList = () => {
  const { sectionId } = useParams();
  const [section, setSection] = useState<any>(null);
  const [students, setStudents] = useState<Array<any>>([]);
  const [instructor, setInstructor] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const snap = useSnapshot(state);
  const SERVER_URL = import.meta.env["VITE_SERVER_URL"];

  const loadSectionInformation = async () => {

    setLoading(true);
    let request = null;
    try {
      await checkAuth(navigate);
      request = await fetch(
        `${SERVER_URL}/api/sections/${sectionId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${state.token}`,
          },
        }
      );
      if (!request.ok) {
        alert("Fatal Error, please reload");
        return;
      }
      const response = await request.json();
      setSection(response);
  
      let instructorRequest = null;
      instructorRequest = await fetch(
        `${SERVER_URL}/api/users/${response.instructorID}`,
        {
          headers: {
            Authorization: `Bearer ${state.token}`,
          },
        }
      );
      if (!request.ok) {
        alert("Fatal Error, please reload");
        return;
      }
      const instructorResponse = await instructorRequest.json();
      setInstructor(instructorResponse);
    } catch (err: unknown) {
      alert("Fatal Error, please reload");
      return;
    } finally {
      setLoading(false);
    }
  };
  const loadStudentsEnrolled = async () => {
    setLoading(true);
    try{
      await checkAuth(navigate);
      const request = await fetch(
        `${SERVER_URL}/api/sections/${sectionId}/students`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${state.token}`,
          },
        }
      );
      if (request.ok) {
        const response = await request.json();
        setStudents(response);
      }
    } catch(err: unknown){
      alert("Fatal Error, please reload");
      return;
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadSectionInformation();
    loadStudentsEnrolled();
  }, []);
  return (
    <>
    {loading && <Loading/>}
    <div className="context-menu">
      <div className="side-bar">
        <h1>{section && `${section.course?.courseCode} - ${section.sectionCode}`}</h1>

        <ul>
          <li
            className="side-bar-item"
            onClick={() => {
              navigate(`/course_page/${snap.user?.role}/${sectionId}/`);
            }}
            >
            Announcements
          </li>
          <li
            className="side-bar-item"
            onClick={() => {
              navigate(`/course_page/${snap.user?.role}/${sectionId}/assignments/`);
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
              <i className="fa-solid fa-user-tie"></i>
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
            <div className="member-item" key={student.id}>
              <div>
                <span
                  className="member-item-user-logo"
                  style={{ fontSize: "48px", textAlign: "center" }}
                >
                  <i className="fa-solid fa-user"></i>
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
  </>
  );
};

export default StudentList;
