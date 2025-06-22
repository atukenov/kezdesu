"use client";
import { signInWithGoogle } from "@/lib/firebase";
import { FcGoogle } from "react-icons/fc";

export default function SignIn() {
  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8 bg-secondary rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground">
            Welcome to Kezdesu
          </h2>
          <p className="mt-2 text-sm text-foreground-accent">
            Connect with people around Atyrau for casual meetups
          </p>
        </div>
        <button
          onClick={handleSignIn}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-foreground-accent rounded-md shadow-sm text-base font-medium text-foreground bg-background hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <FcGoogle className="w-5 h-5" />
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
