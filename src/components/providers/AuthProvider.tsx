"use client";
import { auth } from "@/lib/firebase";
import { UserModel } from "@/models/UserModel";
import { createOrUpdateUser, getUser } from "@/services/userService";
import { onAuthStateChanged } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: UserModel | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserModel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("onAuthStateChanged:", firebaseUser); // DEBUG
      if (firebaseUser) {
        // Try to get Firestore user profile
        let userProfile = await getUser(firebaseUser.uid);
        if (!userProfile) {
          // If not found, create a new profile in Firestore
          userProfile = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || "Anonymous",
            email: firebaseUser.email || "",
            image: firebaseUser.photoURL || "/images/default-avatar.jpg",
            status: "available",
            bio: "",
            social: {},
          };
          await createOrUpdateUser(userProfile);
        }
        console.log("User profile:", userProfile); // DEBUG
        setUser(userProfile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
