"use client";
import { signInWithEmail, signInWithGoogle } from "@/lib/firebase";
import Link from "next/link";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      setError("Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmail(email, password);
    } catch (error) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8 bg-secondary rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground">
            Sign in to Kezdesu
          </h2>
          <p className="mt-2 text-sm text-foreground-accent">
            Connect with people around Atyrau for casual meetups
          </p>
        </div>
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-foreground-accent rounded-md shadow-sm text-base font-medium text-foreground bg-background hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <FcGoogle className="w-5 h-5" />
          Sign in with Google
        </button>
        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-foreground-accent" />
          <span className="mx-2 text-foreground-accent text-xs">or</span>
          <div className="flex-grow border-t border-foreground-accent" />
        </div>
        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full border border-foreground-accent rounded-lg px-4 py-2 text-sm bg-background text-foreground"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border border-foreground-accent rounded-lg px-4 py-2 text-sm bg-background text-foreground"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary-accent transition"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <div className="text-center mt-4">
          <span className="text-foreground-accent text-sm">
            Don't have an account?{" "}
          </span>
          <Link
            href="/sign-up"
            className="text-primary font-semibold hover:underline"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
