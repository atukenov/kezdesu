import { db } from "@/lib/firebase";
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp } from "firebase/firestore";

export interface Feedback {
  id: string;
  message: string;
  email?: string;
  createdAt?: any;
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

export async function getFeedbacks(): Promise<Feedback[]> {
  const q = query(collection(db, "feedback"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Feedback));
}
