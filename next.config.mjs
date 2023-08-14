/** @type {import('next').NextConfig} */

const nextConfig = {
  basePath: process.env.BASE_PATH || "",
  reactStrictMode: false,
  pageExtensions: ["ts", "tsx", "js", "jsx"],
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(graphql|gql)/,
      exclude: /node_modules/,
      loader: "graphql-tag/loader",
    });
    return config;
  },
};

export default nextConfig;
