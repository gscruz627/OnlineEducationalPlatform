import React, { useEffect, useState } from "react";
import "../src/App.css";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

const Profile = () => {
  const { userId } = useParams();
  const token = useSelector((state) => state.token);
  const v_user = useSelector((state) => state.user);
  const [user, setUser] = useState(null);
  const v_role = useSelector((state) => state.role);
  const [role, setRole] = useState(null);
  const isLocalUser = v_user.id === userId;
  const navigate = useNavigate();
  const SERVER_URL = process.env.REACT_APP_SERVER_URL;

  const loadUserInformation = async () => {
    let request = null;
    try {
      request = await fetch(
        `${SERVER_URL}/api/authority/user/${userId.toLocaleLowerCase()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      alert("Error at loading fatal");
      return;
    }
    if (!request.ok) {
    }
    const response = await request.json();
    setUser(response.user);
    setRole(response.role);
  };
  useEffect(() => {
    if (!isLocalUser) {
      loadUserInformation();
    } else {
      setUser(v_user);
      setRole(v_role);
    }
  }, []);
  return (
    <div
      style={{ textAlign: "center", margin: "1rem 0", fontFamily: "Lisu Bosa" }}
    >
      <h1 className="color-gray">Profile Page</h1>
      {user && role === "admin" ? (
        <h2>Username: {user.username}</h2>
      ) : (
        <>
          <h2>
            <b>Name:</b> {user && user.name}
          </h2>
          <h2>
            <b>Email:</b> {user && user.email}
          </h2>
        </>
      )}

      {isLocalUser ? (
        <p>You are a(n) {role}</p>
      ) : (
        <p>This user is a(n) {role}</p>
      )}
    </div>
  );
};

export default Profile;
