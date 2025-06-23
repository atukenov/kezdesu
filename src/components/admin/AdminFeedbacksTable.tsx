import { Feedback } from "@/services/feedbackService";
import { useTranslations } from "next-intl";
import dayjs from "dayjs";

interface AdminFeedbacksTableProps {
  feedbacks: Feedback[];
  loading: boolean;
  error: string;
}

export default function AdminFeedbacksTable({ feedbacks, loading, error }: AdminFeedbacksTableProps) {
  const t = useTranslations();
  if (loading) return <div>{t("loading")}</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!feedbacks.length) return <div>{t("noResults")}</div>;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-foreground-accent rounded-lg">
        <thead>
          <tr className="bg-background-accent">
            <th className="px-4 py-2 text-left">{t("message")}</th>
            <th className="px-4 py-2 text-left">{t("email")}</th>
            <th className="px-4 py-2 text-left">{t("time")}</th>
          </tr>
        </thead>
        <tbody>
          {feedbacks.map((fb) => (
            <tr key={fb.id} className="border-t border-foreground-accent">
              <td className="px-4 py-2 whitespace-pre-line max-w-xs break-words">{fb.message}</td>
              <td className="px-4 py-2">{fb.email || <span className="text-foreground-accent">—</span>}</td>
              <td className="px-4 py-2 text-xs text-foreground-accent">{fb.createdAt?.toDate ? dayjs(fb.createdAt.toDate()).format("YYYY-MM-DD HH:mm") : ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
