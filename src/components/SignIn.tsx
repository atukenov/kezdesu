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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome to Kezdesu
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Connect with people around Atyrau for casual meetups
          </p>
        </div>
        <button
          onClick={handleSignIn}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FcGoogle className="w-5 h-5" />
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
