import React, { useState, useEffect } from 'react'
import "../src/App.css"
import "../public/Instructors.css"
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import CommonSideBar from '../components/CommonSideBar';

const Instructors = () => {
  const { kind } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [searched, setSearched] = useState(false);
  const [searchCapture, setSearchCapture] = useState("");
  const [instructors, setInstructors] = useState(null);
  const [editing, setEditing] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);

  const [successEdit, setSucessEdit] = useState(false);
  const [failedEdit, setFailedEdit] = useState(null);
  const token = useSelector( (state) => state.token);
  const navigate = useNavigate();

  useEffect( () => {
    if (kind === "instructor") {
      getAllInstructors();
    } else if (kind === "student") {
      
    }
    else {
      navigate("/404")
    }
    }, [])

  const getAllInstructors = async () => {
    const request = await fetch('https://localhost:7004/api/instructors', {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    const response = await request.json();
    if(request.ok){
      setInstructors(response);
    }
  }

  const search = async (e) => {
    e.preventDefault();
    if (searchTerm === ""){
      return;
    }
    setSearched(true);
    setSearchCapture(searchTerm);
    
    const request = await fetch(`https://localhost:7004/api/instructors/search?q=${searchTerm}`, {
      method: "GET",
      headers: {
        "Authorization" : `Bearer ${token}`
      }
    })
    const response = await request.json();
    if(request.ok){
      setInstructors(response)
    }
  }

  const clearSearch = async () => {
    setSearched(false);
    setSearchCapture(null);
    setSearchTerm("");
    await getAllInstructors();
  }

  const executeEdit = async (e, i, id) => {
    e.preventDefault();
    if (instructors[i] && (editing == instructors[i].name)){
      setEditIndex(null);
      setEditing("");
      return;
    }   
    if (editing == "" || editing == null){
      setFailedEdit("Name cannot be empty!");
      setTimeout( () => {
        setFailedEdit(null);
      }, 5000)
      return;
    }
    let request = null;
    try{  
      request = await fetch(`https://localhost:7004/api/instructors/${instructors[i].id}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "text/plain"
        },
        body: editing
      });
    } catch (error){
      setFailedEdit("Something unexpected happened, Try Again!");
      setTimeout( () => {
        setFailedEdit(null);
      }, 5000)
      return;
    }
    if (request.ok){
      const response = await request.json();
      setInstructors((prevInstructors) => 
        prevInstructors.map((instructor) => {
            if (instructor.id === id) {
                return response;
            }
            return instructor;
        })
      );
      setEditIndex(null);
      setEditing("");
      setSucessEdit(true);
      setTimeout(() => {
        setSucessEdit(false);
      },5000);
    }
  }

  const editInstructor = (i) => {
    if (i === editIndex){
      setEditIndex(null);
      setEditing("");
      return;
    } 
    setEditIndex(i);
    setEditing(instructors[i].name)
  }

  const deleteInstructor = (i) => {
      if (i === deleteIndex){
        setDeleteIndex(null);
        return;
      }
      setDeleteIndex(i);
   }
   
   const executeDelete = async (id) => {
    let request = null;
    try {
      request = await fetch(`https://localhost:7004/api/instructors/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization" : `Bearer ${token}`
        }
      });
    } catch(error){
      alert("Fatal! Error at deleting");
      return;
    }
    if (request.ok) {
      setInstructors((prevInstructors) => 
          prevInstructors.filter((instructor) => instructor.id !== id)
      );
    }
    setDeleteIndex(null);
  }
  return (
    <div className="context-menu">
      
      <CommonSideBar choice="instructor"/>
      <div>
        <form onSubmit={(e) => search(e)} style={{"marginBottom" : "1rem"}}>
            <input placeholder="Ex. John Doe" className="input-with-side" type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
            <button className="blue-btn side-with-input" type="submit">Search</button>
        </form>

        <h1 className="color-gray">Instructors {searched ? `(Searched: ${searchCapture})` : "" }</h1>
        {searchCapture && <span style={{color: "rgb(184, 65, 65)", cursor: "pointer"}} onClick={() => clearSearch()}>Clear Search</span>}
        <hr/>

        {successEdit && 
          <div style={{marginTop: "1rem"}} className="success-box">
            <p>Changes were saved!</p>
          </div>
        }

        {failedEdit && 
          <div style={{marginTop: "1rem"}} className="error-box">
            <p>Name cannot be empty!</p>
          </div>
        }

        {instructors && instructors[0] && instructors.map((instructor, i) => {
          return (
            deleteIndex === i ? (
              <div className='delete-box'>
                <h2>Are you sure you want to delete {instructors[deleteIndex].name}?</h2>
                <div>
                  <button style={{color: "brown"}} onClick={() => executeDelete(instructors[deleteIndex].id)}>Yes</button>
                  <button style={{backgroundColor: "brown", border: "1px solid #FFF", color: "#FFF"}} onClick={() => deleteInstructor(deleteIndex)}>No</button>
                </div>
              </div>
            ) : (
              <div className="member-item" key={i}>
                <div>
                  <span className="member-item-user-logo" style={{ fontSize: "48px", textAlign: "center" }}>&#128100;</span>
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
                    <h2>{instructor.name}</h2>
                  )}
                  <small style={{ fontSize: "18px" }} className="color-gray">
                    {instructor.email}
                  </small>
                </div>
                <div className="member-item-buttons">
                  {editIndex === i ? (
                    <button
                      style={{ backgroundColor: "#783600" }}
                      onClick={() => editInstructor(i)}
                    >
                      &#128683;
                    </button>
                  ) : (
                    <button
                      style={{ backgroundColor: "#AA6C39" }}
                      onClick={() => editInstructor(i)}
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
                      onClick={() => deleteInstructor(i)}
                    >
                      &#128465;
                    </button>
                  )}
                </div>
              </div>
            )
          );
})}
      </div>

    </div>
  )
}

export default Instructors