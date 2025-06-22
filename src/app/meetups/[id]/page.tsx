"use client";

import MeetupChat from "@/components/meetup/MeetupChat";
import MeetupDetailsInfo from "@/components/meetup/MeetupDetailsInfo";
import MeetupParticipants from "@/components/meetup/MeetupParticipants";
import RSVPButton from "@/components/meetup/RSVPButton";
import { useAuth } from "@/components/providers/AuthProvider";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { MeetupModel } from "@/models/MeetupModel";
import {
  archiveMeetup,
  getMeetup,
  joinMeetup,
  leaveMeetup,
  updateMeetup,
} from "@/services/meetupService";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { HiChatAlt } from "react-icons/hi";

export default function MeetupDetailsPage() {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const meetupId = params?.id as string;
  const { user } = useAuth();
  const [meetup, setMeetup] = useState<(MeetupModel & { id: string }) | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<MeetupModel>>({});
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [categoryInput, setCategoryInput] = useState("");
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (!meetupId) return;
    setLoading(true);
    getMeetup(meetupId)
      .then((data) => setMeetup(data))
      .catch(() => setMeetup(null))
      .finally(() => setLoading(false));
  }, [meetupId, editing]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <LoadingSpinner size={40} />
      </div>
    );
  if (!meetup)
    return (
      <div className="text-center text-gray-600 mt-10">
        {t("meetupNotFound")}
      </div>
    );

  // Owner check
  const isOwner = user && meetup && meetup.creatorId === user.id;
  // Participant check
  const isParticipant =
    user &&
    meetup &&
    Array.isArray(meetup.participants) &&
    meetup.participants.some((p) => p.id === user.id);

  // Edit handlers
  const handleEdit = () => {
    if (!meetup) return;
    setEditData({
      title: meetup.title,
      location: meetup.location,
      time: meetup.time,
      status: meetup.status,
      isPublic: meetup.isPublic,
      categories: meetup.categories || [],
    });
    setCategoryInput("");
    setEditing(true);
  };

  const handleEditChange = (e: any) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e: any) => {
    e.preventDefault();
    if (!meetup) return;
    try {
      await updateMeetup(meetup.id, {
        ...editData,
        time: editData.time,
        categories: editData.categories || [],
      });
      setEditing(false);
      toast.success("Meetup updated!");
    } catch (err) {
      toast.error("Failed to update meetup.");
    }
  };

  const handleDelete = async () => {
    if (!meetup) return;
    if (!confirm("Are you sure you want to delete this meetup?")) return;
    try {
      await archiveMeetup(meetup.id);
      toast.success("Meetup deleted");
      router.push("/meetups");
    } catch (err) {
      toast.error("Failed to delete meetup.");
    }
  };

  // RSVP handlers
  const handleRSVP = async () => {
    if (!user || !meetup) return;
    setRsvpLoading(true);
    // Only pass minimal user info to Firestore (id, name, image, email)
    const safeUser = {
      id: user.id,
      name: user.name,
      image: user.image || "",
      email: user.email || "",
      status: user.status || "Available",
    };
    try {
      if (isParticipant) {
        await leaveMeetup(meetup.id, safeUser);
        toast("You left the meetup.");
      } else {
        await joinMeetup(meetup.id, safeUser);
        toast.success("RSVP successful!");
      }
      // Refresh
      const updated = await getMeetup(meetup.id);
      setMeetup(updated);
    } catch (err) {
      console.log("RSVP error:", err);
      toast.error("Failed to update RSVP.");
    }
    setRsvpLoading(false);
  };

  return (
    <div className="max-w-lg mt-6 mb-8 bg-background rounded-xl shadow-lg p-4 sm:p-8 md:p-10 lg:p-12 border border-foreground-accent transition-colors dark:bg-background dark:text-foreground mx-4">
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
            value={editData.isPublic ? "public" : "private"}
            onChange={handleEditChange}
            className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Categories/Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(editData.categories || []).map((cat, idx) => (
                <span
                  key={cat + idx}
                  className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs flex items-center gap-1"
                >
                  {cat}
                  <button
                    type="button"
                    className="ml-1 text-blue-500 hover:text-red-500"
                    onClick={() =>
                      setEditData((prev) => ({
                        ...prev,
                        categories: (prev.categories || []).filter(
                          (c) => c !== cat
                        ),
                      }))
                    }
                    aria-label={`Remove ${cat}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Add a category and press Enter"
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  categoryInput.trim() &&
                  !(editData.categories || []).includes(categoryInput.trim())
                ) {
                  e.preventDefault();
                  setEditData((prev) => ({
                    ...prev,
                    categories: [
                      ...(prev.categories || []),
                      categoryInput.trim(),
                    ],
                  }));
                  setCategoryInput("");
                }
              }}
            />
          </div>
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
          <h2 className="text-2xl font-bold mb-4 text-center">
            {meetup.title}
          </h2>
          <MeetupDetailsInfo meetup={meetup} />
          <MeetupParticipants participants={meetup.participants} />
          <div className="flex gap-2 mt-6 justify-end">
            <button
              onClick={() => setShowChat((prev) => !prev)}
              className="px-4 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors flex items-center gap-2"
              type="button"
              aria-label="Toggle chat"
            >
              <HiChatAlt className="w-5 h-5" />
            </button>
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
              <RSVPButton
                isOwner={!!isOwner}
                isParticipant={!!isParticipant}
                rsvpLoading={rsvpLoading}
                onRSVP={handleRSVP}
              />
            )}
          </div>
          {showChat && user && (
            <div className="mt-6 max-h-[60vh] overflow-hidden flex flex-col">
              <h3 className="text-lg font-semibold mb-2">Meetup Chat</h3>
              <div className="flex-1 min-h-0">
                <MeetupChat meetupId={meetup.id} currentUser={user} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
