import LoadingSpinner from "@/components/shared/LoadingSpinner";

export default function RSVPButton({
  isOwner,
  isParticipant,
  rsvpLoading,
  onRSVP,
}: {
  isOwner: boolean;
  isParticipant: boolean;
  rsvpLoading: boolean;
  onRSVP: () => void;
}) {
  if (isOwner) return null;
  return (
    <button
      onClick={onRSVP}
      className={`px-4 py-2 rounded transition-colors ${
        isParticipant
          ? "bg-gray-400 text-white cursor-not-allowed"
          : "bg-green-600 text-white hover:bg-green-700"
      }`}
      disabled={rsvpLoading || isParticipant}
    >
      {rsvpLoading ? (
        <LoadingSpinner size={18} />
      ) : isParticipant ? (
        "Joined"
      ) : (
        "RSVP / Join Meetup"
      )}
    </button>
  );
}
