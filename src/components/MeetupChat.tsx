"use client";
import { rtdb } from "@/lib/firebase";
import { User } from "@/types";
import { off, onValue, push, ref } from "firebase/database";
import { useEffect, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";

interface Message {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userImage?: string;
  timestamp: number;
}

interface MeetupChatProps {
  meetupId: string;
  currentUser: User;
}

export default function MeetupChat({ meetupId, currentUser }: MeetupChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const chatRef = ref(rtdb, `chats/${meetupId}/messages`);

    // Subscribe to new messages
    onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messageList = Object.entries(data).map(
          ([id, msg]: [string, any]) => ({
            id,
            ...msg,
          })
        );
        setMessages(messageList.sort((a, b) => a.timestamp - b.timestamp));
      }
    });

    // Cleanup subscription
    return () => {
      off(chatRef);
    };
  }, [meetupId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    const chatRef = ref(rtdb, `chats/${meetupId}/messages`);
    await push(chatRef, {
      text: newMessage,
      userId: currentUser.id,
      userName: currentUser.name,
      userImage: currentUser.image,
      timestamp: Date.now(),
    });

    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-[400px] bg-white rounded-lg shadow">
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-2 ${
              message.userId === currentUser.id ? "flex-row-reverse" : ""
            }`}
          >
            {message.userImage && (
              <img
                src={message.userImage}
                alt={message.userName}
                className="w-8 h-8 rounded-full"
              />
            )}
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.userId === currentUser.id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100"
              }`}
            >
              <p className="text-xs mb-1">{message.userName}</p>
              <p>{message.text}</p>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <TextareaAutosize
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 resize-none rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxRows={4}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 hover:bg-blue-600 transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
