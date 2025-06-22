"use client";
import { Toaster } from "react-hot-toast";

export default function Notification() {
  return <Toaster position="bottom-right" toastOptions={{ duration: 3000 }} />;
}
