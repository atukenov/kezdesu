"use client";

import { db } from "@/lib/firebase";
import { getAuth } from "firebase/auth";
import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { HiLocationMarker, HiClock, HiUsers, HiLockClosed, HiLockOpen } from "react-icons/hi";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function MeetupDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const meetupId = params?.id as string;
  const [meetup, setMeetup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [participantDetails, setParticipantDetails] = useState<any[]>([]);
  const auth = getAuth();
  const user = auth.currentUser;

  // Helper to fetch participant details
  const fetchParticipantDetails = async (participants: string[]) => {
    if (Array.isArray(participants) && participants.length > 0 && participants.length <= 10) {
      try {
        const q = query(
          collection(db, "users"),
          where("id", "in", participants)
        );
        const usersSnap = await getDocs(q);
        setParticipantDetails(usersSnap.docs.map((d) => d.data()));
      } catch (err) {
        setParticipantDetails([]);
      }
    } else {
      setParticipantDetails([]);
    }
  };

  useEffect(() => {
    if (!meetupId) return;
    const fetchMeetup = async () => {
      const ref = doc(db, "meetups", meetupId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const snapData = snap.data() as any;
        const data = { id: snap.id, ...snapData };
        setMeetup(data);
        await fetchParticipantDetails(snapData.participants);
      }
      setLoading(false);
    };
    fetchMeetup();
  }, [meetupId, editing]);

  if (loading) return <div className="flex items-center justify-center h-[50vh]"><LoadingSpinner size={40} /></div>;
  if (!meetup) return <div className="text-center text-gray-600 mt-10">Meetup not found.</div>;

  const isOwner = user && meetup.createdBy === user.uid;
  const isParticipant =
    user &&
    Array.isArray(meetup.participants) &&
    meetup.participants.includes(user.uid);

  // Edit handlers
  const handleEdit = () => {
    setEditData({
      title: meetup.title,
      location: meetup.location,
      time:
        meetup.time &&
        (typeof meetup.time === "string"
          ? meetup.time
          : new Date(meetup.time.seconds * 1000).toISOString().slice(0, 16)),
      status: meetup.status,
      visibility: meetup.visibility,
    });
    setEditing(true);
  };

  const handleEditChange = (e: any) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e: any) => {
    e.preventDefault();
    const ref = doc(db, "meetups", meetupId);
    try {
      await updateDoc(ref, {
        ...editData,
        time: new Date(editData.time),
      });
      setEditing(false);
      toast.success("Meetup updated!");
    } catch (err) {
      toast.error("Failed to update meetup.");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this meetup?")) return;
    try {
      await deleteDoc(doc(db, "meetups", meetupId));
      toast.success("Meetup deleted");
      router.push("/meetups");
    } catch (err) {
      toast.error("Failed to delete meetup.");
    }
  };

  // RSVP handlers
  const handleRSVP = async () => {
    if (!user) return;
    setRsvpLoading(true);
    const ref = doc(db, "meetups", meetupId);
    try {
      if (isParticipant) {
        await updateDoc(ref, { participants: arrayRemove(user.uid) });
        toast("You left the meetup.");
      } else {
        await updateDoc(ref, { participants: arrayUnion(user.uid) });
        toast.success("RSVP successful!");
      }
      // Refresh
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setMeetup({ id: snap.id, ...snap.data() });
        await fetchParticipantDetails(snap.data().participants);
      }
    } catch (err) {
      toast.error("Failed to update RSVP.");
    }
    setRsvpLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white rounded-xl shadow-lg p-8">
      <Toaster />
      {editing ? (
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <input
            name="title"
            value={editData.title}
            onChange={handleEditChange}
            className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
            placeholder="Title"
          />
          <input
            name="location"
            value={editData.location}
            onChange={handleEditChange}
            className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
            placeholder="Location"
          />
          <input
            name="time"
            type="datetime-local"
            value={editData.time}
            onChange={handleEditChange}
            className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <select
            name="status"
            value={editData.status}
            onChange={handleEditChange}
            className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="Available">Available</option>
            <option value="Busy">Busy</option>
          </select>
          <select
            name="visibility"
            value={editData.visibility}
            onChange={handleEditChange}
            className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
          <div className="flex gap-2 justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-4 text-center">{meetup.title}</h2>
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex items-center gap-2 text-gray-700">
              <HiLocationMarker className="w-5 h-5" />
              <span>{meetup.location}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <HiClock className="w-5 h-5" />
              <span>
                {meetup.time &&
                  new Date(
                    typeof meetup.time === "string"
                      ? meetup.time
                      : meetup.time.seconds * 1000
                  ).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <HiUsers className="w-5 h-5" />
              <span>
                {Array.isArray(meetup.participants) ? meetup.participants.length : 0} participants
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              {meetup.visibility === "public" ? (
                <HiLockOpen className="w-5 h-5 text-green-500" />
              ) : (
                <HiLockClosed className="w-5 h-5 text-red-500" />
              )}
              <span className="capitalize">{meetup.visibility}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <span className={`inline-block px-3 py-1 rounded-full text-white text-xs ${meetup.status === "Available" ? "bg-green-500" : "bg-gray-400"}`}>{meetup.status}</span>
            </div>
          </div>
          <div className="mb-4">
            <div className="font-semibold mb-1">Participants:</div>
            {Array.isArray(meetup.participants) && meetup.participants.length > 10 && (
              <div className="text-xs text-gray-500">Showing first 10 participants only.</div>
            )}
            <ul className="flex flex-wrap gap-2 mt-1">
              {participantDetails.map((p) => (
                <li key={p.id} className="flex items-center gap-2 bg-gray-100 rounded px-2 py-1">
                  {p.image && (
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span className="text-sm">{p.name || p.email}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex gap-2 mt-6 justify-end">
            {isOwner ? (
              <>
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </>
            ) : (
              <button
                onClick={handleRSVP}
                className={`px-4 py-2 rounded transition-colors ${
                  isParticipant
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
                disabled={rsvpLoading || !user || isParticipant}
              >
                {rsvpLoading ? (
                  <LoadingSpinner size={18} />
                ) : isParticipant ? (
                  "Joined"
                ) : (
                  "RSVP / Join Meetup"
                )}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
