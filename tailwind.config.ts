import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "var(--primary)",
        "primary-accent": "var(--primary-accent)",
        secondary: "var(--secondary)",
        accent: "var(--accent)",
        success: "var(--success)",
        danger: "var(--danger)",
        text: "var(--text)",
        "foreground-accent": "var(--foreground-accent)",
        "hero-background": "var(--hero-background)",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
export default config;
