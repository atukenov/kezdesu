"use client";

import ProfileAvatar from "@/components/profile/ProfileAvatar";
import ProfileBio from "@/components/profile/ProfileBio";
import ProfileName from "@/components/profile/ProfileName";
import ProfileSocialLinks from "@/components/profile/ProfileSocialLinks";
import ProfileStatusToggle from "@/components/profile/ProfileStatusToggle";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { app } from "@/lib/firebase";
import { UserModel } from "@/models/UserModel";
import { createOrUpdateUser, getUser } from "@/services/userService";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const t = useTranslations();
  const auth = getAuth(app);
  const db = getFirestore(app);
  const user = auth.currentUser;
  const router = useRouter();

  const [profile, setProfile] = useState<UserModel | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user === null) {
      router.replace("/"); // or your custom login route
      return;
    }
    const fetchProfile = async () => {
      try {
        const userData = await getUser(user.uid);
        console.log("Fetched user data:", userData);
        // Only create a new profile if userData is strictly null or undefined (not on error)
        if (userData === null || userData === undefined) {
          // retry fetching profile
          const retryData = await getUser(user.uid);
          if (retryData === null || retryData === undefined) {
            return;
          }
        } else {
          setProfile(userData);
        }
      } catch (err: any) {
        toast.error(t("error") + ": " + t("notFound"));
        console.error("Profile fetch error:", err);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user, t]);

  const handleChange = (field: keyof UserModel, value: any) => {
    setProfile((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSave = async () => {
    if (!user || !profile) return;
    setSaving(true);
    try {
      await createOrUpdateUser(profile);
      toast.success(t("success"));
      setEditing(false);
    } catch (err) {
      console.log(err);
      toast.error(t("error"));
    }
    setSaving(false);
  };

  const handleStatusToggle = async () => {
    if (!user || !profile) return;
    const newStatus = profile.status === "available" ? "busy" : "available";
    setProfile((prev) => (prev ? { ...prev, status: newStatus } : prev));
    try {
      await createOrUpdateUser({ ...profile, status: newStatus });
      toast.success(
        `Status set to ${
          newStatus.charAt(0).toUpperCase() + newStatus.slice(1)
        }`
      );
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  if (!user) return null;
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center text-gray-600 mt-10">{t("notFound")}</div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-background rounded-xl shadow-lg p-8 flex flex-col items-center border border-foreground-accent">
      <h2 className="text-2xl font-bold mb-4 text-foreground">
        {t("navigation.profile")}
      </h2>
      <ProfileAvatar image={profile.image} />
      <ProfileStatusToggle
        status={profile.status}
        loading={loading}
        saving={saving}
        onToggle={handleStatusToggle}
      />
      <ProfileName
        name={profile.name}
        editing={editing}
        onChange={(value) => handleChange("name", value)}
      />
      <div className="w-full mb-4">
        <label className="block text-foreground-accent font-medium mb-1">
          {t("bio")}:
        </label>
        {editing ? (
          <textarea
            value={profile.bio || ""}
            onChange={(e) => handleChange("bio", e.target.value)}
            className="w-full border border-foreground-accent rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-accent bg-background text-foreground"
            rows={2}
          />
        ) : (
          <ProfileBio bio={profile.bio} />
        )}
      </div>
      <div className="w-full mb-4">
        <label className="block text-foreground-accent font-medium mb-1">
          {t("socialLinks")}:
        </label>
        {editing ? (
          <div className="space-y-2">
            <input
              type="url"
              placeholder={t("twitterUrl")}
              value={profile.social?.twitter || ""}
              onChange={(e) =>
                handleChange("social", {
                  ...profile.social,
                  twitter: e.target.value,
                })
              }
              className="w-full border border-foreground-accent rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-accent bg-background text-foreground"
            />
            <input
              type="url"
              placeholder={t("facebookUrl")}
              value={profile.social?.facebook || ""}
              onChange={(e) =>
                handleChange("social", {
                  ...profile.social,
                  facebook: e.target.value,
                })
              }
              className="w-full border border-foreground-accent rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-accent bg-background text-foreground"
            />
            <input
              type="url"
              placeholder={t("instagramUrl")}
              value={profile.social?.instagram || ""}
              onChange={(e) =>
                handleChange("social", {
                  ...profile.social,
                  instagram: e.target.value,
                })
              }
              className="w-full border border-foreground-accent rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-accent bg-background text-foreground"
            />
            <input
              type="url"
              placeholder={t("linkedinUrl")}
              value={profile.social?.linkedin || ""}
              onChange={(e) =>
                handleChange("social", {
                  ...profile.social,
                  linkedin: e.target.value,
                })
              }
              className="w-full border border-foreground-accent rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-accent bg-background text-foreground"
            />
            <input
              type="url"
              placeholder={t("websiteUrl")}
              value={profile.social?.website || ""}
              onChange={(e) =>
                handleChange("social", {
                  ...profile.social,
                  website: e.target.value,
                })
              }
              className="w-full border border-foreground-accent rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary-accent bg-background text-foreground"
            />
          </div>
        ) : (
          <ProfileSocialLinks social={profile.social} />
        )}
      </div>
      {editing ? (
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-2 bg-primary text-foreground rounded hover:bg-primary-accent transition-colors disabled:opacity-50 flex items-center justify-center"
        >
          {saving ? <LoadingSpinner size={20} /> : t("save")}
        </button>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="w-full py-2 bg-secondary text-foreground rounded hover:bg-foreground-accent hover:text-background transition-colors"
        >
          {t("editProfile")}
        </button>
      )}
    </div>
  );
}
