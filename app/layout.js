import React from "react";
import "styles/globals.css";

var description = "Expand conversational landscapes with AI";
var defaultTitle = "Panoramica";
var template = "%s — Panoramica";

export const metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL),
  title: {
    template,
    default: defaultTitle,
  },
  description,
};

export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
