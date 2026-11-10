import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * The rental product pages moved to /services/* and the marketplace to
   * /facilities. The old URLs are preserved so existing links keep working.
   */
  async redirects() {
    return [
      { source: "/chair-rental", destination: "/services", permanent: true },
      { source: "/chair-rental/dental-chair", destination: "/services/dental-chair", permanent: true },
      { source: "/chair-rental/dummy-head", destination: "/services/phantom-head", permanent: true },
      { source: "/clinics", destination: "/facilities", permanent: true },
      { source: "/tooth-assistance", destination: "/tooth-planner", permanent: true },
    ];
  },
};

export default nextConfig;
