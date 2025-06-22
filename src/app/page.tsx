"use client";
import MeetupCard from "@/components/meetup/MeetupCard";
import { useAuth } from "@/components/providers/AuthProvider";
import SignIn from "@/components/SignIn";
import { MeetupModel } from "@/models/MeetupModel";
import { UserModel } from "@/models/UserModel";
import { stripUndefinedFields } from "@/services/commonService";
import {
  archiveMeetup,
  joinMeetup,
  subscribeToMeetups,
} from "@/services/meetupService";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const HomePage = () => {
  const t = useTranslations();
  const { user, loading } = useAuth();
  const [meetups, setMeetups] = useState<(MeetupModel & { id: string })[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  useEffect(() => {
    if (!user) return;
    // Use service for real-time meetups
    const unsub = subscribeToMeetups((meetupList) => {
      setMeetups(meetupList);
      // Auto-archive expired meetups for all users
      meetupList.forEach((meetup) => {
        const isExpired = new Date(meetup.time) < new Date();
        if (isExpired && !meetup.archived) {
          archiveMeetup(meetup.id);
        }
      });
    });
    return () => unsub();
  }, [user]);

  const handleJoinMeetup = async (meetupId: string) => {
    if (!user) return;
    try {
      await joinMeetup(meetupId, stripUndefinedFields(user as UserModel));
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
        <h1 className="text-2xl font-bold text-foreground flex-shrink-0">
          {t("recentMeetups")}
        </h1>
      </div>
      <div className="flex mb-8">
        <input
          type="text"
          placeholder={t("searchPlaceholder")}
          className="w-full max-w-md border border-foreground-accent focus:border-primary focus:ring-2 focus:ring-primary-accent rounded-lg px-4 py-2 text-sm shadow-sm transition-all placeholder-foreground-accent bg-background text-foreground"
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
    </div>
  );
};

export default HomePage;
