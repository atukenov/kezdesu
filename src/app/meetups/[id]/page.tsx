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

  useEffect(() => {
    if (!meetupId) return;
    const fetchMeetup = async () => {
      const ref = doc(db, "meetups", meetupId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() };
        setMeetup(data);
        // Fetch participant details (only if 1-10 participants)
        const participants = (data as any).participants;
        if (
          Array.isArray(participants) &&
          participants.length > 0 &&
          participants.length <= 10
        ) {
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
      }
      setLoading(false);
    };
    fetchMeetup();
  }, [meetupId, editing]);

  if (loading) return <div>Loading...</div>;
  if (!meetup) return <div>Meetup not found.</div>;

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
      if (snap.exists()) setMeetup({ id: snap.id, ...snap.data() });
    } catch (err) {
      toast.error("Failed to update RSVP.");
    }
    setRsvpLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <Toaster />
      {editing ? (
        <form onSubmit={handleEditSubmit} className="space-y-2">
          <input
            name="title"
            value={editData.title}
            onChange={handleEditChange}
            className="w-full border rounded p-2"
            required
          />
          <input
            name="location"
            value={editData.location}
            onChange={handleEditChange}
            className="w-full border rounded p-2"
            required
          />
          <input
            name="time"
            type="datetime-local"
            value={editData.time}
            onChange={handleEditChange}
            className="w-full border rounded p-2"
            required
          />
          <select
            name="status"
            value={editData.status}
            onChange={handleEditChange}
            className="w-full border rounded p-2"
          >
            <option value="Available">Available</option>
            <option value="Busy">Busy</option>
          </select>
          <select
            name="visibility"
            value={editData.visibility}
            onChange={handleEditChange}
            className="w-full border rounded p-2"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-2">{meetup.title}</h2>
          <div className="mb-2">Location: {meetup.location}</div>
          <div className="mb-2">
            Time:{" "}
            {meetup.time &&
              new Date(
                typeof meetup.time === "string"
                  ? meetup.time
                  : meetup.time.seconds * 1000
              ).toLocaleString()}
          </div>
          <div className="mb-2">Status: {meetup.status}</div>
          <div className="mb-2">Visibility: {meetup.visibility}</div>
          <div className="mb-2">
            Participants:{" "}
            {Array.isArray(meetup.participants)
              ? meetup.participants.length
              : 0}
            {Array.isArray(meetup.participants) &&
              meetup.participants.length > 10 && (
                <div className="text-xs text-gray-500">
                  Showing first 10 participants only.
                </div>
              )}
            <ul className="ml-4 mt-1 text-sm text-gray-700">
              {participantDetails.map((p) => (
                <li key={p.id} className="flex items-center gap-2">
                  {p.image && (
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span>{p.name || p.email}</span>
                </li>
              ))}
            </ul>
          </div>
          {isOwner ? (
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          ) : (
            <button
              onClick={handleRSVP}
              className={`mt-4 px-4 py-2 rounded transition-colors ${
                isParticipant
                  ? "bg-gray-400"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
              disabled={rsvpLoading || !user}
            >
              {isParticipant ? "Leave Meetup" : "RSVP / Join Meetup"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
