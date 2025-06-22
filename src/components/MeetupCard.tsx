"use client";
import LoadingSpinner from "@/components/LoadingSpinner";
import { MeetupModel } from "@/models/MeetupModel";
import { UserModel } from "@/models/UserModel";
import { reactToMeetup, subscribeToMeetup } from "@/services/meetupService";
import {
  differenceInDays,
  differenceInMonths,
  differenceInYears,
  formatDistanceToNow,
} from "date-fns";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  HiLocationMarker,
  HiLockClosed,
  HiLockOpen,
  HiUsers,
} from "react-icons/hi";
import MeetupChat from "./MeetupChat";

interface MeetupCardProps {
  meetup: MeetupModel & { id: string };
  currentUser: UserModel;
  onJoin?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function MeetupCard({
  meetup,
  currentUser,
  onJoin,
  onEdit,
  onDelete,
}: MeetupCardProps) {
  const t = useTranslations();
  const [participants, setParticipants] = useState<UserModel[]>(
    meetup.participants
  );
  const [status, setStatus] = useState(meetup.status);
  const [showChat, setShowChat] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [reactions, setReactions] = useState(meetup.reactions || {});
  // RSVP handler for card
  const [rsvpLoading, setRsvpLoading] = useState(false);

  useEffect(() => {
    // Subscribe to single meetup for real-time updates
    let unsub: (() => void) | undefined;
    if (meetup.id) {
      unsub = subscribeToMeetup(meetup.id, (data) => {
        setParticipants(data.participants || []);
        setStatus(data.status);
        setReactions(data.reactions || {});
      });
    }
    return () => {
      if (unsub) unsub();
    };
  }, [meetup.id]);

  const isOwner = meetup.creatorId === currentUser.id;
  const isParticipant = participants.some(
    (p: UserModel) => p.id === currentUser.id
  );

  // Emoji reactions UI
  const EMOJIS = ["👍", "🎉", "😂", "🔥", "❤️", "😮"];
  const handleReaction = async (emoji: string) => {
    if (!currentUser) return;
    await reactToMeetup(meetup.id, emoji, currentUser.id);
  };

  // RSVP handler for card
  const handleRSVP = async () => {
    if (!currentUser) return;
    setRsvpLoading(true);
    const safeUser = {
      id: currentUser.id,
      name: currentUser.name,
      image: currentUser.image || "",
      email: currentUser.email || "",
      status: currentUser.status || "Available",
    };
    try {
      if (isParticipant) {
        // Remove RSVP
        await import("@/services/meetupService").then(({ leaveMeetup }) =>
          leaveMeetup(meetup.id, safeUser)
        );
      } else {
        // Add RSVP
        await import("@/services/meetupService").then(({ joinMeetup }) =>
          joinMeetup(meetup.id, safeUser)
        );
      }
      // Optionally, refresh participants
    } catch (err) {
      // Optionally, show error
    }
    setRsvpLoading(false);
  };

  // Calendar export
  const handleAddToCalendar = () => {
    const start = new Date(meetup.time);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // 2h default
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `DTSTART:${start.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
      `DTEND:${end.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
      `SUMMARY:${meetup.title}`,
      `DESCRIPTION:${meetup.description || ""}`,
      `LOCATION:${meetup.location}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${meetup.title}.ics`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  };

  return (
    <div
      className="bg-background rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-shadow text-foreground border border-foreground-accent"
      onClick={(e) => {
        // Prevent navigation if the click originated from a button or link
        if (
          e.target instanceof HTMLElement &&
          (e.target.closest("button") || e.target.closest("a"))
        ) {
          return;
        }
        window.location.href = `/meetups/${meetup.id}`;
      }}
    >
      {meetup.imageUrl && (
        <div className="relative h-48 w-full">
          <Image
            src={meetup.imageUrl}
            alt={meetup.title}
            fill
            className="object-cover rounded-lg"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-foreground">
            {meetup.title}
          </h3>
          {meetup.isPublic ? (
            <HiLockOpen className="text-success" title={t("public")} />
          ) : (
            <HiLockClosed className="text-danger" title={t("private")} />
          )}
        </div>
        {meetup.categories && meetup.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {meetup.categories.map((cat: string, idx: number) => (
              <span
                key={cat + idx}
                className="bg-primary-accent/20 text-primary-accent dark:bg-primary-accent/30 px-2 py-1 rounded-full text-xs font-semibold border border-primary-accent/40"
              >
                {cat}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center text-foreground-accent mb-2">
          <HiLocationMarker className="mr-1" />
          <span>{meetup.location}</span>
        </div>

        <div className="flex items-center text-foreground-accent mb-2">
          <HiUsers className="mr-1" />
          <span>
            {participants.length}
            {meetup.maxParticipants && ` / ${meetup.maxParticipants}`}
          </span>
          {/* Show participant avatars (up to 5) */}
          <div className="flex ml-2 -space-x-2">
            {participants.slice(0, 5).map((p: UserModel, idx: number) => (
              <img
                key={p.id || idx}
                src={p.image || "/images/icon.png"}
                alt={p.name}
                className="w-7 h-7 rounded-full border-2 border-background shadow-sm bg-secondary object-cover"
                title={p.name}
              />
            ))}
            {participants.length > 5 && (
              <span className="w-7 h-7 flex items-center justify-center rounded-full bg-secondary text-xs font-semibold border-2 border-background">
                +{participants.length - 5}
              </span>
            )}
          </div>
        </div>

        {meetup.description && (
          <p className="text-foreground-accent mb-4">{meetup.description}</p>
        )}

        {/* Emoji reactions */}
        <div className="flex gap-2 mb-2">
          {EMOJIS.map((emoji) => {
            const users = reactions[emoji] || [];
            const reacted = users.includes(currentUser.id);
            return (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className={`flex items-center px-2 py-1 rounded-full text-lg border transition-colors
                  ${
                    reacted
                      ? "bg-primary-accent border-primary-accent text-foreground"
                      : "bg-secondary border-foreground-accent hover:bg-primary-accent"
                  }
                `}
                aria-label={t("emoji") + ` ${emoji}`}
              >
                <span>{emoji}</span>
                {users.length > 0 && (
                  <span
                    className={`ml-1 text-xs ${
                      reacted ? "text-foreground" : "text-foreground-accent"
                    }`}
                  >
                    {users.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-foreground-accent">
            {(() => {
              const now = new Date();
              const eventDate = new Date(meetup.time);
              const minutes = Math.floor(
                (eventDate.getTime() - now.getTime()) / 60000
              );
              const days = differenceInDays(eventDate, now);
              const months = differenceInMonths(eventDate, now);
              const years = differenceInYears(eventDate, now);
              if (minutes >= 1 && minutes < 60) {
                return t("minutesLeft", { count: minutes });
              } else if (days >= 1 && days <= 30) {
                return t("daysLeft", { count: days });
              } else if (months >= 1 && months < 12) {
                return t("monthsLeft", { count: months });
              } else if (years >= 1) {
                return t("yearsLeft", { count: years });
              }
              return formatDistanceToNow(eventDate, { addSuffix: true });
            })()}
          </span>
          <div className="flex gap-2">
            {/* RSVP button for all users except owner */}
            {!isOwner && (
              <button
                onClick={handleRSVP}
                disabled={rsvpLoading || isParticipant}
                className={`px-3 py-1 rounded-md transition-colors disabled:opacity-50 ${
                  isParticipant
                    ? "bg-secondary text-foreground-accent cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {rsvpLoading
                  ? "..."
                  : isParticipant
                  ? t("joined")
                  : "RSVP / Join"}
              </button>
            )}
            {/* Add to Calendar button */}
            <button
              onClick={handleAddToCalendar}
              className="px-3 py-1 rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
              type="button"
              aria-label="Add to calendar"
            >
              📅
            </button>
            {/* Only show edit/delete for owner */}
            {isOwner && onEdit && (
              <button
                onClick={async () => {
                  setActionLoading("edit");
                  await onEdit();
                  setActionLoading(null);
                }}
                className="px-3 py-1 text-accent hover:bg-primary-accent rounded-md transition-colors"
                disabled={actionLoading === "edit"}
              >
                {actionLoading === "edit" ? (
                  <LoadingSpinner size={16} />
                ) : (
                  t("edit")
                )}
              </button>
            )}
            {isOwner && onDelete && (
              <button
                onClick={async () => {
                  setActionLoading("delete");
                  await onDelete();
                  setActionLoading(null);
                }}
                className="px-3 py-1 text-danger hover:bg-danger/80 rounded-md transition-colors"
                disabled={actionLoading === "delete"}
              >
                {actionLoading === "delete" ? (
                  <LoadingSpinner size={16} />
                ) : (
                  t("delete")
                )}
              </button>
            )}
            {/* Remove legacy onJoin button, now handled by RSVP */}
          </div>
        </div>

        {showChat && (
          <div className="mt-4">
            <MeetupChat meetupId={meetup.id} currentUser={currentUser} />
          </div>
        )}
      </div>
    </div>
  );
}
