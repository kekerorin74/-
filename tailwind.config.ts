import type { Config } from "tailwindcss";

export default {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                antigravity: {
                    bg: "#020410",
                    card: "#0a0a1f",
                    accent: "#00f3ff", // Neon Cyan
                    purple: "#bd00ff", // Neon Purple
                    text: "#e0e0e0",
                    muted: "#6b7280",
                    glass: "rgba(10, 10, 31, 0.7)"
                }
            },
        },
    },
    plugins: [],
} satisfies Config;
