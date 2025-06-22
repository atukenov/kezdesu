"use client";
import LoadingSpinner from "@/components/LoadingSpinner";
import { MeetupModel } from "@/models/MeetupModel";
import { UserModel } from "@/models/UserModel";
import { reactToMeetup, subscribeToMeetup } from "@/services/meetupService";
import { formatDistanceToNow } from "date-fns";
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

  return (
    <div
      className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => {
        window.location.href = `/meetups/${meetup.id}`;
      }}
    >
      {meetup.imageUrl && (
        <div className="relative h-48 w-full">
          <Image
            src={meetup.imageUrl}
            alt={meetup.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">{meetup.title}</h3>
          {meetup.isPublic ? (
            <HiLockOpen className="text-green-500" title={t("public")} />
          ) : (
            <HiLockClosed className="text-red-500" title={t("private")} />
          )}
        </div>
        {meetup.categories && meetup.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {meetup.categories.map((cat: string, idx: number) => (
              <span
                key={cat + idx}
                className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs"
              >
                {cat}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center text-gray-600 mb-2">
          <HiLocationMarker className="mr-1" />
          <span>{meetup.location}</span>
        </div>

        <div className="flex items-center text-gray-600 mb-2">
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
                className="w-7 h-7 rounded-full border-2 border-white shadow-sm bg-gray-100 object-cover"
                title={p.name}
              />
            ))}
            {participants.length > 5 && (
              <span className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-200 text-xs font-semibold border-2 border-white">
                +{participants.length - 5}
              </span>
            )}
          </div>
        </div>

        {meetup.description && (
          <p className="text-gray-600 mb-4">{meetup.description}</p>
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
                      ? "bg-blue-100 border-blue-400"
                      : "bg-gray-100 border-gray-200 hover:bg-blue-50"
                  }
                `}
                aria-label={t("emoji") + ` ${emoji}`}
              >
                <span>{emoji}</span>
                {users.length > 0 && (
                  <span className="ml-1 text-xs text-gray-600">
                    {users.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-500">
            {formatDistanceToNow(new Date(meetup.time), { addSuffix: true })}
          </span>
          <div className="flex gap-2">
            {isOwner && onEdit && (
              <button
                onClick={async () => {
                  setActionLoading("edit");
                  await onEdit();
                  setActionLoading(null);
                }}
                className="px-3 py-1 text-yellow-600 hover:bg-yellow-50 rounded-md transition-colors"
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
                className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                disabled={actionLoading === "delete"}
              >
                {actionLoading === "delete" ? (
                  <LoadingSpinner size={16} />
                ) : (
                  t("delete")
                )}
              </button>
            )}
            {onJoin && status === "active" && !isOwner && (
              <button
                onClick={async () => {
                  setActionLoading("join");
                  await onJoin();
                  setActionLoading(null);
                }}
                disabled={
                  isParticipant ||
                  Boolean(
                    meetup.maxParticipants &&
                      participants.length >= meetup.maxParticipants
                  ) ||
                  actionLoading === "join"
                }
                className={`px-4 py-1 rounded-md transition-colors disabled:opacity-50 ${
                  isParticipant
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                {actionLoading === "join" ? (
                  <LoadingSpinner size={16} />
                ) : isParticipant ? (
                  t("joined")
                ) : (
                  t("join")
                )}
              </button>
            )}
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
