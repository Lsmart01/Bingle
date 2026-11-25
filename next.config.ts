import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // cacheComponents and partialPrefetching are off on purpose: with them on, pages
  // hang on Cloudflare Workers. Track support before turning them back on:
  // https://github.com/opennextjs/opennextjs-cloudflare/pull/1318
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
