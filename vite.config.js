import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { existsSync, renameSync } from "fs";

const renameEnHtml = () => ({
  name: "rename-en-html",
  closeBundle() {
    if (existsSync("dist/index.en.html")) {
      renameSync("dist/index.en.html", "dist/index.html");
    }
  },
});

export default defineConfig(() => {
  const isEn = process.env.VITE_LANG === "en";
  return {
    plugins: [react(), ...(isEn ? [renameEnHtml()] : [])],
    define: {
      "import.meta.hot": "undefined",
    },
    ...(isEn && {
      build: { rollupOptions: { input: "./index.en.html" } },
    }),
  };
});
