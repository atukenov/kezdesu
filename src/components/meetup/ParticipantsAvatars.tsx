import UserAvatar from "@/components/shared/UserAvatar";
import { UserModel } from "@/models/UserModel";

interface ParticipantsAvatarsProps {
  participants: UserModel[];
}

export default function ParticipantsAvatars({
  participants,
}: ParticipantsAvatarsProps) {
  return (
    <div className="flex ml-2 -space-x-2">
      {participants.slice(0, 5).map((p: UserModel, idx: number) => (
        <UserAvatar
          key={p.id || idx}
          src={p.image}
          alt={p.name}
          size={28}
          className="border-2 border-background shadow-sm bg-secondary"
        />
      ))}
      {participants.length > 5 && (
        <span className="w-7 h-7 flex items-center justify-center rounded-full bg-secondary text-xs font-semibold border-2 border-background">
          +{participants.length - 5}
        </span>
      )}
    </div>
  );
}
