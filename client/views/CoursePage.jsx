import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import "../src/App.css";
import "./styles/CourseAndSection.css";
import "./styles/MyCourses.css";
import { useNavigate, useParams } from "react-router-dom";

const CoursePage = () => {
  const { kind, sectionId } = useParams();
  const role = useSelector((state) => state.role);
  const enrollments = useSelector((state) => state.enrollments);
  const SERVER_URL = process.env.REACT_APP_SERVER_URL;

  const [section, setSection] = useState(null);
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementDescription, setAnnouncementDescription] = useState("");
  const [announcements, setAnnouncements] = useState(null);

  const [announcementError, setAnnounncementError] = useState("");
  const [announcementSuccess, setAnnouncementSucess] = useState("");

  const navigate = useNavigate();
  const token = useSelector((state) => state.token);

  const loadSectionInformation = async () => {
    let request = null;
    try {
      request = await fetch(
        `${SERVER_URL}/api/sections/${sectionId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      alert("Fatal Error, please reload");
      return;
    }
    if (!request.ok) {
      alert("Fatal Error, please reload");
      return;
    }
    const response = await request.json();
    setSection(response);
  };
  const loadAnnouncements = async () => {
    const request = await fetch(
      `${SERVER_URL}/api/announcements/section/${sectionId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (request.ok) {
      const response = await request.json();
      setAnnouncements(response);
    }
  };
  const createAnnouncement = async (e) => {
    e.preventDefault();
    let request = null;
    try {
      request = await fetch(`${SERVER_URL}/api/announcements`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: announcementTitle,
          description: announcementDescription,
          sectionId: sectionId,
        }),
      });
    } catch (error) {
      setAnnounncementError("Something wrong has happened, Try again!");
      setTimeout(() => {
        setAnnounncementError("");
      }, 5000);
    }
    if (!request.ok) {
      setAnnounncementError("Something wrong has happened, Try again!");
      setTimeout(() => {
        setAnnounncementError("");
      }, 5000);
    }
    const response = await request.json();
    setAnnouncements([...announcements, response]);
    setAnnouncementSucess("Announcement Created!");
    setAnnouncementDescription("");
    setAnnouncementTitle("");
    setTimeout(() => {
      setAnnouncementSucess("");
    }, 5000);
  };

  useEffect(() => {
    if (!enrollments.includes(sectionId.toLowerCase())) {
      navigate("/404");
    }
    loadSectionInformation();
    loadAnnouncements();
  }, []);
  if (role !== kind) {
    navigate("/404");
    console.log("role is not kind");
  }
  return (
    <div className="context-menu">
      <div className="side-bar">
        <h1>{section && `${section.courseCode} - ${section.sectionCode}`}</h1>
        <ul>
          <li
            className="side-bar-item"
            onClick={() => {
              navigate(`/course_page/${kind}/${sectionId}`);
            }}
          >
            Announcements
          </li>
          <li
            className="side-bar-item"
            onClick={() => {
              navigate(`/course_page/${kind}/${sectionId}/assignments/`);
            }}
          >
            Assignments
          </li>
          <li
            className="side-bar-item"
            onClick={() => {
              navigate(`/course_page/${sectionId}/students/`);
            }}
          >
            Students
          </li>
        </ul>
      </div>
      <div>
        {kind === "instructor" && (
          <>
            <h1 className="color-gray">Announcements</h1>
            <hr />

            {announcementSuccess && (
              <>
                <div className="success-box">{announcementSuccess}</div>
                <br />
              </>
            )}
            {announcementError && (
              <>
                <div className="error-box">{announcementError}</div>
                <br />
              </>
            )}

            <h2
              className="color-gray"
              style={{ textAlign: "center", margin: "1rem 0" }}
            >
              Create a new announcement
            </h2>
            <hr />
            <form
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
              onSubmit={(e) => createAnnouncement(e)}
            >
              <label for="announcement_title">Title:</label>
              <input
                style={{
                  fontFamily: "Lisu Bosa",
                  backgroundColor: "#FFF",
                  fontSize: "22px",
                  padding: "10px 5px",
                  border: "none",
                  borderBottom: "1px solid #000",
                  outline: "none",
                }}
                type="text"
                id="announcement_title"
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                value={announcementTitle}
              ></input>

              <label for="announcement_content">Description:</label>
              <textarea
                style={{
                  fontFamily: "Lisu Bosa",
                  backgroundColor: "#FFF",
                  fontSize: "22px",
                  padding: "10px 5px",
                  border: "none",
                  borderBottom: "1px solid #000",
                  outline: "none",
                }}
                id="announcement_content"
                onChange={(e) => setAnnouncementDescription(e.target.value)}
                value={announcementDescription}
              ></textarea>

              <button type="submit" className="blue-btn">
                Create
              </button>
            </form>
          </>
        )}
        <h1 className="color-gray">List of Announcements</h1>
        <hr />
        {announcements && announcements.length > 0 ? (
          announcements.map((announcement) => (
            <div className="announcement-box">
              <h2>{announcement.title}</h2>
              <p>{announcement.description}</p>
              <hr />
            </div>
          ))
        ) : (
          <p style={{ margin: "1rem 0" }}>No announcements to show</p>
        )}
      </div>
    </div>
  );
};

export default CoursePage;
