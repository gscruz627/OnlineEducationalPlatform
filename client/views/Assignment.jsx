import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams, Link, useNavigate } from "react-router-dom";
import "../src/App.css";

const Assignment = () => {
  const { kind, sectionId, assignmentId } = useParams();
  const token = useSelector((state) => state.token);
  const user = useSelector((state) => state.user);
  const role = useSelector((state) => state.role);
  const enrollments = useSelector((state) => state.enrollments);
  const navigate = useNavigate();
  const SERVER_URL = process.env.REACT_APP_SERVER_URL;

  const [section, setSection] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [assignmentDate, setAssignmentDate] = useState(null);
  const [assignmentDescription, setAssignmentDescription] = useState("");
  const [assignmentLimit, setAssignmentLimit] = useState("");
  const [assignmentName, setAssignmentName] = useState("");
  const [assignmentRequiresFile, setAssignmentRequiresFile] = useState(false);
  const [submissions, setSubmissions] = useState(null);
  const [assignmentError, setAssignmentError] = useState("");
  const [assignmentSuccess, setAssignmentSucess] = useState("");
  const [submissionOpen, setSubmissionOpen] = useState(false);

  // For Student
  const [comment, setComment] = useState("");
  const [filename, setFilename] = useState("");

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
  };
  const loadAssignmentInfo = async () => {
    let request = null;
    try {
      request = await fetch(
        `${SERVER_URL}/api/assignments/${assignmentId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      alert("Fatal error, please reload");
    }
    if (request.ok) {
      const response = await request.json();
      setAssignment(response);
      setAssignmentDate(
        Intl.DateTimeFormat("en-CA").format(new Date(response.dueDate))
      );
      setAssignmentDescription(response.description);
      setAssignmentLimit(response.submissionLimit);
      setAssignmentName(response.name);
      setAssignmentRequiresFile(response.requiresFileSubmission);
    }
    const route =
      kind === "instructor"
        ? `${SERVER_URL}/api/assignments/submissions/${assignmentId}`
        : `${SERVER_URL}/api/assignments/submissions_student?studentId=${user.id}&assignmentId=${assignmentId}`;
    const submissionsRequest = await fetch(route, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (submissionsRequest.ok) {
      const submissionsResponse = await submissionsRequest.json();
      setSubmissions(submissionsResponse);
    }
  };

  const editAssignment = async (e) => {
    e.preventDefault();
    let request = null;
    try {
      request = await fetch(
        `${SERVER_URL}/api/assignments/${assignment.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            description: assignmentDescription,
            duedate: assignmentDate,
            isactive: true,
            name: assignmentName,
            sectionID: assignment.sectionID,
            submissionLimit: assignmentLimit,
            requiresFileSubmission: assignmentRequiresFile,
          }),
        }
      );
    } catch (error) {
      setAssignmentError(
        "Something wrong happened! Try again! Make sure all fields have valid values"
      );
      setTimeout(() => {
        setAssignmentError("");
      }, 5000);
      return;
    }
    if (!request.ok) {
      setAssignmentError(
        "Something wrong happened! Try again! Make sure all fields have valid values"
      );
      setTimeout(() => {
        setAssignmentError("");
      }, 5000);
      return;
    }
    const response = await request.json();
    setAssignmentSucess("Changes were saved!");
    setTimeout(() => {
      setAssignmentSucess("");
    }, 5000);
    setAssignment(response);
  };

  const executeCreateSubmission = async (e) => {
    e.preventDefault();
    if (new Date(assignment.dueDate) < new Date()) {
      setAssignmentError(
        "The submission date has passed while you had this submission box open! You are not able to submit anymore"
      );
      setTimeout(() => {
        setAssignmentError("");
      }, 5000);
      return;
    }
    let request = null;
    try {
      request = await fetch(`${SERVER_URL}/api/assignments/submit`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentID: user.id,
          assignmentID: assignmentId,
          comments: comment,
          submissionFilename: filename,
        }),
      });
    } catch (error) {
      setAssignmentError(
        "Something wrong happened! Make sure you follow correct format!"
      );
      setTimeout(() => {
        setAssignmentError("");
      }, 5000);
      return;
    }
    if (!request.ok) {
      setAssignmentError(
        "Something wrong happened! Make sure you follow correct format!"
      );
      setTimeout(() => {
        setAssignmentError("");
      }, 5000);
      return;
    }
    const response = await request.json();
    setSubmissions([...submissions, response]);
    setAssignmentSucess("Submission has been made!");
    setTimeout(() => {
      setAssignmentSucess("");
    }, 5000);
    setSubmissionOpen(false);
    setComment("");
    setFilename("");
  };
  useEffect(() => {
    if (!enrollments.includes(sectionId.toLowerCase())) {
      navigate("/404");
    }
    loadSectionInformation();
    loadAssignmentInfo();
  }, []);

  if (role !== kind) {
    navigate("/404");
  }
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
        {kind === "instructor" ? (
          <>
            <h1 className="color-gray">Edit Assignment</h1>
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

            <form
              style={{
                display: "flex",
                marginTop: "1rem",
                flexDirection: "column",
                gap: "10px",
              }}
              onSubmit={(e) => editAssignment(e)}
            >
              <label for="assignment_title">Title:</label>
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

              <label for="assignment_description">Description:</label>
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

              <label for="assignment_date">Due Date: </label>
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

              <label for="assignment_limit">Submission Limit: </label>
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
                onChange={(e) => setAssignmentLimit(e.target.value)}
                value={assignmentLimit}
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

              <button type="submit" className="blue-btn">
                Save
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="color-gray">{assignment && assignment.name}</h1>
            <hr />
            <p style={{ margin: "1rem 0" }}>
              {assignment && assignment.description}
            </p>
            <p
              style={{
                display: "inline",
                color:
                  new Date() >
                  (assignment ? new Date(assignment.dueDate) : new Date())
                    ? "red"
                    : "black",
              }}
            >
              Due on{" "}
              {new Intl.DateTimeFormat("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
              }).format(assignment ? new Date(assignment.dueDate) : new Date())}
            </p>
            <hr />
          </>
        )}
        <h1 style={{ marginTop: "1rem" }} className="color-gray">
          Submissions
        </h1>
        <hr />
        {submissions &&
          submissions[0] &&
          submissions.map((submission, i) => (
            <div className="member-item" key={i}>
              <div>
                <span
                  className="member-item-user-logo"
                  style={{ fontSize: "48px", textAlign: "center" }}
                >
                  &#128221;
                </span>
              </div>
              <div>
                {kind === "instructor" ? (
                  <h2>
                    <Link to={`/profile/${submission.studentId}`}>
                      {submission.studentName}
                    </Link>
                  </h2>
                ) : (
                  <h2>Submission {i + 1}</h2>
                )}
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
        {kind === "student" && submissions && (
          <>
            <p className="color-gray">
              Submission Count: {submissions.length} /{" "}
              {assignment && assignment.submissionLimit}{" "}
            </p>
            {assignment &&
              submissions.length < assignment.submissionLimit &&
              new Date(assignment.dueDate) > new Date() && (
                <button
                  style={{ margin: "1rem 0" }}
                  type="button"
                  className={submissionOpen ? "red-btn" : "blue-btn"}
                  onClick={() => setSubmissionOpen(!submissionOpen)}
                >
                  {submissionOpen ? "Cancel Submission" : "New Submission"}
                </button>
              )}
            <hr />
            {submissionOpen && (
              <form onSubmit={(e) => executeCreateSubmission(e)}>
                <h3>New Submission:</h3>
                <label for="comments">Comments: </label>
                <br />
                <textarea
                  style={{
                    width: "100%",
                    fontFamily: "Lisu Bosa",
                    backgroundColor: "#FFF",
                    fontSize: "22px",
                    padding: "10px 5px",
                    border: "none",
                    borderBottom: "1px solid #000",
                    outline: "none",
                  }}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  id="comments"
                ></textarea>

                {assignment && assignment.requiresFileSubmission && (
                  <>
                    <label for="filename">Submit a file</label>
                    <br />
                    <input
                      id="filename"
                      style={{
                        fontFamily: "Lisu Bosa",
                        backgroundColor: "#FFF",
                        fontSize: "22px",
                        padding: "10px 5px",
                        border: "none",
                        width: "min(400px, 100%)",
                      }}
                      onChange={(e) => setFilename(e.target.files[0].name)}
                      type="file"
                    ></input>
                  </>
                )}
                <br />
                <button
                  style={{ margin: "1rem 0", width: "100%" }}
                  className="blue-btn"
                  type="submit"
                >
                  Submit
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Assignment;
