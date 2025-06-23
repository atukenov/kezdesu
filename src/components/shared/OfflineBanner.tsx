"use client";
import { useEffect, useState } from "react";

export default function OfflineBanner() {
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    setOffline(!navigator.onLine); // Set initial state on mount (client only)
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!offline) return null;
  return (
    <div className="w-full bg-yellow-500 text-black text-center py-2 shadow-md animate-pulse">
      You are offline. Some features may be unavailable.
    </div>
  );
}
