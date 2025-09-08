/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "i.pinimg.com", // Add this line for Pinterest images
      // Add any other external hostnames you use for images
      // e.g., 'example.com', 'another-cdn.net'
    ],
  },
  experimental: {
    turbo: undefined,
  },
};

export default nextConfig;
