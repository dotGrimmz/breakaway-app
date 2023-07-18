import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      height: {
        board: "600px"
      }
    },
  },
  plugins: [],
} satisfies Config;
