import { db } from "@/lib/firebase";
import { UserModel, toUserModel } from "@/models/UserModel";
import { stripUndefinedFields } from "@/services/commonService";
import {
  Unsubscribe,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

// Get a user by ID
export async function getUser(id: string): Promise<UserModel> {
  const ref = doc(db, "users", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("User not found");
  return toUserModel(snap.data());
}

// Clean undefined fields from user before saving to Firestore
function cleanUserForFirestore(user: UserModel): Partial<UserModel> {
  return stripUndefinedFields(user);
}

// Create or update a user
export async function createOrUpdateUser(user: UserModel): Promise<void> {
  const ref = doc(db, "users", user.id);
  await setDoc(ref, cleanUserForFirestore(user), { merge: true });
}

// Subscribe to a user (real-time)
export function subscribeToUser(
  id: string,
  callback: (user: UserModel) => void
): Unsubscribe {
  const ref = doc(db, "users", id);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) callback(toUserModel(snap.data()));
  });
}

// Get all users (optionally filtered)
export async function getUsers(
  filter?: Partial<UserModel>
): Promise<UserModel[]> {
  let q: any = collection(db, "users");
  if (filter && filter.email) {
    q = query(q, where("email", "==", filter.email));
  }
  const snap = await getDocs(q);
  return snap.docs.map((doc) =>
    toUserModel(Object.assign({ id: doc.id }, doc.data()))
  );
}

/**
 * Update a user's role in Firestore
 * @param userId The user's ID
 * @param newRole The new role to assign (e.g., 'admin', 'user', 'moderator')
 */
export async function updateUserRole(
  userId: string,
  newRole: string
): Promise<void> {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { role: newRole });
}
