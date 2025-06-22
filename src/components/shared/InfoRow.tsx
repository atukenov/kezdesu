import { ReactNode } from "react";

interface InfoRowProps {
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function InfoRow({
  icon,
  children,
  className = "",
}: InfoRowProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {icon}
      {children}
    </div>
  );
}
