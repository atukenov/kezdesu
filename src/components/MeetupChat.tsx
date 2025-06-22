"use client";
import { MessageModel } from "@/models/MessageModel";
import { UserModel } from "@/models/UserModel";
import {
  reactToMessage,
  sendMessage as sendMessageService,
  subscribeToMessages,
} from "@/services/messageService";
import { useEffect, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";

interface Message {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userImage?: string;
  timestamp: number;
  reactions?: { [key: string]: string[] }; // emoji: userIds
}

interface MeetupChatProps {
  meetupId: string;
  currentUser: UserModel;
}

export default function MeetupChat({ meetupId, currentUser }: MeetupChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const EMOJIS = ["👍", "🎉", "😂", "🔥", "❤️", "😮"];

  useEffect(() => {
    const unsub = subscribeToMessages(meetupId, (messageList) => {
      setMessages(messageList as Message[]);
    });
    return () => unsub();
  }, [meetupId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;
    await sendMessageService(meetupId, {
      text: newMessage,
      userId: currentUser.id,
      userName: currentUser.name,
      userImage: currentUser.image,
      timestamp: Date.now(),
    } as MessageModel);
    setNewMessage("");
  };

  // Send message on Enter (without Shift)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e as any);
    }
  };

  // Emoji picker state
  const [showEmojiPickerFor, setShowEmojiPickerFor] = useState<string | null>(
    null
  );
  let emojiPickerTimeout: NodeJS.Timeout | null = null;

  return (
    <div className="flex flex-col h-[400px] bg-white rounded-lg shadow">
      <div className="flex-1 p-2 overflow-y-auto space-y-2">
        {messages.map((message) => {
          // Collect all emojis that have at least one reaction
          const reactedEmojis = Object.entries(message.reactions || {})
            .filter(([_, users]) => users.length > 0)
            .map(([emoji, users]) => ({
              emoji,
              count: users.length,
              reacted: users.includes(currentUser.id),
            }));

          return (
            <div
              key={message.id}
              className={`relative flex items-end gap-2 ${
                message.userId === currentUser.id ? "flex-row-reverse" : ""
              }`}
            >
              {message.userImage && (
                <img
                  src={message.userImage}
                  alt={message.userName}
                  className="w-7 h-7 rounded-full"
                />
              )}
              <div
                className={`relative max-w-[70%] rounded-lg px-3 py-2 text-sm shadow-sm ${
                  message.userId === currentUser.id
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100"
                }`}
                onPointerDown={(e) => {
                  emojiPickerTimeout = setTimeout(
                    () => setShowEmojiPickerFor(message.id),
                    500
                  );
                }}
                onPointerUp={() => {
                  if (emojiPickerTimeout) clearTimeout(emojiPickerTimeout);
                }}
                onPointerLeave={() => {
                  if (emojiPickerTimeout) clearTimeout(emojiPickerTimeout);
                }}
              >
                <p className="text-xs mb-0.5 font-medium opacity-80">
                  {message.userName}
                </p>
                <p className="break-words whitespace-pre-line">
                  {message.text}
                </p>
                {/* Reaction bar: show all emojis with reactions, bottom-left of bubble */}
                {reactedEmojis.length > 0 && (
                  <div
                    className="absolute left-2 -bottom-4 flex gap-0.5 z-10"
                    style={{ pointerEvents: "auto" }}
                  >
                    {reactedEmojis.map(({ emoji, count, reacted }) => (
                      <button
                        key={emoji}
                        onClick={() =>
                          reactToMessage(
                            meetupId,
                            message.id,
                            emoji,
                            currentUser.id
                          )
                        }
                        className={`flex items-center px-0.5 py-0.5 rounded transition-all focus:outline-none focus:ring-1 focus:ring-blue-300
                          ${
                            reacted
                              ? "bg-blue-100"
                              : "bg-transparent hover:bg-blue-50"
                          }
                        `}
                        style={{
                          fontSize: 16,
                          minWidth: 18,
                          minHeight: 18,
                          lineHeight: 1,
                        }}
                        aria-label={`Reacted with ${emoji}`}
                      >
                        <span className="" style={{ fontSize: 16 }}>
                          {emoji}
                        </span>
                        {count > 1 && (
                          <span
                            className="ml-0.5 text-[10px] font-semibold text-gray-500"
                            style={{ lineHeight: 1 }}
                          >
                            {count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                {/* Emoji picker (on long-press) */}
                {showEmojiPickerFor === message.id && (
                  <div className="absolute z-20 left-1/2 -translate-x-1/2 bottom-full mb-2 flex gap-1 bg-white border rounded-xl shadow-lg p-2 animate-fade-in">
                    {EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          reactToMessage(
                            meetupId,
                            message.id,
                            emoji,
                            currentUser.id
                          );
                          setShowEmojiPickerFor(null);
                        }}
                        className="text-2xl hover:scale-125 transition-transform focus:outline-none"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <form onSubmit={sendMessage} className="p-2 border-t">
        <div className="flex gap-2">
          <TextareaAutosize
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 resize-none rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            maxRows={4}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-3 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 hover:bg-blue-600 transition-colors text-sm"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
