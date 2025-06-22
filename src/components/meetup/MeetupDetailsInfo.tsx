import InfoRow from "@/components/shared/InfoRow";
import {
  HiClock,
  HiLocationMarker,
  HiLockClosed,
  HiLockOpen,
} from "react-icons/hi";

export default function MeetupDetailsInfo({ meetup }: { meetup: any }) {
  return (
    <div className="flex flex-col gap-2 mb-4">
      <InfoRow icon={<HiLocationMarker className="w-5 h-5" />}>
        <span>{meetup.location}</span>
      </InfoRow>
      <InfoRow icon={<HiClock className="w-5 h-5" />}>
        <span>{meetup.time && new Date(meetup.time).toLocaleString()}</span>
      </InfoRow>
      <InfoRow
        icon={
          meetup.isPublic ? (
            <HiLockOpen className="w-5 h-5 text-green-500" />
          ) : (
            <HiLockClosed className="w-5 h-5 text-red-500" />
          )
        }
      >
        <span className="capitalize">
          {meetup.isPublic ? "public" : "private"}
        </span>
      </InfoRow>
      <InfoRow icon={null}>
        <span
          className={`inline-block px-3 py-1 rounded-full text-white text-xs ${
            meetup.status === "active"
              ? "bg-green-500"
              : meetup.status === "cancelled"
              ? "bg-red-500"
              : "bg-gray-400"
          }`}
        >
          {meetup.status.charAt(0).toUpperCase() + meetup.status.slice(1)}
        </span>
      </InfoRow>
      {meetup.categories && meetup.categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
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
    </div>
  );
}
