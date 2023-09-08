import React from "react";

export default function NewQasMarkdownSource({ specificFields, onChange }) {
  const markdown = specificFields.markdown || "";

  return (
    <div className="flex flex-col space-y-1">
      <label htmlFor="markdown">Mardown</label>
      <small>We&apos;ll auto-generate QAs from this markdown</small>
      <textarea
        type="text"
        rows="8"
        required
        name="markdown"
        value={markdown}
        onChange={({ target }) => onChange("markdown", target.value)}
      ></textarea>
    </div>
  );
}
