"use client";
import LoadingSpinner from "@/components/LoadingSpinner";
import { rtdb } from "@/lib/firebase";
import type { Meetup, User } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { off, onValue, ref } from "firebase/database";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  HiChatAlt,
  HiLocationMarker,
  HiLockClosed,
  HiLockOpen,
  HiUsers,
} from "react-icons/hi";
import MeetupChat from "./MeetupChat";

interface MeetupCardProps {
  meetup: Meetup;
  currentUser: User;
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
  const [participants, setParticipants] = useState(meetup.participants);
  const [status, setStatus] = useState(meetup.status);
  const [showChat, setShowChat] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to participants updates
    const participantsRef = ref(rtdb, `meetups/${meetup.id}/participants`);
    onValue(participantsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setParticipants(Object.values(data));
      }
    });

    // Subscribe to status updates
    const statusRef = ref(rtdb, `meetups/${meetup.id}/status`);
    onValue(statusRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setStatus(data);
      }
    });

    return () => {
      // Cleanup subscriptions
      off(participantsRef);
      off(statusRef);
    };
  }, [meetup.id]);

  const isOwner = meetup.creatorId === currentUser.id;
  const isParticipant = participants.some((p: any) => p.id === currentUser.id);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
            <HiLockOpen className="text-green-500" />
          ) : (
            <HiLockClosed className="text-red-500" />
          )}
        </div>

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
        </div>

        {meetup.description && (
          <p className="text-gray-600 mb-4">{meetup.description}</p>
        )}

        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-500">
            {formatDistanceToNow(new Date(meetup.time), { addSuffix: true })}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setShowChat(!showChat)}
              className="px-3 py-1 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
            >
              <HiChatAlt className="w-5 h-5" />
            </button>
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
                  "Edit"
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
                  "Delete"
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
                  "Joined"
                ) : (
                  "Join"
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
