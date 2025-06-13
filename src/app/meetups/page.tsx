"use client";

import { useAuth } from "@/components/AuthProvider";
import MeetupCard from "@/components/MeetupCard";
import { db } from "@/lib/firebase";
import type { Meetup } from "@/types";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function MeetupsPage() {
  const { user, loading } = useAuth();
  const [meetups, setMeetups] = useState<Meetup[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setMeetups([]);
      setFetching(false);
      return;
    }
    const fetchMeetups = async () => {
      const q = query(
        collection(db, "meetups"),
        where("creatorId", "==", user.id),
        where("status", "==", "active"),
        where("isPublic", "==", true),
        orderBy("time", "asc")
      );
      const snapshot = await getDocs(q);
      const data: Meetup[] = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          title: d.title,
          description: d.description,
          location: d.location,
          time: d.time?.toDate ? d.time.toDate() : new Date(d.time),
          creatorId: d.creatorId,
          creator: d.creator,
          isPublic: d.isPublic,
          imageUrl: d.imageUrl,
          participants: d.participants || [],
          maxParticipants: d.maxParticipants,
          status: d.status,
        };
      });
      setMeetups(data);
      setFetching(false);
    };
    fetchMeetups();
  }, [user, loading]);

  // RSVP handler
  const handleRSVP = async (meetup: Meetup) => {
    if (!user) return;
    const isParticipant = meetup.participants.some(
      (p: any) => p.id === user.id
    );
    const ref = doc(db, "meetups", meetup.id);
    try {
      if (isParticipant) {
        await updateDoc(ref, {
          participants: meetup.participants.filter(
            (p: any) => p.id !== user.id
          ),
        });
        toast("You left the meetup.");
      } else {
        await updateDoc(ref, {
          participants: [...meetup.participants, user],
        });
        toast.success("RSVP successful!");
      }
      // Refresh meetups
      setFetching(true);
    } catch (err) {
      toast.error("Failed to update RSVP.");
    }
  };

  // Edit handler (redirect to details page for editing)
  const handleEdit = (meetup: Meetup) => {
    window.location.href = `/meetups/${meetup.id}`;
  };

  // Delete handler
  const handleDelete = async (meetup: Meetup) => {
    if (!confirm("Are you sure you want to delete this meetup?")) return;
    try {
      await deleteDoc(doc(db, "meetups", meetup.id));
      toast.success("Meetup deleted");
      setFetching(true);
    } catch (err) {
      toast.error("Failed to delete meetup.");
    }
  };

  if (loading || fetching) return <div>Loading...</div>;
  if (!user) return <div>Please sign in to view your meetups.</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">My Public & Available Meetups</h2>
      {meetups.length === 0 ? (
        <div>No meetups found.</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {meetups.map((meetup) => (
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
