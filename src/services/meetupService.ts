import { db } from "@/lib/firebase";
import { MeetupModel, toMeetupModel } from "@/models/MeetupModel";
import { UserModel } from "@/models/UserModel";
import { stripUndefinedFields } from "@/services/commonService";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  Unsubscribe,
  updateDoc,
  where,
} from "firebase/firestore";

// Subscribe to all meetups (real-time)
export function subscribeToMeetups(
  callback: (meetups: (MeetupModel & { id: string })[]) => void
): Unsubscribe {
  const q = query(
    collection(db, "meetups"),
    where("archived", "!=", true),
    orderBy("time", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    const meetups = snapshot.docs.map(
      (doc) => toMeetupModel(doc.data(), doc.id) as MeetupModel & { id: string }
    );
    callback(meetups);
  });
}

// Get a single meetup by ID (one-time fetch)
export async function getMeetup(
  id: string
): Promise<MeetupModel & { id: string }> {
  const ref = doc(db, "meetups", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Meetup not found");
  return toMeetupModel(snap.data(), snap.id) as MeetupModel & { id: string };
}

// Create a new meetup
export async function createMeetup(data: MeetupModel): Promise<string> {
  const cleanData = stripUndefinedFields(data);
  const ref = await addDoc(collection(db, "meetups"), cleanData);
  return ref.id;
}

// Update a meetup
export async function updateMeetup(
  id: string,
  data: Partial<MeetupModel>
): Promise<void> {
  const ref = doc(db, "meetups", id);
  await updateDoc(ref, data);
}

// Archive (soft-delete) a meetup
export async function archiveMeetup(id: string): Promise<void> {
  await updateMeetup(id, { archived: true });
}

// Join a meetup
export async function joinMeetup(id: string, user: UserModel): Promise<void> {
  const ref = doc(db, "meetups", id);
  await updateDoc(ref, { participants: arrayUnion(user) });
}

// Leave a meetup
export async function leaveMeetup(id: string, user: UserModel): Promise<void> {
  const ref = doc(db, "meetups", id);
  await updateDoc(ref, { participants: arrayRemove(user) });
}

// Subscribe to a single meetup (real-time)
export function subscribeToMeetup(
  id: string,
  callback: (meetup: MeetupModel & { id: string }) => void
): Unsubscribe {
  const ref = doc(db, "meetups", id);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      callback(
        toMeetupModel(snap.data(), snap.id) as MeetupModel & { id: string }
      );
    }
  });
}

// Add or remove a reaction to a meetup
export async function reactToMeetup(
  meetupId: string,
  emoji: string,
  userId: string
): Promise<void> {
  const ref = doc(db, "meetups", meetupId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Meetup not found");
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
