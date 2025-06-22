import {
  differenceInDays,
  differenceInMonths,
  differenceInYears,
  formatDistanceToNow,
} from "date-fns";
import { useTranslations } from "next-intl";

interface MeetupTimeLeftProps {
  time: string;
}

export default function MeetupTimeLeft({ time }: MeetupTimeLeftProps) {
  const t = useTranslations();
  const now = new Date();
  const eventDate = new Date(time);
  const minutes = Math.floor((eventDate.getTime() - now.getTime()) / 60000);
  const days = differenceInDays(eventDate, now);
  const months = differenceInMonths(eventDate, now);
  const years = differenceInYears(eventDate, now);
  if (minutes >= 1 && minutes < 60) {
    return <span>{t("minutesLeft", { count: minutes })}</span>;
  } else if (days >= 1 && days <= 30) {
    return <span>{t("daysLeft", { count: days })}</span>;
  } else if (months >= 1 && months < 12) {
    return <span>{t("monthsLeft", { count: months })}</span>;
  } else if (years >= 1) {
    return <span>{t("yearsLeft", { count: years })}</span>;
  }
  return <span>{formatDistanceToNow(eventDate, { addSuffix: true })}</span>;
}
