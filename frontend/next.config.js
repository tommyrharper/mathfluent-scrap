/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    domains: ['via.placeholder.com'],
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