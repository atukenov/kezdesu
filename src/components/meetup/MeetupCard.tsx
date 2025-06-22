"use client";
import MeetupActions from "@/components/meetup/MeetupActions";
import MeetupReactions from "@/components/meetup/MeetupReactions";
import MeetupTimeLeft from "@/components/meetup/MeetupTimeLeft";
import ParticipantsAvatars from "@/components/meetup/ParticipantsAvatars";
import ReportMeetupDialog from "@/components/meetup/ReportMeetupDialog";
import ErrorDialog from "@/components/shared/ErrorDialog";
import { MeetupModel } from "@/models/MeetupModel";
import { UserModel } from "@/models/UserModel";
import { subscribeToMeetup } from "@/services/meetupService";
import { reportMeetup } from "@/services/reportService";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  HiFlag,
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
  const [reportOpen, setReportOpen] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState("");

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

  // Emoji reactions UI
  const EMOJIS = ["👍", "🎉", "😂", "🔥", "❤️", "😮"];
  const handleReaction = async (emoji: string) => {
    if (!currentUser) return;
    await import("@/services/meetupService").then(({ reactToMeetup }) =>
      reactToMeetup(meetup.id, emoji, currentUser.id)
    );
  };

  const handleReport = async (reason: string, details: string) => {
    setReportLoading(true);
    try {
      await reportMeetup({
        meetupId: meetup.id,
        reporterId: currentUser.id,
        reason,
        details,
      });
      setReportSuccess(true);
      setTimeout(() => setReportSuccess(false), 2000);
      setReportOpen(false);
    } catch (e: any) {
      setReportError(e.message || "Failed to submit report.");
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div
      className="bg-background rounded-lg shadow p-4 cursor-default hover:shadow-lg transition-shadow text-foreground border border-foreground-accent"
      tabIndex={0}
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
            <a
              href={`/meetups/${meetup.id}`}
              className="hover:underline focus:underline outline-none"
              tabIndex={0}
              onClick={(e) => e.stopPropagation()}
            >
              {meetup.title}
            </a>
          </h3>
          <div className="flex items-center gap-2">
            {meetup.isPublic ? (
              <HiLockOpen className="text-success" title={t("public")} />
            ) : (
              <HiLockClosed className="text-danger" title={t("private")} />
            )}
            <button
              className="p-1 rounded hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setReportOpen(true);
              }}
              title="Report this meetup"
              aria-label="Report this meetup"
            >
              <HiFlag size={18} />
            </button>
          </div>
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
          <ParticipantsAvatars participants={participants} />
        </div>

        {meetup.description && (
          <p className="text-foreground-accent mb-4">{meetup.description}</p>
        )}

        {/* Emoji reactions */}
        <MeetupReactions
          reactions={reactions}
          currentUserId={currentUser.id}
          onReact={handleReaction}
        />

        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-foreground-accent">
            <MeetupTimeLeft time={meetup.time} />
          </span>
          <MeetupActions
            meetup={meetup}
            currentUser={currentUser}
            isOwner={isOwner}
            isParticipant={isParticipant}
            status={status}
            onEdit={onEdit}
            onDelete={onDelete}
            onJoin={onJoin}
            handleRSVP={handleRSVP}
            rsvpLoading={rsvpLoading}
            actionLoading={actionLoading}
            handleAddToCalendar={handleAddToCalendar}
          />
        </div>

        <ReportMeetupDialog
          open={reportOpen}
          meetupTitle={meetup.title}
          onClose={() => setReportOpen(false)}
          onSubmit={handleReport}
          loading={reportLoading}
          data-modal-root="true"
          title={t("report_meetup_title", { title: meetup.title })}
          description={t("report_meetup_description")}
          submitLabel={t("submit_report")}
          cancelLabel={t("cancel")}
          reasonOptions={[
            { value: "spam", label: t("report_reason_spam") },
            { value: "inappropriate", label: t("report_reason_inappropriate") },
            { value: "harassment", label: t("report_reason_harassment") },
            { value: "other", label: t("report_reason_other") },
          ]}
          selectLabel={t("report_select_reason")}
          detailsLabel={t("report_details_label")}
          detailsPlaceholder={t("report_details_placeholder")}
          submittingLabel={t("report_submitting")}
        />
        {reportSuccess && (
          <div className="text-green-600 text-xs mt-2">
            Report submitted. Thank you!
          </div>
        )}
        <ErrorDialog
          open={!!reportError}
          message={reportError}
          onClose={() => setReportError("")}
        />

        {showChat && (
          <div className="mt-4">
            <MeetupChat meetupId={meetup.id} currentUser={currentUser} />
          </div>
        )}
      </div>
    </div>
  );
}
