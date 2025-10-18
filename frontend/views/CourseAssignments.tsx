import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../src/App.css";
import "./styles/MyCourses.css";
import "./styles/CourseAndSection.css";
import state from "../store";
import checkAuth from "../functions";
import Loading from "../components/Loading";

const CourseAssignment = () => {
  const { kind, sectionId } = useParams();
  const navigate = useNavigate();
  const SERVER_URL = import.meta.env["VITE_SERVER_URL"];

  const [loading, setLoading] = useState<boolean>(false);
  const [section, setSection] = useState<any>(null);
  const [assignments, setAssignments] = useState<Array<any>>([]);
  const [assignmentDate, setAssignmentDate] = useState<string>("");
  const [assignmentDescription, setAssignmentDescription] = useState<string>("");
  const [assignmentLimit, setAssignmentLimit] = useState<number|null>(null);
  const [assignmentName, setAssignmentName] = useState("");
  const [assignmentRequiresFile, setAssignmentRequiresFile] = useState(false);
  const [assignmentError, setAssignmentError] = useState("");
  const [assignmentSuccess, setAssignmentSucess] = useState("");

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
    } catch (error) {
      alert("Fatal Error, please reload");
      return;
    } finally {
      setLoading(false);
    }
  };
  const loadAssignments = async () => {
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
        setAssignments(response);
      }
    } catch(err: unknown){
      alert("Fatal Error, please reload");
      return;
    } finally {
      setLoading(false);
    }
  };

  const createAssignment = async (e: React.FormEvent) => {
    setLoading(true);
    e.preventDefault();
    let request = null;
    try {
      await checkAuth(navigate);
      request = await fetch(`${SERVER_URL}/api/assignments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${state.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: assignmentDescription,
          duedate: assignmentDate,
          isactive: true,
          name: assignmentName,
          sectionID: sectionId,
          submissionLimit: assignmentLimit,
          requiresFileSubmission: assignmentRequiresFile,
        }),
      });
      if (!request.ok) {
        setAssignmentError("Something wrong happened! Try again");
        setTimeout(() => {
          setAssignmentError("");
        }, 5000);
        return;
      }
      const response = await request.json();
      setAssignmentSucess("Assignment was crated!");
      setTimeout(() => {
        setAssignmentSucess("");
      }, 5000);
      setAssignments([...assignments, response]);
      setAssignmentDate("");
      setAssignmentDescription("");
      setAssignmentLimit(0);
      setAssignmentName("");
      setAssignmentRequiresFile(false);
    } catch (error) {
      setAssignmentError("Something wrong happened! Try again");
      setTimeout(() => {
        setAssignmentError("");
      }, 5000);
      return;
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadSectionInformation();
    loadAssignments();
  }, []);

  return (
    <>
    {loading && <Loading/> }
    <div className="context-menu">
      <div className="side-bar">
        <h1>{section && `${section.course?.courseCode} - ${section.sectionCode}`}</h1>

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
        {kind === "instructor" && (
          <>
            <h1 className="color-gray">Assignments</h1>
            <hr />
            {assignmentSuccess && (
              <>
                <div className="success-box">{assignmentSuccess}</div>
                <br />
              </>
            )}
            {assignmentError && (
              <>
                <div className="error-box">{assignmentError}</div>
                <br />
              </>
            )}

            <h2
              className="color-gray"
              style={{ textAlign: "center", margin: "1rem 0" }}
            >
              Create a new assignment
            </h2>
            <hr />
            <form
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
              onSubmit={(e) => createAssignment(e)}
            >
              <label htmlFor="assignment_title">Title:</label>
              <input
                style={{
                  fontFamily: "Lisu Bosa",
                  backgroundColor: "#FFF",
                  fontSize: "22px",
                  padding: "10px 5px",
                  border: "none",
                  borderBottom: "1px solid #000",
                  outline: "none",
                }}
                type="text"
                id="assignment_title"
                onChange={(e) => setAssignmentName(e.target.value)}
                value={assignmentName}
              ></input>

              <label htmlFor="assignment_description">Description:</label>
              <textarea
                style={{
                  fontFamily: "Lisu Bosa",
                  backgroundColor: "#FFF",
                  fontSize: "22px",
                  padding: "10px 5px",
                  border: "none",
                  borderBottom: "1px solid #000",
                  outline: "none",
                }}
                id="assignment_description"
                onChange={(e) => setAssignmentDescription(e.target.value)}
                value={assignmentDescription}
              ></textarea>

              <label htmlFor="assignment_date">Due Date: </label>
              <input
                style={{
                  fontFamily: "Lisu Bosa",
                  backgroundColor: "#FFF",
                  fontSize: "22px",
                  padding: "10px 5px",
                  border: "none",
                  borderBottom: "1px solid #000",
                  outline: "none",
                }}
                type="date"
                id="assignment_date"
                onChange={(e) => setAssignmentDate(e.target.value)}
                value={assignmentDate}
              ></input>

              <label htmlFor="assignment_limit">Submission Limit: </label>
              <input
                style={{
                  fontFamily: "Lisu Bosa",
                  backgroundColor: "#FFF",
                  fontSize: "22px",
                  padding: "10px 5px",
                  border: "none",
                  borderBottom: "1px solid #000",
                  outline: "none",
                }}
                type="number"
                id="assignment_limit"
                onChange={(e) => setAssignmentLimit(Number(e.target.value))}
                value={assignmentLimit!}
              ></input>

              <label
                htmlFor="file_submission"
                style={{
                  fontFamily: "Lisu Bosa",
                  fontSize: "22px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px", // Space between label and checkbox
                }}
              >
                Requires File Submission:
                <input
                  type="checkbox"
                  id="file_submission"
                  onChange={(e) =>
                    setAssignmentRequiresFile(!assignmentRequiresFile)
                  }
                  checked={assignmentRequiresFile}
                  style={{
                    width: "24px", // Increase checkbox size
                    height: "24px",
                    cursor: "pointer",
                  }}
                  />
              </label>

              <button type="submit" className="red-btn">
                Create
              </button>
            </form>
          </>
        )}
        <h1 style={{ marginTop: "1rem" }} className="color-gray">
          All Assignments
        </h1>
        <hr />
        {assignments &&
          assignments.map((assignment) => (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                margin: "1rem 0",
              }}
            >
              <p
                style={{ fontSize: "22px", cursor: "pointer" }}
                onClick={() =>
                  navigate(
                    `/course_page/${kind}/${sectionId}/assignments/${assignment.id}`
                  )
                }
              >
                <i className="fa-solid fa-list-check"></i> &nbsp; {assignment.name}
              </p>
              <div>
                <p
                  style={{
                    display: "inline",
                    color:
                    new Date() > new Date(assignment.dueDate)
                    ? "red"
                    : "black",
                  }}
                  >
                  Due on{" "}
                  {new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  }).format(new Date(assignment.dueDate))}
                </p>
              </div>
            </div>
          ))}
      </div>
    </div>
  </>
  );
};

export default CourseAssignment;
