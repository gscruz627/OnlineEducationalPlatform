import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import "./styles/CourseAndSection.css";
import state from "../store";
import checkAuth from "../functions";
import Loading from "../components/Loading";

const AdminCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const SERVER_URL = import.meta.env["VITE_SERVER_URL"];

  const [loading, setLoading] = useState<boolean>(false);
  const [course, setCourse] = useState<any>("");
  const [title, setTitle] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sections, setSections] = useState<Array<any>>([]);
  const [instructors, setInstructors] = useState<Array<any>>([]);

  const [newSectionCode, setNewSectionCode] = useState("");
  const [selectedInstructor, setSelectedInstructor] = useState<any>(null);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [sectionSuccess, setSectionSuccess] = useState("");
  const [sectionError, setSectionError] = useState("");

  const [confirmDelete, setConfirmDelete] = useState(false);

  const loadCourseInfo = async () => {
    setLoading(true);
    try {
      await checkAuth(navigate);
      const request = await fetch(
        `${SERVER_URL}/api/courses/${courseId}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${state.token}` },
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
    } finally{
      setLoading(false);
    }
  };

  const loadSections = async () => {
    setLoading(true);
    try {
      await checkAuth(navigate);
      const request = await fetch(
        `${SERVER_URL}/api/sections?courseId=${courseId}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${state.token}` },
        }
      );
      const response = await request.json();
      setSections(response);
    } catch (error) {
      setErrorMessage("Something went wrong! Try Again");
      setTimeout(() => setErrorMessage(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const loadInstructors = async () => {
    setLoading(true);
    try{
      await checkAuth(navigate);
      const request = await fetch(`${SERVER_URL}/api/users?role=instructor`, {
        method: "GET",
        headers: { Authorization: `Bearer ${state.token}` },
      });
      const response = await request.json();
      if (request.ok) {
        setInstructors(response);
        setSelectedInstructor(response[0].id);
      }
    } catch(err: unknown){
      setErrorMessage("Something went wrong");
      setTimeout(() => setErrorMessage(""), 5000);
    } finally{
      setLoading(false);
    }
  };

  const edit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      title === course.title &&
      courseCode === course.courseCode &&
      imageUrl === course.imageURL
    )
    return;
    
    setLoading(true);
    try {
      await checkAuth(navigate);
      const request = await fetch(
        `${SERVER_URL}/api/courses/${courseId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${state.token}`,
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
    } finally {
      setLoading(false);
    }
  };

  const createSection = async (e: React.FormEvent) => {
    
    e.preventDefault();
    if (!newSectionCode || !selectedInstructor) {
      setSectionError("Section Code and Instructor fields cannot be empty");
      setTimeout(() => setSectionError(""), 5000);
      return;
    }
    
    setLoading(true);
    try {
      await checkAuth(navigate);
      const request = await fetch(`${SERVER_URL}/api/sections`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${state.token}`,
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
    } finally{
      setLoading(false);
    }
  };

  const deleteCourse = async () => {
    setLoading(true);
    try {
      await checkAuth(navigate);
      const request = await fetch(
        `${SERVER_URL}/api/courses/${courseId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${state.token}` },
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
    } finally{
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourseInfo();
    loadSections();
    loadInstructors();
  }, []);
  
  return (
    <>
    {loading && <Loading/>}
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

        <button style={{ width: "75%" }} className="red-btn" type="submit">
          Save
        </button>

        <a
          onClick={() => setConfirmDelete(true)}
          style={{
            cursor: "pointer",
            fontWeight: "bolder",
            color: "brown",
            fontFamily: "Sofia Pro",
            marginBottom: "1rem",
            fontSize: "22px",
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
        <h1>New Section</h1>
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
              backgroundColor: "#DDD",
              fontSize: "22px",
              padding: "12px 25px",
              color: "#000",
            }}
            value={selectedInstructor}
            onChange={(e) => setSelectedInstructor(e.target.value)}
          >
            {instructors?.map((instructor:any, i:number) => (
              <option
              style={{
                backgroundColor: "#FFF",
                  color: "#000",
                }}
                key={instructor.id}
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

        <h1>Sections</h1>
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
  </>
  );
};

export default AdminCourse;
