"use client";
import { useEffect, useState } from "react";
import { HiDownload } from "react-icons/hi";

export default function InstallPwaButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);
  const [showIcon, setShowIcon] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
      setShowIcon(false);
      // After 10 seconds, show the download icon
      setTimeout(() => setShowIcon(true), 10000);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setShow(false);
  };

  if (!show) return null;
  return (
    <button
      className="fixed bottom-4 right-4 z-50 px-4 py-2 bg-primary text-white rounded shadow-lg flex items-center gap-2"
      onClick={handleInstall}
    >
      {showIcon ? <HiDownload className="w-5 h-5" /> : null}
      {showIcon ? null : "Install Kezdesu App"}
    </button>
  );
}
