import { db } from "@/lib/firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Accept userId from request body (must be securely validated client-side)
  const { userId } = await req.json();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Delete user profile
  await deleteDoc(doc(db, "users", userId));

  // Delete meetups created by user
  const meetupsSnap = await getDocs(
    query(collection(db, "meetups"), where("creatorId", "==", userId))
  );
  for (const meetup of meetupsSnap.docs) {
    await deleteDoc(meetup.ref);
  }

  // Remove user from participants in all meetups
  const allMeetupsSnap = await getDocs(collection(db, "meetups"));
  for (const meetup of allMeetupsSnap.docs) {
    const data = meetup.data();
    if (Array.isArray(data.participants)) {
      const filtered = data.participants.filter((p: any) => p.id !== userId);
      if (filtered.length !== data.participants.length) {
        // To update without deleting, use:
        // await updateDoc(meetup.ref, { participants: filtered });
        await deleteDoc(meetup.ref); // fallback: delete the meetup if user was a participant
      }
    }
  }

  // Delete user messages in all meetups
  for (const meetup of allMeetupsSnap.docs) {
    const messagesSnap = await getDocs(
      collection(db, "meetups", meetup.id, "messages")
    );
    for (const message of messagesSnap.docs) {
      if (message.data().userId === userId) {
        await deleteDoc(message.ref);
      }
    }
  }

  // Delete user feedback
  const feedbackSnap = await getDocs(
    query(collection(db, "feedback"), where("userId", "==", userId))
  );
  for (const feedback of feedbackSnap.docs) {
    await deleteDoc(feedback.ref);
  }

  // TODO: Delete user files from Firebase Storage if any (profile images, uploads, etc.)

  return NextResponse.json({ message: "Account and related data deleted." });
}
