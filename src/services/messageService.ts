import { db } from "@/lib/firebase";
import { MessageModel, toMessageModel } from "@/models/MessageModel";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  Unsubscribe,
  updateDoc,
} from "firebase/firestore";

// Subscribe to messages in a meetup (real-time)
export function subscribeToMessages(
  meetupId: string,
  callback: (messages: (MessageModel & { id: string })[]) => void
): Unsubscribe {
  const messagesRef = collection(db, "meetups", meetupId, "messages");
  const q = query(messagesRef, orderBy("timestamp", "asc"));
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(
      (doc) =>
        toMessageModel(doc.data(), doc.id) as MessageModel & { id: string }
    );
    callback(messages);
  });
}

// Send a message to a meetup
export async function sendMessage(
  meetupId: string,
  data: MessageModel
): Promise<string> {
  const messagesRef = collection(db, "meetups", meetupId, "messages");
  const ref = await addDoc(messagesRef, data);
  return ref.id;
}

// Get all messages (one-time fetch)
export async function getMessages(
  meetupId: string
): Promise<(MessageModel & { id: string })[]> {
  const messagesRef = collection(db, "meetups", meetupId, "messages");
  const q = query(messagesRef, orderBy("timestamp", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map(
    (doc) => toMessageModel(doc.data(), doc.id) as MessageModel & { id: string }
  );
}

// Add or remove a reaction to a message
export async function reactToMessage(
  meetupId: string,
  messageId: string,
  emoji: string,
  userId: string
): Promise<void> {
  const ref = doc(db, "meetups", meetupId, "messages", messageId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Message not found");
  const data = snap.data();
  const reactions = { ...(data.reactions || {}) };
  const users = new Set(reactions[emoji] || []);
  if (users.has(userId)) {
    users.delete(userId); // Remove reaction if already present
  } else {
    users.add(userId); // Add reaction
  }
  reactions[emoji] = Array.from(users);
  await updateDoc(ref, { reactions });
}
