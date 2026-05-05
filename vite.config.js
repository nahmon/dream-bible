import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(() => {
  const isEn = process.env.VITE_LANG === "en";
  return {
    plugins: [react()],
    define: {
      "import.meta.hot": "undefined",
    },
    ...(isEn && {
      build: { rollupOptions: { input: "./index.en.html" } },
    }),
  };
});
