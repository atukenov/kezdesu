"use client";

import { useAuth } from "@/components/AuthProvider";
import MeetupCard from "@/components/MeetupCard";
import { MeetupModel } from "@/models/MeetupModel";
import {
  archiveMeetup,
  joinMeetup,
  leaveMeetup,
  subscribeToMeetups,
} from "@/services/meetupService";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

export default function MeetupsPage() {
  const { user, loading } = useAuth();
  const [meetups, setMeetups] = useState<(MeetupModel & { id: string })[]>([]);
  const [fetching, setFetching] = useState(true);
  const [tab, setTab] = useState<"mine" | "joined">("mine");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setMeetups([]);
      setFetching(false);
      return;
    }
    // Use real-time subscription for meetups, like on main page
    const unsub = subscribeToMeetups((meetupList) => {
      setMeetups(meetupList);
      setFetching(false);
    });
    return () => unsub();
  }, [user, loading]);

  // RSVP handler
  const handleRSVP = async (meetup: MeetupModel & { id: string }) => {
    if (!user) return;
    const isParticipant = meetup.participants.some((p) => p.id === user.id);
    try {
      if (isParticipant) {
        await leaveMeetup(meetup.id, user);
        toast("You left the meetup.");
      } else {
        await joinMeetup(meetup.id, user);
        toast.success("RSVP successful!");
      }
    } catch (err) {
      toast.error("Failed to update RSVP.");
    }
  };

  // Edit handler (redirect to details page for editing)
  const handleEdit = (meetup: MeetupModel & { id: string }) => {
    window.location.href = `/meetups/${meetup.id}`;
  };

  // Delete handler
  const handleDelete = async (meetup: MeetupModel & { id: string }) => {
    if (!confirm("Are you sure you want to delete this meetup?")) return;
    try {
      await archiveMeetup(meetup.id);
      toast.success("Meetup deleted");
    } catch (err) {
      toast.error("Failed to delete meetup.");
    }
  };

  // Filter meetups for tabs
  const myMeetups = useMemo(
    () => (user ? meetups.filter((m) => m.creatorId === user.id) : []),
    [meetups, user]
  );
  const joinedMeetups = useMemo(
    () =>
      user
        ? meetups.filter(
            (m) =>
              m.creatorId !== user.id &&
              m.participants.some((p) => p.id === user.id)
          )
        : [],
    [meetups, user]
  );

  if (loading || fetching) return <div>Loading...</div>;
  if (!user) return <div>Please sign in to view your meetups.</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex gap-2 mb-6">
        <button
          className={`px-4 py-2 rounded-t-md font-semibold border-b-2 transition-colors ${
            tab === "mine"
              ? "border-blue-500 text-blue-600 bg-blue-50"
              : "border-transparent text-gray-500 bg-gray-100 hover:bg-blue-50"
          }`}
          onClick={() => setTab("mine")}
        >
          My Meetups
        </button>
        <button
          className={`px-4 py-2 rounded-t-md font-semibold border-b-2 transition-colors ${
            tab === "joined"
              ? "border-blue-500 text-blue-600 bg-blue-50"
              : "border-transparent text-gray-500 bg-gray-100 hover:bg-blue-50"
          }`}
          onClick={() => setTab("joined")}
        >
          Joined Meetups
        </button>
      </div>
      {tab === "mine" ? (
        myMeetups.length === 0 ? (
          <div>No meetups found.</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {myMeetups.map((meetup) => (
              <MeetupCard
                key={meetup.id}
                meetup={meetup}
                currentUser={user}
                onJoin={() => handleRSVP(meetup)}
                onEdit={() => handleEdit(meetup)}
                onDelete={() => handleDelete(meetup)}
              />
            ))}
          </div>
        )
      ) : joinedMeetups.length === 0 ? (
        <div>No joined meetups found.</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {joinedMeetups.map((meetup) => (
            <MeetupCard
              key={meetup.id}
              meetup={meetup}
              currentUser={user}
              onJoin={() => handleRSVP(meetup)}
              onEdit={() => handleEdit(meetup)}
              onDelete={() => handleDelete(meetup)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
