/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Ensure browsers/CDNs always re-check for a fresh service worker
        // so PWA updates roll out promptly instead of being cached away.
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          // Allows the worker at /sw.js to control the entire origin scope "/".
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/manifest.webmanifest",
        headers: [
          { key: "Content-Type", value: "application/manifest+json" },
          { key: "Cache-Control", value: "public, max-age=86400" },
        ],
      },
    ];
  },
};

export default nextConfig;
