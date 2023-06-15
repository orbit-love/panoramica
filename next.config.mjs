/** @type {import('next').NextConfig} */
import remarkGfm from "remark-gfm";
import nextMdx from "@next/mdx";

const withMDX = nextMdx({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkGfm],
    providerImportSource: "@mdx-js/react",
  },
});

const nextConfig = {
  basePath: process.env.BASE_PATH || "",
  reactStrictMode: true,
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
};

export default withMDX(nextConfig);
