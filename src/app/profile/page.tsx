"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import { app } from "@/lib/firebase";
import { getAuth } from "firebase/auth";
import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const auth = getAuth(app);
  const db = getFirestore(app);
  const user = auth.currentUser;

  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setProfile(snap.data());
      } else {
        setProfile({
          name: user.displayName || "Anonymous",
          email: user.email,
          image: user.photoURL || "/default-avatar.png",
          status: "available",
        });
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user, db]);

  const handleChange = (field: string, value: string) => {
    setProfile((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const ref = doc(db, "users", user.uid);
      await updateDoc(ref, {
        name: profile.name,
        status: profile.status,
        image: profile.image,
      });
      toast.success("Profile updated!");
      setEditing(false);
    } catch (err) {
      toast.error("Failed to update profile.");
    }
    setSaving(false);
  };

  if (!user)
    return (
      <div className="flex items-center justify-center h-[50vh] text-gray-600">
        Please sign in to view your profile.
      </div>
    );
  if (loading || !profile)
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <LoadingSpinner size={40} />
      </div>
    );

  return (
    <div className="max-w-md mx-auto mt-10 bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      <img
        src={profile.image || "/default-avatar.png"}
        alt="avatar"
        className="w-24 h-24 rounded-full border-4 border-blue-200 mb-4 object-cover"
      />
      <div className="w-full mb-4">
        <label className="block text-gray-700 font-medium mb-1">Name:</label>
        {editing ? (
          <input
            value={profile.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        ) : (
          <span className="text-gray-900"> {profile.name}</span>
        )}
      </div>
      <div className="w-full mb-4">
        <label className="block text-gray-700 font-medium mb-1">Status:</label>
        {editing ? (
          <select
            value={profile.status}
            onChange={(e) => handleChange("status", e.target.value)}
            className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="available">Available</option>
            <option value="busy">Busy</option>
          </select>
        ) : (
          <span
            className={`inline-block px-3 py-1 rounded-full text-white text-sm ${
              profile.status === "available" ? "bg-green-500" : "bg-gray-400"
            }`}
          >
            {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
          </span>
        )}
      </div>
      <div className="w-full mb-6">
        <label className="block text-gray-700 font-medium mb-1">Email:</label>
        <span className="text-gray-900">{profile.email}</span>
      </div>
      {editing ? (
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
        >
          {saving ? <LoadingSpinner size={20} /> : "Save"}
        </button>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="w-full py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
        >
          Edit Profile
        </button>
      )}
    </div>
  );
}
