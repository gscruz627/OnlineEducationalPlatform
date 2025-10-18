import { useState, useEffect } from "react";
import "../src/App.css";
import "./styles/Instructors.css";
import state from "../store";
import { useSnapshot } from "valtio";
import { useNavigate, useParams, Link } from "react-router-dom";
import CommonSideBar from "../components/CommonSideBar";
import checkAuth from "../functions";
import Loading from "../components/Loading";

const Members = () => {
  const { kind } = useParams();

  const [loading, setLoading] = useState<boolean>(false);
  const snap = useSnapshot(state);
  const [searchTerm, setSearchTerm] = useState("");
  const SERVER_URL = import.meta.env["VITE_SERVER_URL"];

  // Data for Students and Instructors
  const [students, setStudents] = useState<Array<any>>([]);
  const [allStudents, setAllStudents] = useState<Array<any>>([]);
  const [instructors, setInstructors] = useState<Array<any>>([]);
  const [allInstructors, setAllInstructors] = useState<Array<any>>([]);
  const [editing, setEditing] = useState("");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  const navigate = useNavigate();

  useEffect(() => {
    if (kind === "instructor") {
      setStudents([]);
      getAllInstructors();
    } else if (kind === "student") {
      setInstructors([]);
      getAllStudents();
    } else {
      navigate("/404");
    }
  }, [kind]);

  const getAllInstructors = async () => {
    setLoading(true);
    try{
      await checkAuth(navigate);
      const request = await fetch(`${SERVER_URL}/api/users?role=instructor`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${state.token}`,
        },
      });
      const response = await request.json();
      if (request.ok) {
        setAllInstructors(response);
        setInstructors(response);
      }
    } catch(err: unknown){
      setErrorMsg("Something went wrong");
      return;
    } finally{
      setLoading(false);
    }
  };

  const getAllStudents = async () => {
    setLoading(true);
    try{
      await checkAuth(navigate);
      const request = await fetch(`${SERVER_URL}/api/users?role=student`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${state.token}`,
        },
      });
      const response = await request.json();
      if (request.ok) {
        setAllStudents(response);
        setStudents(response);
      }
    } catch(err: unknown){
      setErrorMsg("Something went wrong");
      return;
    } finally {
      setLoading(false);
    }
  };

  const executeEdit = async (e: React.FormEvent, i: number, id: string) => {
    setLoading(true);
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
    const selected = (kind === "instructor") ? instructors[i] : students[i];
    try {
      await checkAuth(navigate);
      request = await fetch(
        `${SERVER_URL}/api/users/${selected.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${state.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: editing,
            email: selected.email,
            role: selected.role,
            password: null
          }),
        }
      );
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
    } catch (error) {
      setErrorMsg("Something unexpected happened, Try Again!");
      setTimeout(() => {
        setErrorMsg("");
      }, 5000);
      return;
    }
    finally {
      setLoading(false);
    }
  };

  const editMember = (i: number) => {
    if (i === editIndex) {
      setEditIndex(null);
      setEditing("");
      return;
    }
    setEditIndex(i);
    setEditing(kind === "instructor" ? instructors[i].name : students[i].name);
  };

  const deleteMember = (i: number) => {
    if (i === deleteIndex) {
      setDeleteIndex(null);
      return;
    }
    setDeleteIndex(i);
  };

  const executeDelete = async (id: string) => {
    setLoading(true);
    let request = null;
    try {
      await checkAuth(navigate);
      request = await fetch(`${SERVER_URL}/api/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${state.token}`,
        },
      });
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
          kind![0].toUpperCase() + kind!.slice(1, kind!.length) + " was removed"
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
    } catch (error) {
      alert("Fatal! Error at deleting" + error);
      return;
    } finally{
      setLoading(false);
    }
  };

useEffect(() => {
  const search = searchTerm || "";

  if (kind === "instructor") {
    const filteredInstructors = (allInstructors || []).filter(
        (instructor: any) =>
          (instructor?.Email || "").toLowerCase().includes(search.toLowerCase()) ||
          (instructor?.Name || "").toLowerCase().includes(search.toLowerCase())
      );
      setInstructors(filteredInstructors);
    } else {
      const filteredStudents = (allStudents || []).filter(
        (student: any) =>
          (student?.Email || "").toLowerCase().includes(search.toLowerCase()) ||
          (student?.Name || "").toLowerCase().includes(search.toLowerCase())
      );
      setStudents(filteredStudents);
    }
  }, [searchTerm, allStudents, allInstructors, kind]);
  return (
    <>
    {loading && <Loading/>}
    <div className="context-menu">
      <CommonSideBar
        choice={kind}
        updater={kind === "instructor" ? setInstructors : setStudents}
      />
      <div>
        <form onSubmit={(e: React.FormEvent) => e.preventDefault()} style={{ marginBottom: "1rem" }}>
          <input
            placeholder="Ex. John Doe"
            className="input-with-side"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>
 
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
              <div className="delete-box" key={instructor.id}>
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
                    <i className="fa-solid fa-user-tie"></i>
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
                      style={{ backgroundColor: "#783600"}}
                      onClick={() => editMember(i)}
                    >
                      <i style={{ color: "#FFF"}} className="fa-solid fa-xmark"></i>
                    </button>
                  ) : (
                    <button
                    style={{ backgroundColor: "#AA6C39" }}
                      onClick={() => editMember(i)}
                    >
                      <i style={{color: "#FFF" }} className="fa-solid fa-pen-to-square"></i>
                    </button>
                  )}
                  {editIndex === i ? (
                    <button
                      style={{ backgroundColor: "#298D29", color: "#FFF" }}
                      onClick={(e) => executeEdit(e, i, instructor.id)}
                      >
                      <i className="fa-solid fa-check"></i>
                    </button>
                  ) : (
                    <button
                    style={{ backgroundColor: "brown", color: "#FFF" }}
                      onClick={() => deleteMember(i)}
                      >
                      <i className="fa-solid fa-trash"></i>
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
              <div className="delete-box" key={student.id}>
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
                    <i className="fa-solid fa-user"></i>
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
                      <i style={{ color: "#FFF"}} className="fa-solid fa-xmark"></i>
                    </button>
                  ) : (
                    <button
                    style={{ backgroundColor: "#AA6C39" }}
                      onClick={() => editMember(i)}
                    >
                      <i style={{color: "#FFF" }} className="fa-solid fa-pen-to-square"></i>
                    </button>
                  )}
                  {editIndex === i ? (
                    <button
                      style={{ backgroundColor: "#298D29", color: "#FFF" }}
                      onClick={(e) => executeEdit(e, i, student.id)}
                      >
                      <i className="fa-solid fa-check"></i>
                    </button>
                  ) : (
                    <button
                    style={{ backgroundColor: "brown", color: "#FFF" }}
                      onClick={() => deleteMember(i)}
                      >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  </>
  );
};

export default Members;
