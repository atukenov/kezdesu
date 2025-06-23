"use client";
import { submitFeedback } from "@/services/feedbackService";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { HiChatAlt2 } from "react-icons/hi";

export default function FeedbackWidget() {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await submitFeedback({ message, email });
      setSuccess(true);
      setMessage("");
      setEmail("");
      setTimeout(() => setOpen(false), 2000);
    } catch (err: any) {
      setError(t("feedback.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        className="fixed bottom-4 left-4 z-50 bg-primary text-white rounded-full p-3 shadow-lg hover:bg-primary-dark focus:outline-none"
        onClick={() => setOpen(true)}
        aria-label={t("feedback.open")}
      >
        <HiChatAlt2 className="w-6 h-6" />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-sm shadow-xl relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setOpen(false)}
              aria-label={t("feedback.close")}
            >
              ×
            </button>
            <h2 className="text-lg font-semibold mb-2">
              {t("feedback.title")}
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <textarea
                className="border rounded p-2 w-full min-h-[80px]"
                placeholder={t("feedback.placeholder")}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
              <input
                className="border rounded p-2 w-full"
                type="email"
                placeholder={t("feedback.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {error && <div className="text-red-600 text-sm">{error}</div>}
              {success && (
                <div className="text-green-600 text-sm">
                  {t("feedback.success")}
                </div>
              )}
              <button
                type="submit"
                className="bg-primary text-white rounded px-4 py-2 mt-2 disabled:opacity-60"
                disabled={loading}
              >
                {loading ? t("feedback.submitting") : t("feedback.submit")}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
