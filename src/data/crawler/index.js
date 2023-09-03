import Crawler from "crawler";
import { setTimeout } from "timers/promises";

const UNWANTED_TAGS = [
  "script",
  "nav",
  "aside",
  "footer",
  "form",
  'a[href^="#"]',
].map((tag) => `body ${tag}`);

const HEADING_TAGS = ["h1", "h2", "h3", "h4", "h5", "h6"].map(
  (tag) => `body ${tag}`
);

const MAX_CONNECTIONS = 100;

export const crawl = async ({
  startUrl,
  rootUrl,
  maxConnections = MAX_CONNECTIONS,
}) => {
  let results = [];
  const urlObject = new URL(startUrl);
  const origin = urlObject.origin;
  const cleanedRootUrl = rootUrl.trim().replace(/\/$/, "");

  const crawler = new Crawler({
    skipDuplicates: true,
    maxConnections: maxConnections,
    preRequest: (options, done) => {
      if (options.uri.startsWith(cleanedRootUrl)) {
        done();
      }
    },
    callback: (error, res, done) => {
      if (error) {
        console.log(error);
        return;
      }
      const $ = res.$;
      const c = res.options.crawler;

      // if the page is not HTML, jQuery is not injected and the following code will
      // fail - so we just skip it
      if (!$) {
        done();
        return;
      }

      const title = $("title").text();
      const url = res.request.uri.href.trim().replace(/\/$/, "");

      console.log(`[Crawler] Processing page: ${title} @ ${url}`);

      // Remove unwanted tags
      $(UNWANTED_TAGS.join(", ")).each((_, item) => $(item).remove());

      // Turn relative URLs to absolute ones
      $('body a[href^="/"], body img[src^="/"]').each((_, item) => {
        const $item = $(item);
        if ($item.attr("href")) {
          $item.attr("href", `${origin}${$item.attr("href")}`);
        }
        if ($item.attr("src")) {
          $item.attr("src", `${origin}${$item.attr("src")}`);
        }
      });

      const headings = [];
      $(HEADING_TAGS.join(", ")).map((_, item) =>
        headings.push($(item).text())
      );

      const body = $("body").html();

      results.push({ url, title, rootUrl: cleanedRootUrl, headings, body });

      $(`body a[href^="${cleanedRootUrl}"]`).each((_, item) => {
        const href = $(item).attr("href");
        c.queue({
          uri: href,
          crawler: c,
        });
      });

      done();
    },
  });

  // Start the crawler with the provided URLs
  crawler.queue({
    uri: startUrl.trim(),
    crawler: crawler,
  });

  const completion = () => {
    return new Promise((resolve) => {
      crawler.on("drain", async function (_) {
        // This is a hack because queueSize doesn't get updated automatically after calling queue in the callback
        // Which means drain would be called and right after the queue could fill up again.
        // Waiting 100ms should ensure the queue is totally drained before proceeding
        await setTimeout(100);

        if (crawler.queueSize === 0) {
          resolve();
        }
      });
    });
  };

  await completion();

  return results;
};
