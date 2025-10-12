import React, { useEffect, useState } from "react";
import "../src/App.css";
import { useNavigate, useParams } from "react-router-dom";
import { useSnapshot } from "valtio";
import state from "../store";

const Profile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<any>(null);
  const snap = useSnapshot(state);
  const isLocalUser = snap.user?.userId === userId;
  const SERVER_URL = import.meta.env["VITE_SERVER_URL"];


  const loadUserInformation = async () => {
    let request = null;
    try {
      request = await fetch(
        `${SERVER_URL}/api/users/${String(userId).toLocaleLowerCase()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${state.token}`,
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
      setUser(snap.user);
      setRole(snap.user?.role);
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
            <b>Name:</b> {user && user.name ? user.name : user.username}
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
