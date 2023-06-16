import Head from "next/head";
import favicon from "public/favicon.ico";

export default function _Head() {
  return (
    <>
      <Head>
        <title>Telescope</title>
        <meta
          name="description"
          content="A powerful lens for understanding your community"
        />
        <link rel="icon" href={favicon.src} />
        <meta property="og:site_name" content="Telescope" />
        <meta property="og:title" content="Telescope" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://telescope.orbit.love/" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          property="og:image"
          content="https://orbit.love/model/social-share.jpg"
        />
        <meta
          name="twitter:image"
          content="https://orbit.love/model/social-share.jpg"
        />
        <meta property="og:image:alt" content="Page image for Telescope" />
        <meta name="twitter:image:alt" content="Page image for Telescope" />
        <meta
          name="description"
          content="A powerful lens for understanding your community"
        />
        <meta
          name="twitter:description"
          content="A powerful lens for understanding your community"
        />
        <meta
          property="og:description"
          content="A powerful lens for understanding your community"
        />
      </Head>
    </>
  );
}
