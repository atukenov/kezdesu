"use client";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

const steps = ["Account", "Profile", "Bio"];

export default function SignUp() {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Validation for required fields before going to next step
  const canGoNext = () => {
    if (step === 0) {
      return email.trim() !== "" && password.trim() !== "";
    }
    if (step === 1) {
      return name.trim() !== "";
    }
    return true;
  };

  const handleNext = () => {
    if (canGoNext()) setStep((s) => s + 1);
  };
  const handleBack = () => setStep((s) => s - 1);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Create user
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(userCred.user, { displayName: name });
      // Save profile in Firestore
      await setDoc(doc(db, "users", userCred.user.uid), {
        id: userCred.user.uid,
        name,
        email,
        image: photo ? "" : "/images/default-avatar.jpg", // TODO: handle upload
        bio,
        status: "available",
        social: {},
      });
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8 bg-secondary rounded-lg shadow-md">
        <div className="flex justify-center mb-4 items-center gap-2">
          {steps.map((label, i) => (
            <>
              <div
                key={label}
                className={`flex flex-col items-center transition-all duration-300 ${
                  i === step ? "scale-110" : "opacity-60"
                } ${i <= step ? "text-primary" : "text-foreground-accent"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 transition-all duration-300 ${
                    i === step
                      ? "border-primary bg-primary text-white shadow-lg"
                      : i < step
                      ? "border-primary bg-primary/80 text-white"
                      : "border-foreground-accent bg-background"
                  }`}
                >
                  {i + 1}
                </div>
                <span className="text-xs mt-1">{label}</span>
              </div>
              {i < steps.length - 1 && (
                <span
                  className={`mx-2 text-2xl transition-all duration-300 ${
                    i < step ? "text-primary" : "text-foreground-accent"
                  }`}
                  aria-hidden="true"
                >
                  →
                </span>
              )}
            </>
          ))}
        </div>
        <form onSubmit={handleSignUp} className="space-y-6">
          {step === 0 && (
            <>
              <label className="block mb-1 text-sm font-medium text-foreground">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="Email"
                className="w-full border border-foreground-accent rounded-lg px-4 py-2 text-sm bg-background text-foreground"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label className="block mb-1 text-sm font-medium text-foreground mt-4">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full border border-foreground-accent rounded-lg px-4 py-2 text-sm bg-background text-foreground pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground-accent text-xs"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <label className="block mb-1 text-sm font-medium text-foreground">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Name"
                className="w-full border border-foreground-accent rounded-lg px-4 py-2 text-sm bg-background text-foreground"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <div className="flex flex-col items-center gap-2 mt-2">
                <label className="text-sm text-foreground-accent">
                  Profile Photo (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                />
                {photo && (
                  <Image
                    src={URL.createObjectURL(photo)}
                    alt="Preview"
                    width={64}
                    height={64}
                    className="rounded-full"
                  />
                )}
              </div>
            </>
          )}
          {step === 2 && (
            <textarea
              placeholder="Short bio (optional)"
              className="w-full border border-foreground-accent rounded-lg px-4 py-2 text-sm bg-background text-foreground"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
            />
          )}
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex justify-between gap-2">
            {step > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 rounded-lg bg-background border border-foreground-accent text-foreground font-semibold hover:bg-foreground-accent/10 transition"
              >
                Back
              </button>
            )}
            {step < steps.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className={`ml-auto px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary-accent transition ${
                  !canGoNext() ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={!canGoNext()}
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="ml-auto px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary-accent transition"
                disabled={loading}
              >
                {loading ? "Signing up..." : "Sign up"}
              </button>
            )}
          </div>
        </form>
        <div className="text-center mt-4">
          <span className="text-foreground-accent text-sm">
            Already have an account?{" "}
          </span>
          <a
            href="/sign-in"
            className="text-primary font-semibold hover:underline"
          >
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
}
