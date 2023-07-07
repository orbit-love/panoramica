import React from "react";
import "styles/globals.css";

var description = "A collection of preview projects";
var defaultTitle = "Preview";
var template = "%s — Preview";

export const metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL),
  title: "Preview",
  title: {
    template,
    default: defaultTitle,
  },
  description,
  openGraph: {
    images: [
      {
        url: "https://orbit.love/model/social-share.jpg",
        width: 1120,
        height: 633,
      },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html>
      <body className="space-gradient text-indigo-100">{children}</body>
    </html>
  );
}
