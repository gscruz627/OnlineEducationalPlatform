import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import "../src/App.css";
import "../views/styles/Instructors.css";
import "../views/styles/Auth.css";

const CommonSideBar = ({ choice, updater }) => {
  const [title, setTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [memberName, setMemberName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const SERVER_URL = import.meta.env["VITE_SERVER_URL"];

  const token = useSelector((state) => state.token);

  useEffect(() => {
    setMemberName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  }, [choice]);

  const executeCreate = async (e) => {
    e.preventDefault();
    try {
      if (choice === "course") {
        await executeCreateCourse();
      } else if (choice === "instructor" || choice === "student") {
        await executeCreateMember();
      }
    } catch (error) {
      console.error("Error during execution:", error);
    }
  };

  const executeCreateCourse = async () => {
    if (!title || !courseCode) {
      displayError("Title and Course Code must have a value.");
      return;
    }

    try {
      const request = await fetch(`${SERVER_URL}/api/courses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title,
          courseCode: courseCode,
          imageUrl: imageUrl || "https://cdn.pixabay.com/photo/2016/11/26/15/14/mountains-1860897_1280.jpg",
        }),
      });

      if (!request.ok) {
        displayError("Invalid: Name or code already exists.");
        return;
      }

      const response = await request.json();
      updater((prev) => [...prev, response]);

      displaySuccess("Course was created!");
    } catch (error) {
      displayError("Something went wrong, please try again.");
    }
  };

  const executeCreateMember = async () => {
    if (!memberName || !email || !password || !confirmPassword) {
      displayError("Name, Email, and Password must have a value.");
      return;
    }
    if (memberName.length < 3) {
      displayError("Name must have at least 3 characters.");
      return;
    }
    if (password.length < 8) {
      displayError("Password must have at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      displayError("Passwords must match.");
      return;
    }

    try {
      const request = await fetch(`${SERVER_URL}/api/${choice}s/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: email,
          name: memberName,
          password: password,
        }),
      });

      if (!request.ok) {
        displayError("Invalid: Name (or email) already exists.");
        return;
      }

      const response = await request.json();
      updater((prev) => [...prev, response]);

      displaySuccess("User was registered!");
    } catch (error) {
      displayError("Something went wrong, please try again.");
    }
  };

  const displayError = (message) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(""), 5000);
  };

  const displaySuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 5000);
  };

  return (
    <form className="form-container" onSubmit={executeCreate}>
      <h1>
        {choice === "course" && "Create Course"}
        {choice === "instructor" && "Register Instructor"}
        {choice === "student" && "Register Student"}
      </h1>

      {errorMessage && <div style={{ width: "75%" }} className="error-box">{errorMessage}</div>}
      {successMessage && <div style={{ width: "75%" }} className="success-box">{successMessage}</div>}

      {choice === "course" && (
        <>
          <label htmlFor="c_title">Course Title:</label>
          <input placeholder="Ex. College Algebra" id="c_title" type="text" onChange={(e) => setTitle(e.target.value)} value={title} />

          <label htmlFor="c_code">Course Code:</label>
          <input placeholder="Ex. MATH 100" id="c_code" type="text" onChange={(e) => setCourseCode(e.target.value)} value={courseCode} />

          <label htmlFor="c_image">Course Image:</label>
          <input id="c_image" type="text" onChange={(e) => setImageUrl(e.target.value)} value={imageUrl} />
          {imageUrl && (
            <div className="image-holder">
              <img className="image-holder-img" src={imageUrl} alt="Course Preview" />
            </div>
          )}
        </>
      )}

      {(choice === "instructor" || choice === "student") && (
        <>
          <label htmlFor="i_name">Name:</label>
          <input id="i_name" type="text" onChange={(e) => setMemberName(e.target.value)} value={memberName} />

          <label htmlFor="email">Email:</label>
          <input id="email" type="email" onChange={(e) => setEmail(e.target.value)} value={email} />

          <label htmlFor="password">Password:</label>
          <input id="password" type="password" onChange={(e) => setPassword(e.target.value)} value={password} />

          <label htmlFor="c_password">Confirm Password:</label>
          <input id="c_password" type="password" onChange={(e) => setConfirmPassword(e.target.value)} value={confirmPassword} />
        </>
      )}

      <button style={{ width: "75%" }} className="red-btn" type="submit">Create</button>
    </form>
  );
};

export default CommonSideBar;
