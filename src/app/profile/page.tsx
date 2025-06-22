"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import { app } from "@/lib/firebase";
import { UserModel } from "@/models/UserModel";
import { createOrUpdateUser, getUser } from "@/services/userService";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FaFacebook,
  FaGlobe,
  FaInstagram,
  FaLinkedin,
  FaTwitter,
} from "react-icons/fa";

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
    <div className="max-w-md mx-auto mt-10 bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4">{t("profile")}</h2>
      <img
        src={profile.image || "/default-avatar.png"}
        alt="avatar"
        className="w-24 h-24 rounded-full border-4 border-blue-200 mb-4 object-cover"
      />
      {/* Status Toggle - always visible, not in edit mode */}
      <div className="w-full mb-6 flex items-center justify-between">
        <span className="text-gray-700 font-medium text-base">
          {t("status")}:
        </span>
        <button
          type="button"
          aria-pressed={profile.status === "available"}
          onClick={handleStatusToggle}
          disabled={loading || saving}
          className={`relative inline-flex items-center h-10 w-24 rounded-full transition-colors focus:outline-none border-2 border-blue-200 shadow-sm
            ${profile.status === "available" ? "bg-green-400" : "bg-red-300"}
            ${
              loading || saving
                ? "opacity-60 cursor-not-allowed"
                : "cursor-pointer"
            }
          `}
        >
          <span
            className={`absolute left-2 text-xs font-semibold transition-colors duration-200
              ${profile.status === "available" ? "text-white" : "text-gray-500"}
            `}
          ></span>
          <span
            className={`absolute right-2 text-xs font-semibold transition-colors duration-200
              ${profile.status === "busy" ? "text-white" : "text-gray-500"}
            `}
          ></span>
          <span
            className={`inline-block h-7 w-7 rounded-full bg-white shadow transform transition-transform duration-300
              ${
                profile.status === "available"
                  ? "translate-x-0"
                  : "translate-x-14"
              }
            `}
          />
        </button>
      </div>
      <div className="w-full mb-4">
        <label className="block text-gray-700 font-medium mb-1">
          {t("name")}:
        </label>
        {editing ? (
          <input
            value={profile.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        ) : (
          <span className="text-gray-900"> {profile.name}</span>
        )}
      </div>
      <div className="w-full mb-4">
        <label className="block text-gray-700 font-medium mb-1">
          {t("bio")}:
        </label>
        {editing ? (
          <textarea
            value={profile.bio || ""}
            onChange={(e) => handleChange("bio", e.target.value)}
            className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            rows={2}
          />
        ) : (
          <span className="text-gray-900 whitespace-pre-line">
            {profile.bio || <span className="text-gray-400">{t("noBio")}</span>}
          </span>
        )}
      </div>
      <div className="w-full mb-4">
        <label className="block text-gray-700 font-medium mb-1">
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
              className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
              className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
              className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
              className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
              className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        ) : (
          <div className="space-y-1">
            {profile.social?.twitter && (
              <a
                href={profile.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-500 hover:underline"
              >
                <FaTwitter /> Twitter
              </a>
            )}
            {profile.social?.facebook && (
              <a
                href={profile.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-700 hover:underline"
              >
                <FaFacebook /> Facebook
              </a>
            )}
            {profile.social?.instagram && (
              <a
                href={profile.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-pink-500 hover:underline"
              >
                <FaInstagram /> Instagram
              </a>
            )}
            {profile.social?.linkedin && (
              <a
                href={profile.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-800 hover:underline"
              >
                <FaLinkedin /> LinkedIn
              </a>
            )}
            {profile.social?.website && (
              <a
                href={profile.social.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-700 hover:underline"
              >
                <FaGlobe /> Website
              </a>
            )}
            {!profile.social ||
            Object.values(profile.social).every((v) => !v) ? (
              <span className="text-gray-400">{t("noSocialLinks")}</span>
            ) : null}
          </div>
        )}
      </div>
      {editing ? (
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
        >
          {saving ? <LoadingSpinner size={20} /> : t("save")}
        </button>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="w-full py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
        >
          {t("editProfile")}
        </button>
      )}
    </div>
  );
}
