import { HiUsers } from "react-icons/hi";

export default function MeetupParticipants({
  participants,
}: {
  participants: any[];
}) {
  return (
    <div className="flex items-center gap-2 text-gray-700">
      <HiUsers className="w-5 h-5" />
      <span>
        {Array.isArray(participants) ? participants.length : 0} participants
      </span>
      <div className="flex ml-2 -space-x-2">
        {Array.isArray(participants) &&
          participants.length > 0 &&
          participants
            .slice(0, 5)
            .map((p, idx) => (
              <img
                key={p.id || idx}
                src={p.image || "/images/icon.png"}
                alt={p.name}
                className="w-7 h-7 rounded-full border-2 border-white shadow-sm bg-gray-100 object-cover"
                title={p.name}
              />
            ))}
        {Array.isArray(participants) && participants.length > 5 && (
          <span className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-200 text-xs font-semibold border-2 border-white">
            +{participants.length - 5}
          </span>
        )}
      </div>
    </div>
  );
}
