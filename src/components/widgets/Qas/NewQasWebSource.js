import React from "react";

export default function NewQasWebSource({ specificFields, onChange }) {
  const startUrl = specificFields.startUrl || "";
  const rootUrl = specificFields.rootUrl || "";

  return (
    <>
      <div className="flex flex-col space-y-1">
        <label htmlFor="start-url">Start URL</label>
        <small>
          We&apos;ll crawl and produce QAs from each web page starting from this
          URL.
        </small>
        <input
          type="url"
          required
          placeholder="https://docs.my-project.com/introduction"
          name="start-url"
          value={startUrl}
          onChange={({ target }) => onChange("startUrl", target.value)}
        ></input>
      </div>
      <div className="flex flex-col space-y-1">
        <label htmlFor="root-url">Root URL</label>
        <small>
          On each page, we&apos;ll visit linked pages under this root URL. You
          can leave it empty to use the start URL as the root.
        </small>
        <input
          type="url"
          placeholder={startUrl || "https://docs.my-project.com"}
          name="root-url"
          value={rootUrl}
          onChange={({ target }) => onChange("rootUrl", target.value)}
        ></input>
      </div>
    </>
  );
}
