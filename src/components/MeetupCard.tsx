"use client";
import type { Meetup } from "@/types";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import {
  HiLocationMarker,
  HiLockClosed,
  HiLockOpen,
  HiUsers,
} from "react-icons/hi";

interface MeetupCardProps {
  meetup: Meetup;
  onJoin?: () => void;
}

export default function MeetupCard({ meetup, onJoin }: MeetupCardProps) {
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
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{meetup.title}</h3>
          {meetup.isPublic ? (
            <HiLockOpen className="text-green-500" />
          ) : (
            <HiLockClosed className="text-gray-500" />
          )}
        </div>

        <p className="text-gray-600 mt-2">{meetup.description}</p>

        <div className="flex items-center mt-3 text-gray-500">
          <HiLocationMarker className="mr-1" />
          <span className="text-sm">{meetup.location}</span>
        </div>

        <div className="flex items-center mt-2 text-gray-500">
          <HiUsers className="mr-1" />
          <span className="text-sm">
            {meetup.participants.length}
            {meetup.maxParticipants && ` / ${meetup.maxParticipants}`}{" "}
            participants
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {formatDistanceToNow(new Date(meetup.time), { addSuffix: true })}
          </span>

          {onJoin && (
            <button
              onClick={onJoin}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Join
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
