import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import "../src/App.css";
import "./styles/MyCourses.css";
import "./styles/CourseAndSection.css";

const CourseAssignmentsStudent = () => {
  const { sectionId } = useParams();
  const token = useSelector((state) => state.token);
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState(null);

  const loadAssignments = async () => {
    const request = await fetch(
      `https://localhost:7004/api/assignments/sections/${sectionId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (request.ok) {
      const response = await request.json();
      setAssignments(response);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);
  return (
    <div className="context-menu">
      <div className="side-bar">
        <h2 style={{ display: "inline-block", paddingButtom: "10px" }}>
          &#128270; Navigate{" "}
        </h2>
        <div className="side-bar-item">
          <ul>
            <li
              onClick={() => {
                navigate(`/course_view/student/${sectionId}`);
              }}
            >
              - Announcements
            </li>
            <li
              onClick={() => {
                navigate(`/course_view/student/assignments/${sectionId}`);
              }}
            >
              - Assignments
            </li>
            <li
              onClick={() => {
                navigate(`/course_view/instructor/student_list/${sectionId}`);
              }}
            >
              - Students
            </li>
          </ul>
        </div>
      </div>
      <div>
        <h1>Assignments</h1>
        <hr />
        <p>Here you can see assignments</p>
        <hr />
        <h2>All Assignments</h2>
        {assignments &&
          assignments.map((assignment) => (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <p
                className="blinking-blue"
                onClick={() => navigate(`/assignment/student/${assignment.id}`)}
              >
                {assignment.name}
              </p>
              <div>
                <p style={{ display: "inline" }}>
                  Due on{" "}
                  {new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "2-digit",
                  }).format(new Date(assignment.dueDate))}
                </p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default CourseAssignmentsStudent;
