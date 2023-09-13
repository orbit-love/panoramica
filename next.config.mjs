/** @type {import('next').NextConfig} */

const nextConfig = {
  basePath: process.env.BASE_PATH || "",
  reactStrictMode: false,
  pageExtensions: ["ts", "tsx", "js", "jsx"],
  experimental: {
    serverComponentsExternalPackages: ["bullmq"],
  },
  webpack: (config) => {
    config.module.rules.push(
      {
        test: /\.(graphql|gql)/,
        exclude: /node_modules/,
        loader: "graphql-tag/loader",
      },
      {
        test: /\.ya?ml$/,
        use: "raw-loader",
      }
    );
    return config;
  },
  headers() {
    return [
      {
        source: "/api/welcome/graphql",
        headers: graphQLHeaders,
      },
      {
        source: "/api/graphql",
        headers: graphQLHeaders,
      },
    ];
  },
};

export default nextConfig;

const graphQLHeaders = [
  { key: "Access-Control-Allow-Credentials", value: "true" },
  { key: "Access-Control-Allow-Origin", value: "*" },
  {
    key: "Access-Control-Allow-Headers",
    value: "*",
  },
  {
    key: "Access-Control-Allow-Methods",
    value: "GET,POST,HEAD,OPTIONS",
  },
];
