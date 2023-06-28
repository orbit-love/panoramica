import Head from "next/head";
import favicon from "public/favicon.ico";

export default function _Head({ title = "Preview" }) {
  var content = "A collection of preview projects";
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={content} />
        <link rel="icon" href={favicon.src} />
        <meta property="og:site_name" content="Preview" />
        <meta property="og:title" content="Preview" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://preview.orbit.love/" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          property="og:image"
          content="https://orbit.love/model/social-share.jpg"
        />
        <meta
          name="twitter:image"
          content="https://orbit.love/model/social-share.jpg"
        />
        <meta property="og:image:alt" content="Page image for Preview" />
        <meta name="twitter:image:alt" content="Page image for Preview" />
        <meta name="description" content={content} />
        <meta name="twitter:description" content={content} />
        <meta property="og:description" content={content} />
      </Head>
    </>
  );
}
