import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.fotmob.com" },
      { protocol: "https", hostname: "www.fotmob.com" },
      { protocol: "https", hostname: "r2.thesportsdb.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "ichef.bbci.co.uk" },
      { protocol: "https", hostname: "i.guim.co.uk" },
      { protocol: "https", hostname: "media.guim.co.uk" },
      { protocol: "https", hostname: "e0.365dm.com" },
      { protocol: "https", hostname: "e1.365dm.com" },
      { protocol: "https", hostname: "e2.365dm.com" },
    ],
  },
  poweredByHeader: false,
};

export default nextConfig;
