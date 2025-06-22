import { ReportModel } from "@/services/reportService";
import { useTranslations } from "next-intl";
import { HiArrowUp, HiBan, HiCheckCircle } from "react-icons/hi";

interface AdminReportsTableProps {
  reports: ReportModel[];
  onResolve?: (report: ReportModel) => void;
  onDismiss?: (report: ReportModel) => void;
  onEscalate?: (report: ReportModel) => void;
}

export default function AdminReportsTable({
  reports,
  onResolve,
  onDismiss,
  onEscalate,
}: AdminReportsTableProps) {
  const t = useTranslations();
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm border rounded-lg">
        <thead>
          <tr className="bg-muted text-foreground">
            <th className="px-3 py-2 text-left">{t("meetup_id")}</th>
            <th className="px-3 py-2 text-left">{t("report_reporter")}</th>
            <th className="px-3 py-2 text-left">{t("report_reason")}</th>
            <th className="px-3 py-2 text-left">{t("report_details")}</th>
            <th className="px-3 py-2 text-left">{t("report_status")}</th>
            <th className="px-3 py-2 text-left">{t("actions")}</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.id} className="border-b last:border-b-0">
              <td className="px-3 py-2">{report.meetupId}</td>
              <td className="px-3 py-2">{report.reporterId}</td>
              <td className="px-3 py-2">
                {t(`report_reason_${report.reason}`) || report.reason}
              </td>
              <td className="px-3 py-2">{report.details}</td>
              <td className="px-3 py-2 capitalize">
                {t(`report_status_${report.status}`) || report.status}
              </td>
              <td className="px-3 py-2 flex gap-2 items-center">
                {report.status !== "resolved" && (
                  <>
                    <button
                      className="text-green-600 hover:bg-green-50 rounded p-1"
                      title={t("mark_resolved")}
                      onClick={() => onResolve && onResolve(report)}
                      aria-label={t("mark_resolved")}
                    >
                      <HiCheckCircle size={18} />
                    </button>
                    <button
                      className="text-yellow-600 hover:bg-yellow-50 rounded p-1"
                      title={t("dismiss")}
                      onClick={() => onDismiss && onDismiss(report)}
                      aria-label={t("dismiss")}
                    >
                      <HiBan size={18} />
                    </button>
                    <button
                      className="text-red-600 hover:bg-red-50 rounded p-1"
                      title={t("escalate")}
                      onClick={() => onEscalate && onEscalate(report)}
                      aria-label={t("escalate")}
                    >
                      <HiArrowUp size={18} />
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
