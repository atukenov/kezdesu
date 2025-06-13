"use client";
import { Toaster } from "react-hot-toast";

export default function Notification() {
  return <Toaster position="top-right" toastOptions={{ duration: 3000 }} />;
}
