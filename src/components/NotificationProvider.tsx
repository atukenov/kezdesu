import { createContext, ReactNode, useContext, useState } from "react";

export interface Notification {
  id: string;
  message: string;
  type?: "info" | "success" | "error";
  duration?: number; // ms
}

interface NotificationContextType {
  notify: (
    message: string,
    type?: Notification["type"],
    duration?: number
  ) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error("useNotification must be used within NotificationProvider");
  return ctx;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = (
    message: string,
    type: Notification["type"] = "info",
    duration = 3000
  ) => {
    const id = Math.random().toString(36).slice(2);
    setNotifications((prev) => [...prev, { id, message, type, duration }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, duration);
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <NotificationContainer notifications={notifications} />
    </NotificationContext.Provider>
  );
}

function NotificationContainer({
  notifications,
}: {
  notifications: Notification[];
}) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`px-4 py-2 rounded shadow-lg text-white animate-fade-in-down transition-all
            ${
              n.type === "success"
                ? "bg-green-500"
                : n.type === "error"
                ? "bg-red-500"
                : "bg-blue-500"
            }
          `}
        >
          {n.message}
        </div>
      ))}
    </div>
  );
}
