/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  // ── Security Headers ─────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Cegah clickjacking
          { key: "X-Frame-Options", value: "DENY" },
          // Cegah MIME sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Jangan kirim Referer ke domain lain — token ?t= tidak bocor via Referer header
          { key: "Referrer-Policy", value: "no-referrer" },
          // Matikan fitur browser yang tidak dipakai
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // Paksa HTTPS di production
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
    ];
  },
};

export default nextConfig;
