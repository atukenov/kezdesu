import withPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = withPWA({
  pwa: {
    dest: "public",
    disable: process.env.NODE_ENV !== "production",
  },
});

export default nextConfig;
