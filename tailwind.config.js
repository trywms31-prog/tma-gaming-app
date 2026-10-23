/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#07060f",
          900: "#0c0a16",
          800: "#141126",
          700: "#1c1733",
        },
        neon: {
          violet: "#b56bff",
          cyan: "#3ee7ff",
          amber: "#ffcc4d",
          orange: "#ff8a3d",
        },
      },
      boxShadow: {
        glow: "0 0 40px rgba(181, 107, 255, 0.18)",
        cyan: "0 0 24px rgba(62, 231, 255, 0.16)",
      },
      borderRadius: {
        xl2: "1.25rem",
        xl3: "1.5rem",
      },
    },
  },
  plugins: [],
};
