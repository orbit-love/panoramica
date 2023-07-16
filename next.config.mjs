/** @type {import('next').NextConfig} */

const nextConfig = {
  basePath: process.env.BASE_PATH || "",
  reactStrictMode: false,
  pageExtensions: ["ts", "tsx", "js", "jsx"],
};

export default nextConfig;
