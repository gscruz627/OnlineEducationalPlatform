import React, { useState, useEffect } from "react";
import "../src/App.css";
import "./styles/Instructors.css";
import { useSelector } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import CommonSideBar from "../components/CommonSideBar";

const Instructors = () => {
  const { kind } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [searched, setSearched] = useState(false);
  const [searchCapture, setSearchCapture] = useState("");
  const SERVER_URL = process.env.REACT_APP_SERVER_URL;

  const [students, setStudents] = useState(null);

  const [instructors, setInstructors] = useState(null);
  const [editing, setEditing] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const token = useSelector((state) => state.token);
  const navigate = useNavigate();

  useEffect(() => {
    if (kind === "instructor") {
      setStudents(null);
      getAllInstructors();
    } else if (kind === "student") {
      setInstructors(null);
      getAllStudents();
    } else {
      navigate("/404");
    }
  }, [kind]);

  const getAllInstructors = async () => {
    const request = await fetch(`${SERVER_URL}/api/instructors`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const response = await request.json();
    if (request.ok) {
      setInstructors(response);
    }
  };

  const getAllStudents = async () => {
    const request = await fetch(`${SERVER_URL}/api/students`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const response = await request.json();
    if (request.ok) {
      setStudents(response);
    }
  };

  const search = async (e) => {
    e.preventDefault();
    if (searchTerm === "") {
      return;
    }
    setSearched(true);
    console.log(searchCapture, searched, searchTerm);

    const request = await fetch(
      `${SERVER_URL}/api/${kind}s/search?q=${searchTerm}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (request.ok) {
      setSearchCapture(searchTerm);
      const response = await request.json();
      console.log(response);

      kind === "instructor" ? setInstructors(response) : setStudents(response);
    }
  };

  const clearSearch = async () => {
    setSearched(false);
    setSearchCapture("");
    setSearchTerm("");
    kind === "instructor" ? await getAllInstructors() : await getAllStudents();
  };

  const executeEdit = async (e, i, id) => {
    e.preventDefault();
    if (
      (kind === "instructor" &&
        instructors[i] &&
        editing == instructors[i].name) ||
      (kind === "student" && students[i] && editing == students[i].name)
    ) {
      setEditIndex(null);
      setEditing("");
      return;
    }
    if (editing == "" || editing == null) {
      setErrorMsg("Name cannot be empty!");
      setTimeout(() => {
        setErrorMsg("");
      }, 5000);
      return;
    }
    let request = null;
    try {
      request = await fetch(
        `${SERVER_URL}/api/${kind}s/${
          kind === "instructor" ? instructors[i].id : students[i].id
        }`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "text/plain",
          },
          body: editing,
        }
      );
    } catch (error) {
      setErrorMsg("Something unexpected happened, Try Again!");
      setTimeout(() => {
        setErrorMsg("");
      }, 5000);
      return;
    }
    if (request.ok) {
      const response = await request.json();
      if (kind === "instructor") {
        setInstructors((prevInstructors) =>
          prevInstructors.map((instructor) => {
            if (instructor.id === id) {
              return response;
            }
            return instructor;
          })
        );
      } else {
        setStudents((prevStudents) =>
          prevStudents.map((student) => {
            if (student.id === id) {
              return response;
            }
            return student;
          })
        );
      }
      setEditIndex(null);
      setEditing("");
      setSuccessMsg("Changes were saved");
      setTimeout(() => {
        setSuccessMsg("");
      }, 5000);
    }
  };

  const editMember = (i) => {
    if (i === editIndex) {
      setEditIndex(null);
      setEditing("");
      return;
    }
    setEditIndex(i);
    setEditing(kind === "instructor" ? instructors[i].name : students[i].name);
  };

  const deleteMember = (i) => {
    if (i === deleteIndex) {
      setDeleteIndex(null);
      return;
    }
    setDeleteIndex(i);
  };

  const executeDelete = async (id) => {
    let request = null;
    try {
      request = await fetch(`${SERVER_URL}/api/${kind}s/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      alert("Fatal! Error at deleting" + error);
      return;
    }
    if (request.ok) {
      if (kind === "instructor") {
        setInstructors((prevInstructors) =>
          prevInstructors.filter((instructor) => instructor.id !== id)
        );
      } else {
        setStudents((prevStudents) =>
          prevStudents.filter((student) => student.id !== id)
        );
      }
      setSuccessMsg(
        kind[0].toUpperCase() + kind.slice(1, kind.length) + " was removed"
      );
      setTimeout(() => {
        setSuccessMsg("");
      }, 5000);
    } else if (request.status === 400) {
      const response = await request.json();
      if (response.count) {
        setErrorMsg(
          `This instructor is currently teaching ${response.count} courses! Please expell first`
        );
        setTimeout(() => {
          setErrorMsg("");
        }, 5000);
      }
    }
    setDeleteIndex(null);
  };
  return (
    <div className="context-menu">
      <CommonSideBar
        choice={kind}
        updater={kind === "instructor" ? setInstructors : setStudents}
      />
      <div>
        <form onSubmit={(e) => search(e)} style={{ marginBottom: "1rem" }}>
          <input
            placeholder="Ex. John Doe"
            className="input-with-side"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="blue-btn side-with-input" type="submit">
            Search
          </button>
        </form>

        <h1 className="color-gray">
          {kind[0].toUpperCase() + kind.slice(1).toLowerCase()}s{" "}
          {searched ? `(Searched: ${searchCapture})` : ""}
        </h1>
        {searchCapture && (
          <span
            style={{ color: "rgb(184, 65, 65)", cursor: "pointer" }}
            onClick={() => clearSearch()}
          >
            Clear Search
          </span>
        )}
        <hr />

        {successMsg !== "" && (
          <div style={{ marginTop: "1rem" }} className="success-box">
            <p>{successMsg}</p>
          </div>
        )}

        {errorMsg != "" && (
          <div style={{ marginTop: "1rem" }} className="error-box">
            <p>{errorMsg}</p>
          </div>
        )}

        {instructors &&
          instructors[0] &&
          instructors.map((instructor, i) => {
            return deleteIndex === i ? (
              <div className="delete-box">
                <h2>
                  Are you sure you want to delete{" "}
                  {instructors[deleteIndex].name}?
                </h2>
                <div>
                  <button
                    style={{ color: "brown" }}
                    onClick={() => executeDelete(instructors[deleteIndex].id)}
                  >
                    Yes
                  </button>
                  <button
                    style={{
                      backgroundColor: "brown",
                      border: "1px solid #FFF",
                      color: "#FFF",
                    }}
                    onClick={() => deleteMember(deleteIndex)}
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
                  {i === editIndex ? (
                    <form onSubmit={(e) => executeEdit(e, i, instructor.id)}>
                      <input
                        className="inline-input"
                        type="text"
                        value={editing}
                        onChange={(e) => setEditing(e.target.value)}
                      />
                    </form>
                  ) : (
                    <h2>
                      <Link to={`/profile/${instructor.id}`}>
                        {instructor.name}
                      </Link>
                    </h2>
                  )}
                  <small style={{ fontSize: "18px" }} className="color-gray">
                    {instructor.email}
                  </small>
                </div>
                <div className="member-item-buttons">
                  {editIndex === i ? (
                    <button
                      style={{ backgroundColor: "#783600" }}
                      onClick={() => editMember(i)}
                    >
                      &#128683;
                    </button>
                  ) : (
                    <button
                      style={{ backgroundColor: "#AA6C39" }}
                      onClick={() => editMember(i)}
                    >
                      &#128221;
                    </button>
                  )}
                  {editIndex === i ? (
                    <button
                      style={{ backgroundColor: "#298D29", color: "#FFF" }}
                      onClick={(e) => executeEdit(e, i, instructor.id)}
                    >
                      &#10003;
                    </button>
                  ) : (
                    <button
                      style={{ backgroundColor: "brown", color: "#FFF" }}
                      onClick={() => deleteMember(i)}
                    >
                      &#128465;
                    </button>
                  )}
                </div>
              </div>
            );
          })}

        {students &&
          students[0] &&
          students.map((student, i) => {
            return deleteIndex === i ? (
              <div className="delete-box">
                <h2>
                  Are you sure you want to delete {students[deleteIndex].name}?
                </h2>
                <div>
                  <button
                    style={{ color: "brown" }}
                    onClick={() => executeDelete(students[deleteIndex].id)}
                  >
                    Yes
                  </button>
                  <button
                    style={{
                      backgroundColor: "brown",
                      border: "1px solid #FFF",
                      color: "#FFF",
                    }}
                    onClick={() => deleteMember(deleteIndex)}
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
                  {i === editIndex ? (
                    <form onSubmit={(e) => executeEdit(e, i, student.id)}>
                      <input
                        className="inline-input"
                        type="text"
                        value={editing}
                        onChange={(e) => setEditing(e.target.value)}
                      />
                    </form>
                  ) : (
                    <h2>
                      <Link to={`/profile/${student.id}`}>{student.name}</Link>
                    </h2>
                  )}
                  <small style={{ fontSize: "18px" }} className="color-gray">
                    {student.email}
                  </small>
                </div>
                <div className="member-item-buttons">
                  {editIndex === i ? (
                    <button
                      style={{ backgroundColor: "#783600" }}
                      onClick={() => editMember(i)}
                    >
                      &#128683;
                    </button>
                  ) : (
                    <button
                      style={{ backgroundColor: "#AA6C39" }}
                      onClick={() => editMember(i)}
                    >
                      &#128221;
                    </button>
                  )}
                  {editIndex === i ? (
                    <button
                      style={{ backgroundColor: "#298D29", color: "#FFF" }}
                      onClick={(e) => executeEdit(e, i, student.id)}
                    >
                      &#10003;
                    </button>
                  ) : (
                    <button
                      style={{ backgroundColor: "brown", color: "#FFF" }}
                      onClick={() => deleteMember(i)}
                    >
                      &#128465;
                    </button>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default Instructors;
