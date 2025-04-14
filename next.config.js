/** @type {import('next').NextConfig} */
const nextConfig = {
    // experimental: {
    //   appDir: true,
    // },
    images: {
       remotePatterns: [
        {
          protocol: "https",
          hostname: "img.clerk.com",
        },
        {
          protocol: "https",
          hostname: "images.unsplash.com",
        },

        {
          protocol: "https",
          hostname: "res.cloudinary.com",
        },

        {
          protocol: "https",
          hostname: "avatars.githubusercontent.com",
        },

        {
          protocol: "https",
          hostname: "lh3.googleusercontent.com",
        },
      ]
    }
  }
  
  module.exports = nextConfig
