/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'htzkgnuclatortmbykpz.supabase.co' }
    ]
  },
  outputFileTracingRoot: __dirname
}
module.exports = nextConfig
