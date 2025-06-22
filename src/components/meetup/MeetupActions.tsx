import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { MeetupModel } from "@/models/MeetupModel";
import { UserModel } from "@/models/UserModel";
import { useTranslations } from "next-intl";

interface MeetupActionsProps {
  meetup: MeetupModel & { id: string };
  currentUser: UserModel;
  isOwner: boolean;
  isParticipant: boolean;
  status: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onJoin?: () => void;
  handleRSVP: () => void;
  rsvpLoading: boolean;
  actionLoading: string | null;
  handleAddToCalendar: () => void;
}

export default function MeetupActions({
  meetup,
  currentUser,
  isOwner,
  isParticipant,
  status,
  onEdit,
  onDelete,
  onJoin,
  handleRSVP,
  rsvpLoading,
  actionLoading,
  handleAddToCalendar,
}: MeetupActionsProps) {
  const t = useTranslations();
  return (
    <div className="flex gap-2">
      {/* RSVP button for all users except owner */}
      {!isOwner && (
        <button
          onClick={handleRSVP}
          disabled={
            rsvpLoading ||
            (meetup.maxParticipants &&
              meetup.participants.length >= meetup.maxParticipants) ||
            isParticipant
          }
          className={`px-3 py-1 rounded-md transition-colors disabled:opacity-50 ${
            isParticipant
              ? "bg-secondary text-foreground-accent cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          {rsvpLoading ? (
            <LoadingSpinner size={16} />
          ) : isParticipant ? (
            t("joined")
          ) : (
            t("join")
          )}
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
            if (onEdit) await onEdit();
          }}
          className="px-3 py-1 text-accent hover:bg-primary-accent rounded-md transition-colors"
          disabled={actionLoading === "edit"}
        >
          {actionLoading === "edit" ? <LoadingSpinner size={16} /> : t("edit")}
        </button>
      )}
      {isOwner && onDelete && (
        <button
          onClick={async () => {
            if (onDelete) await onDelete();
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
    </div>
  );
}
