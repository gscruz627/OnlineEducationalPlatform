import React, { useState } from 'react'
import "../src/App.css"
import "../public/instructors.css"
import { useNavigate } from 'react-router-dom';

const CommonSideBar = ({choice}) => {
  const [selection, setSelection] = useState("");
  const navigate = useNavigate();
  return (
    <div className="side-bar">
        <h2 style={{display: "inline-block", paddingButtom: "10px"}}>&#128221; Menu </h2> &nbsp; &nbsp;<span style={{cursor: "pointer"}} onClick={() => setSelection("")}>Clear ×</span>
        <div className="side-bar-item">
          <ul>
            <li onClick={() => {setSelection("search"); navigate(`/${choice}s`)}}>- Search {choice}</li>
            <li onClick={() => {setSelection("delete"); navigate(`/${choice}s`)}}>- Delete {choice}</li>
            <li onClick={() => navigate(`/create${choice}`)}>- Create {choice}</li>
            <li onClick={() => {setSelection("edit"); navigate(`/${choice}s`)}}>- Edit {choice}</li>
          </ul>
        </div>

        <div className="side-bar-item" style={{display: selection ? "block" : "none"}}>
          {(selection === "search") && 
            <>
            <h2>Search</h2>
            <p>To Search for a(n) {choice}, type his or her name, part of it, or part of their email on the search bar under "Search".</p>
            </>
          } {(selection === "delete") && 
            <>
            <h2>Delete</h2>
            <p>To Delete a(n) {choice}, after finding that {choice}, click on the red 'x' button and confirm their deletion.</p>
            </>
          } {(selection === "edit") && 
            <>
            <h2>Edit</h2>
            <p>To Edit (only the name) of a(n) {choice}, click on the paper and pencil button in blue and type their new name. You must actually type something.</p>
            </>
          }
        </div>
      </div>
  )
}

export default CommonSideBar;