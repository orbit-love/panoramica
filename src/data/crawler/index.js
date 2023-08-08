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

      const title = $("title").text();
      const url = res.request.uri.href;

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

      const body = $("body").html();

      results.push({ url, title, body });

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
        // Waiting 100ms should help make sure the queue is totally drained before proceeding
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
