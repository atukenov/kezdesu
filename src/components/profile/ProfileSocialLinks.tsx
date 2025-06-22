import { UserModel } from "@/models/UserModel";
import { useTranslations } from "next-intl";
import {
  FaFacebook,
  FaGlobe,
  FaInstagram,
  FaLinkedin,
  FaTwitter,
} from "react-icons/fa";

export default function ProfileSocialLinks({
  social,
}: {
  social?: UserModel["social"];
}) {
  const t = useTranslations();
  if (!social || Object.values(social).every((v) => !v)) {
    return <span className="text-foreground-accent">{t("noSocialLinks")}</span>;
  }
  return (
    <div className="space-y-1">
      {social.twitter && (
        <a
          href={social.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-accent hover:underline"
        >
          <FaTwitter /> Twitter
        </a>
      )}
      {social.facebook && (
        <a
          href={social.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-primary hover:underline"
        >
          <FaFacebook /> Facebook
        </a>
      )}
      {social.instagram && (
        <a
          href={social.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-accent hover:underline"
        >
          <FaInstagram /> Instagram
        </a>
      )}
      {social.linkedin && (
        <a
          href={social.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-primary-accent hover:underline"
        >
          <FaLinkedin /> LinkedIn
        </a>
      )}
      {social.website && (
        <a
          href={social.website}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-foreground-accent hover:underline"
        >
          <FaGlobe /> Website
        </a>
      )}
    </div>
  );
}
