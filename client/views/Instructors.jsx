import React, { useState, useEffect } from 'react'
import "../src/App.css"
import "../public/Instructors.css"
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CommonSideBar from '../components/CommonSideBar';

const Instructors = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searched, setSearched] = useState(false);
  const [searchCapture, setSearchCapture] = useState("");
  const [instructors, setInstructors] = useState(null);
  
  const token = useSelector( (state) => state.token);

  useEffect( () => {
    getAllInstructors();
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

  const editInstructor = async (i) => {
    const newname = prompt("Change the name of this instructor", instructors[i].name);
    if (instructors[i] && (newname == instructors[i].name)){
      return;
    }
    if (newname == "" || newname == null){
      alert("Need a non-empty name")
      return;
    }
    const instructorId = instructors[i].id;
    const request = await fetch(`https://localhost:7004/api/instructors/${instructors[i].id}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "text/plain"
      },
      body: newname
    });
    const response = await request.json();
    if (request.ok){
      setInstructors((prevInstructors) => 
        prevInstructors.map((instructor) => {
            if (instructor.id === instructorId) {
                return response;
            }
            return instructor;
        })
    );
    }
  }

  const deleteInstructor = async (id) => {
    const finalConfirm = confirm("Are you sure you want to remove this instructor?");
    if (finalConfirm === false){
      return;
    }
    const request = await fetch(`https://localhost:7004/api/instructors/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization" : `Bearer ${token}`
      }
    });
    if (request.ok) {
      setInstructors((prevInstructors) => 
          prevInstructors.filter((instructor) => instructor.id !== id)
      );
  }
  }
  return (
    <div className="context-menu">
      
      <CommonSideBar choice="instructor"/>
      <div>
        <h1>Manage Instructors</h1>
        <hr/>
        <p>In this section you can manage instructors and perform actions such as searching, creating, and deleting instructors.
          <br/>You can use the help menu that will display a sub-menu below it for help in navigating.
          <br/>Use the search bar to begin searching or use the create an instructor form.
        </p>

        <form onSubmit={(e) => search(e)}>
            <h1>Search Instructor</h1>
            <hr/>
            <p>Search an instructor by first and last name or email</p>
            <input placeholder="Ex. John Doe" className="generic-bar" type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
            <button className="blue-button" type="submit">Search</button>
        </form>

        <h1>Instructors {searched ? `(Searched: ${searchCapture})` : "" }</h1>
        {searchCapture && <span style={{color: "rgb(184, 65, 65)", cursor: "pointer"}} onClick={() => clearSearch()}>Clear Search</span>}
        <hr/>

        {instructors && instructors[0] && instructors.map( (instructor, i) => (
          <div className="instructor-item" >
            <p>- {instructor.name} ({instructor.email}) </p>
            <p><button className="blue-button" onClick={() => editInstructor(i)}>&#128221; </button> &nbsp; 
            <button className="red-button" onClick={() => deleteInstructor(instructor.id)}>×</button></p>
          </div>
        ))}
      </div>

    </div>
  )
}

export default Instructors