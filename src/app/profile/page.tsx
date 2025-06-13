"use client";

import { app } from "@/lib/firebase"; // adjust path if needed
import { getAuth } from "firebase/auth";
import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const auth = getAuth(app);
  const db = getFirestore(app);
  const user = auth.currentUser;

  const [status, setStatus] = useState("Available");
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      const fetchStatus = async () => {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setStatus(snap.data().status || "Available");
        }
        setLoading(false);
      };
      fetchStatus();
    }
  }, [user, db]);

  const handleSave = async () => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    await updateDoc(ref, { displayName, status });
    setEditing(false);
  };

  if (!user) return <div>Please sign in to view your profile.</div>;
  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto" }}>
      <h2>Profile</h2>
      <img
        src={user.photoURL || "/default-avatar.png"}
        alt="avatar"
        style={{ width: 80, borderRadius: "50%" }}
      />
      <div>
        <label>Name:</label>
        {editing ? (
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        ) : (
          <span> {displayName}</span>
        )}
      </div>
      <div>
        <label>Status:</label>
        {editing ? (
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="Available">Available</option>
            <option value="Busy">Busy</option>
          </select>
        ) : (
          <span> {status}</span>
        )}
      </div>
      <div>
        <label>Email:</label> <span>{user.email}</span>
      </div>
      {editing ? (
        <button onClick={handleSave}>Save</button>
      ) : (
        <button onClick={() => setEditing(true)}>Edit Profile</button>
      )}
    </div>
  );
}
