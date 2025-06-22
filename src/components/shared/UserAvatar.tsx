interface UserAvatarProps {
  src?: string;
  alt?: string;
  size?: number | string;
  className?: string;
}

export default function UserAvatar({
  src,
  alt,
  size = 28,
  className = "",
}: UserAvatarProps) {
  return (
    <img
      src={src || "/images/icon.png"}
      alt={alt || "User avatar"}
      className={`rounded-full object-cover ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
