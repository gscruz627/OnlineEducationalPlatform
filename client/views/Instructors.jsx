import React, { useState, useEffect } from 'react'
import "../src/App.css"
import "../public/Instructors.css"
import { useSelector } from 'react-redux';

const Instructors = () => {
  const [selection, setSelection] = useState(null);
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
      console.log(instructors);
    }
  }

  const search = (e) => {
    setSearched(true);
    setSearchCapture(searchTerm);
    e.preventDefault();
  }

  const editInstructor = (i) => {
    
  }

  const deleteInstructor = (id) => {

  }
  return (
    <div className="context-menu">
      <div className="side-bar">
        <h2>&#128221; Help</h2>
        <div className="side-bar-item">
          <ul>
            <li onClick={() => changeSelection("search")}>- Search for an instructor</li>
            <li onClick={() => changeSelection("delete")}>- Delete an instructor</li>
            <li onClick={() => changeSelection("create")}>- Create and instructor</li>
            <li onClick={() => changeSelection("edit")}>- Edit an instructor</li>
          </ul>
        </div>

        <div className="side-bar-item" style={{display: selection ? "block" : "none"}}>
          <p>{selection}</p>
        </div>
      </div>

      <div>
        <h1>Manage Instructors</h1>
        <hr/>
        <p>In this section you can manage instructors and perform actions such as searching, creating, and deleting instructors.
          <br/>You can use the help menu that will display a sub-menu below it for help in navigating.
          <br/>Use the search bar to begin searching or use the create an instructor form.
        </p>

        <form onSubmit={(e) => search(e)}>
            <h1>Search instructor</h1>
            <hr/>
            <p>Search an instructor by first and last name</p>
            <input placeholder="Ex. John Doe" className="generic-bar" type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
            <button className="blue-button" type="submit">Search</button>
        </form>

        <h1>Instructors {searched ? `(Searched: ${searchCapture})` : "" }</h1>
        <hr/>

        {instructors && instructors.map( (instructor, i) => (
          <div className="instructor-item">
            <p>- {instructor.name} ({instructor.email}) </p>
            <p><button onClick={() => editInstructor(i)}></button> &nbsp; <button onClick={() => deleteInstructor(instructor.id)}>×</button></p>
          </div>
        ))}
      </div>

    </div>
  )
}

export default Instructors