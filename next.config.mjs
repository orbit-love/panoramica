/** @type {import('next').NextConfig} */

const nextConfig = {
  basePath: process.env.BASE_PATH || "",
  reactStrictMode: false,
  pageExtensions: ["ts", "tsx", "js", "jsx"],
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
        // allow the portable widget to be loaded from any domain
        source: "/api/welcome/graphql",
        headers: [
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
        ],
      },
    ];
  },
};

export default nextConfig;
