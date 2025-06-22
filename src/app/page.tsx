"use client";
import { useAuth } from "@/components/AuthProvider";
import CreateMeetupDialog from "@/components/CreateMeetupDialog";
import MeetupCard from "@/components/MeetupCard";
import SignIn from "@/components/SignIn";
import { MeetupModel } from "@/models/MeetupModel";
import { UserModel } from "@/models/UserModel";
import {
  archiveMeetup,
  createMeetup,
  joinMeetup,
  subscribeToMeetups,
} from "@/services/meetupService";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { HiPlus } from "react-icons/hi";

const HomePage = () => {
  const t = useTranslations();
  const { user, loading } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [meetups, setMeetups] = useState<(MeetupModel & { id: string })[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  useEffect(() => {
    if (!user) return;
    // Use service for real-time meetups
    const unsub = subscribeToMeetups((meetupList) => {
      setMeetups(meetupList);
    });
    return () => unsub();
  }, [user]);

  const handleCreateMeetup = async (
    data: Omit<
      MeetupModel,
      "id" | "participants" | "creatorId" | "creator" | "status" | "archived"
    > & { categories?: string[] }
  ) => {
    if (!user) return;
    try {
      await createMeetup({
        ...data,
        creatorId: user.id,
        creator: user as UserModel,
        status: "active",
        participants: [user as UserModel],
        time: new Date(data.time).toISOString(),
        archived: false,
        categories: data.categories || [],
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Error creating meetup:", error);
    }
  };

  const handleJoinMeetup = async (meetupId: string) => {
    if (!user) return;
    try {
      await joinMeetup(meetupId, user as UserModel);
    } catch (error) {
      console.error("Error joining meetup:", error);
    }
  };

  // Archive (delete) meetup
  const handleArchiveMeetup = async (meetup: MeetupModel & { id: string }) => {
    if (!user || meetup.creatorId !== user.id) return;
    try {
      await archiveMeetup(meetup.id);
    } catch (error) {
      console.error("Error archiving meetup:", error);
    }
  };

  // Filter meetups by category/tag if filter is set
  const filteredMeetups = categoryFilter
    ? meetups.filter(
        (m) => m.categories && m.categories.includes(categoryFilter)
      )
    : meetups;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div
          className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"
          aria-label={t("loading")}
        />
      </div>
    );
  }

  if (!user) {
    return <SignIn />;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex flex-row sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <h1 className="text-2xl font-bold text-gray-900 flex-shrink-0">
          {t("recentMeetups")}
        </h1>
        <div className="flex flex-1 gap-2 items-center justify-end">
          <button
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600 transition-colors font-semibold text-base"
            aria-label={t("createMeetup")}
          >
            <HiPlus className="mr-2 text-lg" />
            {t("createMeetup")}
          </button>
        </div>
      </div>
      <div className="flex mb-8">
        <input
          type="text"
          placeholder={t("searchPlaceholder")}
          className="w-full max-w-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg px-4 py-2 text-sm shadow-sm transition-all placeholder-gray-400 bg-white"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          aria-label={t("search")}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {filteredMeetups.map((meetup) => (
          <MeetupCard
            key={meetup.id}
            meetup={meetup}
            currentUser={user as UserModel}
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
