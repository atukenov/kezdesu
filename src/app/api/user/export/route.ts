import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Accept userId from query params (must be securely validated client-side)
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Gather all user data
  const userProfileSnap = await getDoc(doc(db, "users", userId));
  const userProfile = userProfileSnap.exists() ? userProfileSnap.data() : null;

  // Meetups created by user
  const meetupsSnap = await getDocs(
    query(collection(db, "meetups"), where("creatorId", "==", userId))
  );
  const createdMeetups = meetupsSnap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  // Meetups participated in
  const allMeetupsSnap = await getDocs(collection(db, "meetups"));
  const participatedMeetups = allMeetupsSnap.docs
    .filter((doc) => {
      const data = doc.data();
      return (
        Array.isArray(data.participants) &&
        data.participants.some((p: any) => p.id === userId)
      );
    })
    .map((doc) => ({ id: doc.id, ...doc.data() }));

  // Messages by user
  let userMessages: any[] = [];
  for (const meetup of allMeetupsSnap.docs) {
    const messagesSnap = await getDocs(
      collection(db, "meetups", meetup.id, "messages")
    );
    messagesSnap.forEach((msg) => {
      if (msg.data().userId === userId) {
        userMessages.push({ meetupId: meetup.id, ...msg.data() });
      }
    });
  }

  // Feedback by user
  const feedbackSnap = await getDocs(
    query(collection(db, "feedback"), where("userId", "==", userId))
  );
  const feedback = feedbackSnap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  // Compose export
  const exportData = {
    profile: userProfile,
    createdMeetups,
    participatedMeetups,
    messages: userMessages,
    feedback,
  };

  return NextResponse.json(exportData);
}
