/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    domains: ['via.placeholder.com'],
  },
  headers: async () => {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/site.webmanifest',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
    ];
  },
};

// Only enable PWA in production
const withPWA = process.env.NODE_ENV === 'production' 
  ? require('next-pwa')({
      dest: 'public',
      disable: process.env.NODE_ENV === 'development',
    })
  : (config) => config;

module.exports = withPWA(nextConfig); 