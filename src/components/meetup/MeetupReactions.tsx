import { useTranslations } from "next-intl";

interface MeetupReactionsProps {
  reactions: { [emoji: string]: string[] };
  currentUserId: string;
  onReact: (emoji: string) => void;
  emojis?: string[];
}

export default function MeetupReactions({
  reactions,
  currentUserId,
  onReact,
  emojis = ["👍", "🎉", "😂", "🔥", "❤️", "😮"],
}: MeetupReactionsProps) {
  const t = useTranslations();
  return (
    <div className="flex gap-2 mb-2">
      {emojis.map((emoji) => {
        const users = reactions[emoji] || [];
        const reacted = users.includes(currentUserId);
        return (
          <button
            key={emoji}
            onClick={() => onReact(emoji)}
            className={`flex items-center px-2 py-1 rounded-full text-lg border transition-colors
              ${
                reacted
                  ? "bg-primary-accent border-primary-accent text-foreground"
                  : "bg-secondary border-foreground-accent hover:bg-primary-accent"
              }
            `}
            aria-label={t("emoji") + ` ${emoji}`}
          >
            <span>{emoji}</span>
            {users.length > 0 && (
              <span
                className={`ml-1 text-xs ${
                  reacted ? "text-foreground" : "text-foreground-accent"
                }`}
              >
                {users.length}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
