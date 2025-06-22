"use client";
import { useState } from "react";
import { HiStatusOffline, HiStatusOnline } from "react-icons/hi";

interface StatusToggleProps {
  initialStatus?: "available" | "busy";
  onStatusChange?: (status: "available" | "busy") => void;
}

export default function StatusToggle({
  initialStatus = "busy",
  onStatusChange,
}: StatusToggleProps) {
  const [status, setStatus] = useState(initialStatus);

  const toggleStatus = () => {
    const newStatus = status === "available" ? "busy" : "available";
    setStatus(newStatus);
    onStatusChange?.(newStatus);
  };

  return (
    <button
      onClick={toggleStatus}
      className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-colors ${
        status === "available"
          ? "bg-green-100 text-green-600"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      {status === "available" ? (
        <HiStatusOnline className="h-5 w-5" />
      ) : (
        <HiStatusOffline className="h-5 w-5" />
      )}
      <span className="capitalize">{status}</span>
    </button>
  );
}
