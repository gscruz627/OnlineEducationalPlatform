import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import "./styles/CourseAndSection.css";

const AdminCourse = () => {
  const { courseId } = useParams();
  const token = useSelector((state) => state.token);
  const navigate = useNavigate();
  const SERVER_URL = import.meta.env["VITE_SERVER_URL"];


  const [course, setCourse] = useState("");
  const [title, setTitle] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sections, setSections] = useState(null);
  const [instructors, setInstructors] = useState(null);

  const [newSectionCode, setNewSectionCode] = useState("");
  const [selectedInstructor, setSelectedInstructor] = useState(null);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [sectionSuccess, setSectionSuccess] = useState("");
  const [sectionError, setSectionError] = useState("");

  const [confirmDelete, setConfirmDelete] = useState(false);

  const loadCourseInfo = async () => {
    try {
      const request = await fetch(
        `${SERVER_URL}/api/courses/${courseId}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (request.status === 404) {
        navigate("/404");
        return;
      }

      const response = await request.json();
      setCourse(response);
      setTitle(response.title);
      setCourseCode(response.courseCode);
      setImageUrl(
        response.imageURL ===
          "https://cdn.pixabay.com/photo/2016/11/26/15/14/mountains-1860897_1280.jpg"
          ? "Default"
          : response.imageURL
      );
    } catch (error) {
      setErrorMessage("Something went wrong! Try Again");
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  const loadSections = async () => {
    try {
      const request = await fetch(
        `${SERVER_URL}/api/sections/course/${courseId}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const response = await request.json();
      setSections(response);
    } catch (error) {
      setErrorMessage("Something went wrong! Try Again");
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  const loadInstructors = async () => {
    const request = await fetch(`${SERVER_URL}/api/instructors`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const response = await request.json();
    if (request.ok) {
      setInstructors(response);
      setSelectedInstructor(response[0].id);
    }
  };

  const edit = async (e) => {
    e.preventDefault();
    if (
      title === course.title &&
      courseCode === course.courseCode &&
      imageUrl === course.imageURL
    )
      return;

    try {
      const request = await fetch(
        `${SERVER_URL}/api/courses/${courseId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title, courseCode, imageUrl }),
        }
      );

      if (!request.ok) {
        setErrorMessage("Something went wrong! Try Again");
        setTimeout(() => setErrorMessage(""), 5000);
        return;
      }

      const response = await request.json();
      setCourse(response);
      setTitle(response.title);
      setCourseCode(response.courseCode);
      setImageUrl(response.imageURL);

      setSuccessMessage("Changes were saved!");
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (error) {
      setErrorMessage("Something went wrong! Try Again");
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  const createSection = async (e) => {
    e.preventDefault();
    if (!newSectionCode || !selectedInstructor) {
      setSectionError("Section Code and Instructor fields cannot be empty");
      setTimeout(() => setSectionError(""), 5000);
      return;
    }

    try {
      const request = await fetch(`${SERVER_URL}/api/sections`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId,
          instructorId: selectedInstructor,
          sectionCode: newSectionCode,
        }),
      });

      if (!request.ok) {
        setSectionError("Section Code already taken!");
        setTimeout(() => setSectionError(""), 5000);
        return;
      }

      const response = await request.json();
      setSections([...sections, response]);
      setNewSectionCode("");
      setSectionSuccess("Section was created!");
      setTimeout(() => setSectionSuccess(""), 5000);
    } catch (error) {
      setSectionError("Something went wrong! Try Again");
      setTimeout(() => setSectionError(""), 5000);
    }
  };

  const deleteCourse = async () => {
    try {
      const request = await fetch(
        `${SERVER_URL}/api/courses/${courseId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (request.ok) {
        setSuccessMessage(
          "Course was removed! You will be redirected in 5 seconds"
        );
        setTimeout(() => {
          setSuccessMessage("");
          navigate("/admin_courses");
        }, 5000);
      }
    } catch (error) {
      setErrorMessage("Something wrong happened! Try Again");
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  useEffect(() => {
    loadCourseInfo();
    loadSections();
    loadInstructors();
  }, []);
  return (
    <div className="context-menu">
      <form className="form-container" onSubmit={edit}>
        <Link to="/admin_courses">Back to Courses</Link>
        <h1>Edit Course</h1>

        {errorMessage && <div className="error-box">{errorMessage}</div>}
        {successMessage && <div className="success-box">{successMessage}</div>}

        <label htmlFor="c_title">Course Title: </label>
        <input
          placeholder="Ex. College Algebra"
          id="c_title"
          type="text"
          onChange={(e) => setTitle(e.target.value)}
          value={title}
        />

        <label htmlFor="c_code">Course Code: </label>
        <input
          placeholder="Ex. MATH 100"
          id="c_code"
          type="text"
          onChange={(e) => setCourseCode(e.target.value)}
          value={courseCode}
        />

        <label htmlFor="c_image">Course Image: </label>
        <input
          id="c_image"
          type="text"
          onChange={(e) => setImageUrl(e.target.value)}
          value={imageUrl}
        />
        {imageUrl && (
          <div className="image-holder" style={{ textAlign: "center" }}>
            <img className="image-holder-img" src={imageUrl} width="75%" />
          </div>
        )}

        <button style={{ width: "75%" }} className="blue-btn" type="submit">
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
          Delete this Course
        </a>

        {confirmDelete && (
          <div style={{ width: "75%", textAlign: "center", marginBottom: 0 }}>
            <p>
              Are you sure you want to delete this course? All sections will be
              removed.
            </p>
            <button onClick={deleteCourse}>Yes</button>
            <button onClick={() => setConfirmDelete(false)}>Cancel</button>
          </div>
        )}
      </form>
      <div>
        <h1 className="color-gray">New Section</h1>
        {sectionSuccess && <div className="success-box">{sectionSuccess}</div>}
        {sectionError && <div className="error-box">{sectionError}</div>}

        <form
          className="resize-row"
          style={{ display: "flex", flexDirection: "row", marginTop: "1rem" }}
          onSubmit={createSection}
        >
          <input
            type="number"
            placeholder="Section Code"
            className="input-with-side"
            value={newSectionCode}
            onChange={(e) => setNewSectionCode(e.target.value)}
          />
          <select
            style={{
              fontFamily: "Lisu Bosa",
              backgroundColor: "#1F6A6A",
              fontSize: "22px",
              padding: "12px 25px",
              color: "#fff",
            }}
            value={selectedInstructor}
            onChange={(e) => setSelectedInstructor(e.target.value)}
          >
            {instructors?.map((instructor, i) => (
              <option
                style={{
                  backgroundColor: "#FFF",
                  color: "#000",
                }}
                key={i}
                value={instructor.id}
              >
                {instructor.name}
              </option>
            ))}
          </select>

          <button
            style={{ borderRadius: "0" }}
            type="submit"
            className="red-btn"
          >
            +
          </button>
        </form>

        <h1 className="color-gray">Sections</h1>
        {sections?.length === 0 ? (
          <div>No sections available</div>
        ) : (
          <div className="course-card-holder">
            {sections?.map((section) => (
              <div
                key={section.id}
                className="course-card"
                onClick={() =>
                  navigate(`/admin_individual_section/${section.id}`)
                }
              >
                <img src={course.imageURL} alt="course" />
                <div>
                  <h2>
                    {course.courseCode} - {section.sectionCode}
                  </h2>
                  <p>{course.title}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCourse;
