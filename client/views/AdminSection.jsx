import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import "../src/App.css";
import "./styles/Instructors.css";
import "./styles/CourseAndSection.css";

const Section = () => {
  const { sectionId } = useParams();
  const token = useSelector((state) => state.token);
  const navigate = useNavigate();
  const SERVER_URL = process.env.REACT_APP_SERVER_URL;

  const [section, setSection] = useState("");
  const [sectionCode, setSectionCode] = useState("");
  const [instructorId, setInstructorId] = useState("");
  const [students, setStudents] = useState("");
  const [instructors, setInstructors] = useState(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [confirmActive, setConfirmActive] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [expellIndex, setExpellIndex] = useState(null);

  const [errorExpell, setErrorExpell] = useState("");
  const [successExpell, setSuccessExpell] = useState("");

  const handleFetchError = (error) => {
    setErrorMessage(error);
    setTimeout(() => setErrorMessage(""), 5000);
  };

  const handleFetchSuccess = (success) => {
    setSuccessMessage(success);
    setTimeout(() => setSuccessMessage(""), 5000);
  };

  const loadSectionInfo = async () => {
    try {
      const request = await fetch(
        `${SERVER_URL}/api/sections/${sectionId}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (request.status === 404) {
        navigate("/NotFound");
        return;
      }
      const response = await request.json();
      setSection(response);
    } catch (error) {
      handleFetchError("Something went wrong! Try Again");
    }
  };

  const loadInstructors = async () => {
    try {
      const request = await fetch(`${SERVER_URL}/api/instructors`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const response = await request.json();
      if (request.ok) setInstructors(response);
    } catch (error) {
      handleFetchError("Failed to load instructors.");
    }
  };

  const loadStudents = async () => {
    try {
      const request = await fetch(
        `${SERVER_URL}/api/sections/${sectionId}/students`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const response = await request.json();
      if (request.ok) setStudents(response);
    } catch (error) {
      handleFetchError("Failed to load students.");
    }
  };

  useEffect(() => {
    loadSectionInfo();
    loadInstructors();
    loadStudents();
  }, []);

  useEffect(() => {
    setInstructorId(section.instructorID);
    setSectionCode(section.sectionCode);
  }, [section]);

  const edit = async (e) => {
    e.preventDefault();
    if (
      sectionCode === section.sectionCode &&
      instructorId === section.InstructorID
    )
      return;
    console.log(section.courseId, section.courseID, sectionCode, instructorId);

    try {
      const request = await fetch(
        `${SERVER_URL}/api/sections/${sectionId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            courseId: section.courseId ? section.courseId : section.courseID,
            sectionCode,
            instructorId,
          }),
        }
      );

      if (!request.ok) {
        handleFetchError("There is a section with that code already!");
        setSectionCode(section.sectionCode);
        setInstructorId(section.InstructorID);
        return;
      }

      const response = await request.json();
      setSection(response);
      setSectionCode(response.sectionCode);
      setInstructorId(response.instructorID);
      handleFetchSuccess("Changes were saved!");
    } catch (error) {
      handleFetchError("Something went wrong! Try Again");
    }
  };

  const switchActive = async () => {
    try {
      const request = await fetch(
        `${SERVER_URL}/api/sections/${sectionId}/set_active`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!request.ok) {
        handleFetchError("Something wrong happened! Try again");
        return;
      }

      const response = await request.json();
      setSection(response);
      setConfirmActive(false);
      handleFetchSuccess("Changes were saved!");
    } catch (error) {
      handleFetchError("Something wrong happened! Try again");
    }
  };

  const deleteSection = async () => {
    try {
      const request = await fetch(
        `${SERVER_URL}/api/sections/${sectionId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (request.ok) {
        handleFetchSuccess(
          "Section was removed! You will be redirected in 5 seconds"
        );
        setTimeout(() => {
          navigate(
            `/admin_individual_course/${
              section.courseID ? section.courseID : section.courseId
            }`
          );
        }, 5000);
      }
    } catch (error) {
      handleFetchError("Something wrong happened! Try again");
    }
  };

  const executeExpell = async (studentId) => {
    try {
      const request = await fetch(
        `${SERVER_URL}/api/sections/expell`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            memberId: studentId,
            sectionId,
          }),
        }
      );

      if (request.ok) {
        setSuccessExpell("Student was expelled successfully");
        setStudents((prevStudents) =>
          prevStudents.filter((student) => student.id !== studentId)
        );
        setTimeout(() => setSuccessExpell(""), 5000);
      }
    } catch (error) {
      setErrorExpell("Something wrong happened! Try again");
      setTimeout(() => setErrorExpell(""), 5000);
    }
  };

  return (
    <div className="context-menu">
      <form className="form-container" onSubmit={edit}>
        <Link to={`/admin_individual_course/${section.courseID}`}>
          Back to: "{section.title}"
        </Link>
        <h1>Edit Section</h1>
        {errorMessage && (
          <div style={{ width: "75%" }} className="error-box">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div style={{ width: "75%" }} className="success-box">
            {successMessage}
          </div>
        )}

        <label htmlFor="c_code">Section Code: </label>
        <input
          placeholder="Ex. 1"
          id="c_code"
          type="number"
          onChange={(e) => setSectionCode(e.target.value)}
          value={sectionCode}
        />

        <label htmlFor="c_instructor">Instructor: </label>
        <select
          id="c_instructor"
          value={instructorId}
          onChange={(e) => setInstructorId(e.target.value)}
        >
          {instructors &&
            instructors.map((instructor, i) => (
              <option key={i} value={instructor.id}>
                {instructor.name}
              </option>
            ))}
        </select>

        <a
          onClick={() => setConfirmActive(true)}
          style={{
            cursor: "pointer",
            fontWeight: "bolder",
            color: section.isActive ? "brown" : "#298D29",
            marginTop: "1rem",
            fontSize: "22px",
            textDecoration: "underline",
          }}
        >
          Set to {section.isActive ? "Inactive" : "Active"}
        </a>

        {confirmActive && (
          <div style={{ width: "75%", textAlign: "center", marginBottom: 0 }}>
            <p>
              Are you sure you want to change this section's active status?
              Students and staff will be unable to view announcements or
              assignments.
            </p>
            <button onClick={switchActive}>Yes</button>
            <button onClick={() => setConfirmActive(false)}>Cancel</button>
          </div>
        )}

        <button style={{ width: "75%" }} className="red-btn" type="submit">
          Save
        </button>

        <a
          onClick={() => setConfirmDelete(true)}
          style={{
            cursor: "pointer",
            fontWeight: "bolder",
            color: "brown",
            marginBottom: "1rem",
            fontSize: "22px",
            textDecoration: "underline",
          }}
        >
          Delete this section
        </a>

        {confirmDelete && (
          <div style={{ width: "75%", textAlign: "center", marginBottom: 0 }}>
            <p>
              Are you sure you want to delete this section? All enrollments will
              be dropped and access will no longer be possible?
            </p>
            <button onClick={deleteSection}>Yes</button>
            <button onClick={() => setConfirmDelete(false)}>Cancel</button>
          </div>
        )}
      </form>

      <div>
        <h1 style={{ textAlign: "center" }}>
          {section.courseCode} -{section.sectionCode}
        </h1>
        <h1 className="color-gray">Students Enrolled</h1>
        <hr />
        {errorExpell && <div className="error-box">{errorExpell}</div>}
        {successExpell && <div className="success-box">{successExpell}</div>}

        {students &&
          students[0] &&
          students.map((student, i) =>
            expellIndex === i ? (
              <div className="delete-box">
                <h2>
                  Are you sure you want to expell {students[expellIndex].name}?
                </h2>
                <div>
                  <button
                    style={{ color: "brown" }}
                    onClick={() => executeExpell(students[expellIndex].id)}
                  >
                    Yes
                  </button>
                  <button
                    style={{
                      backgroundColor: "brown",
                      border: "1px solid #FFF",
                      color: "#FFF",
                    }}
                    onClick={() => setExpellIndex(null)}
                  >
                    No
                  </button>
                </div>
              </div>
            ) : (
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
                <div className="member-item-buttons">
                  <button
                    style={{
                      backgroundColor: "brown",
                      color: "#FFF",
                      height: "100%",
                    }}
                    onClick={() => setExpellIndex(i)}
                  >
                    &#128465;
                  </button>
                </div>
              </div>
            )
          )}
      </div>
    </div>
  );
};

export default Section;
