import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SAAF Mumbai",
    short_name: "SAAF Mumbai",
    description: "Report and track civic issues across Mumbai.",
    start_url: "/",
    display: "standalone",
    background_color: "#fcf9f8",
    theme_color: "#0d2a6e",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
