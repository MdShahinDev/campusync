import { useState } from "react";

const SIZE_CLASSES = {
  xs: "w-7 h-7 text-[11px]",
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-12 h-12 text-lg",
  xl: "w-20 h-20 text-2xl",
  cover: "w-24 h-24 text-3xl",
};

const SHAPE_CLASSES = {
  circle: "rounded-full",
  square: "rounded-lg",
  card: "rounded-2xl",
};

const VARIANT_CLASSES = {
  brand: "bg-gradient-to-br from-accent-orange to-accent-orange-hover text-white",
  neutral: "bg-bg-tertiary text-text-secondary",
};

const API_BASE = import.meta.env.VITE_API_URL;

// Avatars are stored in the project's private blob store, so raw blob URLs are
// not directly viewable. Route them through the app's avatar proxy endpoint and
// append the blob object name as a version query, so a new upload changes the
// src and every place showing the avatar refreshes without a page reload.
function resolveAvatarSrc(url, user) {
  if (!url || !url.includes(".blob.vercel-storage.com")) return url;
  const id = user?._id || user?.id;
  if (!id || !API_BASE) return url;
  const version = url.split("?")[0].split("/").pop();
  return `${API_BASE}/auth/users/${id}/avatar?v=${encodeURIComponent(version)}`;
}

export default function Avatar({
  user,
  src,
  name,
  size = "md",
  shape = "circle",
  variant = "brand",
  className = "",
  imgClassName = "",
  alt,
}) {
  // Track the exact src that failed so a newly uploaded picture recovers
  // automatically instead of staying stuck on the initials fallback.
  const [failedSrc, setFailedSrc] = useState(null);

  const rawSrc = src !== undefined ? src : user?.avatar;
  const imageSrc = resolveAvatarSrc(rawSrc, user);
  const label = name !== undefined ? name : user?.name || "";
  const initial = label.trim() ? label.trim().charAt(0).toUpperCase() : "U";

  const sizeClass = SIZE_CLASSES[size] || size;
  const shapeClass = SHAPE_CLASSES[shape] || shape;
  const variantClass = VARIANT_CLASSES[variant] || VARIANT_CLASSES.brand;
  const base = `${sizeClass} ${shapeClass} ${className}`;

  if (imageSrc && failedSrc !== imageSrc) {
    return (
      <img
        src={imageSrc}
        alt={alt || (label ? `${label}'s avatar` : "Avatar")}
        onError={() => setFailedSrc(imageSrc)}
        className={`${base} object-cover shrink-0 ${imgClassName}`}
      />
    );
  }

  return (
    <span
      aria-label={label || "Avatar"}
      className={`${base} ${variantClass} flex items-center justify-center font-bold shrink-0 ${imgClassName}`}
    >
      {initial}
    </span>
  );
}
