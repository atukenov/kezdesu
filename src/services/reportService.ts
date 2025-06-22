import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

export interface ReportModel {
  id?: string;
  meetupId: string;
  reporterId: string;
  reason: string;
  details?: string;
  createdAt?: any;
  status?: "open" | "resolved" | "dismissed" | "escalated";
}

export async function reportMeetup(
  report: Omit<ReportModel, "id" | "createdAt" | "status">
) {
  await addDoc(collection(db, "reports"), {
    ...report,
    createdAt: serverTimestamp(),
    status: "open",
  });
}

export async function getReports(): Promise<ReportModel[]> {
  const snap = await getDocs(collection(db, "reports"));
  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as ReportModel[];
}

export async function updateReportStatus(
  reportId: string,
  status: ReportModel["status"]
) {
  await updateDoc(doc(db, "reports", reportId), { status });
}
