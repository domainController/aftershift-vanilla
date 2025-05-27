import { defineConfig } from "vite";
import purgecss from "vite-plugin-purgecss";

export default defineConfig({
  plugins: [
    purgecss({
      content: ["./**/*.html", "./**/*.js"],
      safelist: [
        "navbar",
        "collapsed",
        "main-content",
        "nav-open",
        "toggle-btn",
      ],
      defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
    }),
  ],
});
