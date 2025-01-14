/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        mainBackgroundColor: "#272727",
        columnBackgroundColor: "#171717",
      },
    },
  },
  plugins: [],
};
