import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export interface Feedback {
  message: string;
  email?: string;
}

export async function submitFeedback({
  message,
  email,
}: {
  message: string;
  email?: string;
}): Promise<void> {
  await addDoc(collection(db, "feedback"), {
    message,
    email: email || null,
    createdAt: serverTimestamp(),
  });
}
