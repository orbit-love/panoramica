import React from "react";
import "styles/globals.css";

export default function RootLayout({ children }) {
  return (
    <html>
      {/* <Head /> */}
      <body className="space-gradient">{children}</body>
    </html>
  );
}
