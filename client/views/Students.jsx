import React, { useState, useEffect } from 'react'
import "../src/App.css"
import "../public/Instructors.css"
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CommonSideBar from '../components/CommonSideBar';

const Students = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searched, setSearched] = useState(false);
  const [searchCapture, setSearchCapture] = useState("");
  const [students, setStudents] = useState(null);
  
  const token = useSelector( (state) => state.token);

  useEffect( () => {
    getAllStudents();
  }, [])

  const getAllStudents = async () => {
    const request = await fetch('https://localhost:7004/api/students', {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    const response = await request.json();
    if(request.ok){
      setStudents(response);
    }
  }

  const search = async (e) => {
    e.preventDefault();
    if (searchTerm === ""){
      return;
    }
    setSearched(true);
    setSearchCapture(searchTerm);
    
    const request = await fetch(`https://localhost:7004/api/students/search?q=${searchTerm}`, {
      method: "GET",
      headers: {
        "Authorization" : `Bearer ${token}`
      }
    })
    const response = await request.json();
    if(request.ok){
      setStudents(response)
    }
  }

  const clearSearch = async () => {
    setSearched(false);
    setSearchCapture(null);
    setSearchTerm("");
    await getAllStudents();
  }

  const editStudent = async (i) => {
    const newname = prompt("Change the name of this student", students[i].name);
    if (students[i] && (newname == students[i].name)){
      return;
    }
    if (newname == "" || newname == null){
      alert("Need a non-empty name")
      return;
    }
    const studentId = students[i].id;
    const request = await fetch(`https://localhost:7004/api/students/${students[i].id}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "text/plain"
      },
      body: newname
    });

    const response = await request.json();
    if (request.ok){
      setStudents((prevStudents) => 
        prevStudents.map((student) => {
            if (student.id === studentId) {
                return response;
            }
            return student;
        })
    );
    }
  }

  const deleteStudent = async (id) => {
    const finalConfirm = confirm("Are you sure you want to remove this student?");
    if (finalConfirm === false){
      return;
    }
    const request = await fetch(`https://localhost:7004/api/students/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization" : `Bearer ${token}`
      }
    });
    if (request.ok) {
      setStudents((prevStudents) => 
          prevStudents.filter((student) => student.id !== id)
      );
  }
  }
  return (
    <div className="context-menu">
      
      <CommonSideBar choice="student"/>
      <div>
        <h1>Manage Students</h1>
        <hr/>
        <p>In this section you can manage students and perform actions such as searching, creating, and deleting students.
          <br/>You can use the help menu that will display a sub-menu below it for help in navigating.
          <br/>Use the search bar to begin searching or use the create a student form.
        </p>

        <form onSubmit={(e) => search(e)}>
            <h1>Search Student</h1>
            <hr/>
            <p>Search a student by first and last name or email</p>
            <input placeholder="Ex. John Doe" className="generic-bar" type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
            <button className="blue-button" type="submit">Search</button>
        </form>

        <h1>Students {searched ? `(Searched: ${searchCapture})` : "" }</h1>
        {searchCapture && <span style={{color: "rgb(184, 65, 65)", cursor: "pointer"}} onClick={() => clearSearch()}>Clear Search</span>}
        <hr/>

        {students && students[0] && students.map( (student, i) => (
          <div className="instructor-item" >
            <p>- {student.name} ({student.email}) </p>
            <p><button className="blue-button" onClick={() => editStudent(i)}>&#128221; </button> &nbsp; 
            <button className="red-button" onClick={() => deleteStudent(student.id)}>×</button></p>
          </div>
        ))}
      </div>

    </div>
  )
}

export default Students