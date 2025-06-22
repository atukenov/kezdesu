import { useState } from "react";

interface ReasonOption {
  value: string;
  label: string;
}

interface ReportMeetupDialogProps {
  open: boolean;
  meetupTitle: string;
  onClose: () => void;
  onSubmit: (reason: string, details: string) => void;
  loading?: boolean;
  title?: string;
  description?: string;
  submitLabel?: string;
  cancelLabel?: string;
  reasonOptions?: ReasonOption[];
  selectLabel?: string;
  detailsLabel?: string;
  detailsPlaceholder?: string;
  submittingLabel?: string;
}

export default function ReportMeetupDialog({
  open,
  meetupTitle,
  onClose,
  onSubmit,
  loading = false,
  title = "Report Meetup",
  description = "Reporting:",
  submitLabel = "Submit Report",
  cancelLabel = "Cancel",
  reasonOptions = [
    { value: "spam", label: "Spam or misleading" },
    { value: "inappropriate", label: "Inappropriate content" },
    { value: "harassment", label: "Harassment or abuse" },
    { value: "other", label: "Other" },
  ],
  selectLabel = "Select a reason...",
  detailsLabel = "Details (optional)",
  detailsPlaceholder = "Add more details (optional)",
  submittingLabel = "Submitting...",
}: ReportMeetupDialogProps) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-background rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-foreground-accent hover:text-primary"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <div className="mb-2 text-sm text-foreground-accent">
          {description} <span className="font-semibold">{meetupTitle}</span>
        </div>
        <label className="block mb-2">
          <span className="font-semibold">{selectLabel}</span>
          <select
            className="block w-full mt-1 border rounded p-2"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          >
            <option value="">{selectLabel}</option>
            {reasonOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block mb-4">
          <span className="font-semibold">{detailsLabel}</span>
          <textarea
            className="block w-full mt-1 border rounded p-2"
            rows={3}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder={detailsPlaceholder}
          />
        </label>
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded bg-muted text-foreground hover:bg-muted/80"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            className="px-4 py-2 rounded bg-primary text-white hover:bg-primary/90 disabled:opacity-60"
            onClick={() => onSubmit(reason, details)}
            disabled={loading || !reason}
          >
            {loading ? submittingLabel : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
