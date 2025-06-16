"use client";
import { useAuth } from "@/components/AuthProvider";
import CreateMeetupDialog from "@/components/CreateMeetupDialog";
import MeetupCard from "@/components/MeetupCard";
import SignIn from "@/components/SignIn";
import { db, rtdb } from "@/lib/firebase";
import { Meetup } from "@/types";
import { off, onValue, ref, set } from "firebase/database";
import { addDoc, collection } from "firebase/firestore";
import { useEffect, useState } from "react";
import { HiPlus } from "react-icons/hi";

const HomePage = () => {
  const { user, loading } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [meetups, setMeetups] = useState<Meetup[]>([]);

  useEffect(() => {
    if (!user) return;

    // Subscribe to meetups
    const meetupsRef = ref(rtdb, "meetups");
    onValue(meetupsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const meetupList = Object.entries(data)
          .map(([id, meetup]: [string, any]) => ({
            id,
            ...meetup,
            time: new Date(meetup.time),
            participants: Object.values(meetup.participants || {}),
          }))
          .filter((m) => !m.archived); // Only show non-archived
        setMeetups(
          meetupList.sort((a, b) => b.time.getTime() - a.time.getTime())
        );
      } else {
        setMeetups([]);
      }
    });

    return () => {
      off(meetupsRef);
    };
  }, [user]);

  const handleCreateMeetup = async (data: {
    title: string;
    description: string;
    location: string;
    time: string;
    isPublic: boolean;
    maxParticipants?: number;
  }) => {
    if (!user) return;

    try {
      // Create meetup in Firestore for permanent storage
      const meetupDoc = await addDoc(collection(db, "meetups"), {
        ...data,
        creatorId: user.id,
        creator: user,
        status: "active",
        participants: [user],
        time: new Date(data.time).toISOString(),
      });

      // Add to Realtime Database for real-time updates
      const meetupRef = ref(rtdb, `meetups/${meetupDoc.id}`);
      await set(meetupRef, {
        ...data,
        id: meetupDoc.id,
        creatorId: user.id,
        creator: user,
        status: "active",
        participants: { [user.id]: user },
        time: new Date(data.time).toISOString(),
      });

      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Error creating meetup:", error);
      // You might want to add toast notification here
    }
  };

  const handleJoinMeetup = async (meetupId: string) => {
    if (!user) return;

    try {
      const participantRef = ref(
        rtdb,
        `meetups/${meetupId}/participants/${user.id}`
      );
      await set(participantRef, user);
    } catch (error) {
      console.error("Error joining meetup:", error);
      // You might want to add toast notification here
    }
  };

  // Archive (delete) meetup
  const handleArchiveMeetup = async (meetup: Meetup) => {
    if (!user || meetup.creatorId !== user.id) return;
    try {
      const meetupRef = ref(rtdb, `meetups/${meetup.id}/archived`);
      await set(meetupRef, true);
    } catch (error) {
      console.error("Error archiving meetup:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!user) {
    return <SignIn />;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Recent Meetups</h1>
        <button
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          <HiPlus className="mr-2" />
          Create Meetup
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {meetups.map((meetup) => (
          <MeetupCard
            key={meetup.id}
            meetup={meetup}
            currentUser={user}
            onJoin={() => handleJoinMeetup(meetup.id)}
            onDelete={() => handleArchiveMeetup(meetup)}
          />
        ))}
      </div>

      <CreateMeetupDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateMeetup}
      />
    </div>
  );
};

export default HomePage;
