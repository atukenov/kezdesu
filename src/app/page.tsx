"use client";
import CreateMeetupDialog from "@/components/CreateMeetupDialog";
import MeetupCard from "@/components/MeetupCard";
import { Meetup } from "@/types";
import { useState } from "react";
import { HiPlus } from "react-icons/hi";

const HomePage = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [meetups, setMeetups] = useState<Meetup[]>([]); // This will be replaced with Firebase data

  const handleCreateMeetup = async (data: {
    title: string;
    description: string;
    location: string;
    time: string;
    isPublic: boolean;
    maxParticipants?: number;
  }) => {
    // TODO: Implement Firebase creation
    console.log("Creating meetup:", data);
  };

  return (
    <div className="max-w-4xl mx-auto">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {meetups.map((meetup) => (
          <MeetupCard
            key={meetup.id}
            meetup={meetup}
            onJoin={() => console.log("Joining meetup:", meetup.id)}
          />
        ))}
      </div>

      <CreateMeetupDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateMeetup}
      />

      {meetups.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No meetups yet. Be the first to create one!
          </p>
        </div>
      )}
    </div>
  );
};

export default HomePage;
