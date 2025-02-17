chrome.storage.local.set({ monitoring: true });

let videoCandidates: Record<string, number> = {};

// reset list after each page load
chrome.webNavigation.onCommitted.addListener(() => {
  videoCandidates = {};
});

chrome.webRequest.onHeadersReceived.addListener(
  (details) => {
    chrome.storage.local.get("monitoring", (data) => {
      if (!data.monitoring) return;
      const url: string = details.url;
      const isDelivery = url.includes("deliveries");
      const isM3u8 = url.includes("m3u8");

      if (isDelivery && isM3u8) {
        let videoUrl = url.replace("m3u8", "mp4");
        videoUrl = videoUrl.split("mp4")[0] + "mp4";

        const contentLengthHeader = details.responseHeaders?.find(
          (header) => header.name.toLowerCase() === "content-length",
        );

        if (contentLengthHeader) {
          if (contentLengthHeader.value === undefined) {
            console.log("No content length header found, aborting");
            return;
          }
          const contentLength = parseInt(contentLengthHeader.value, 10);
          videoCandidates[videoUrl] = contentLength;
        }

        const bestVideoUrl = Object.entries(videoCandidates).reduce(
          (best, [url, length]) =>
            length > (videoCandidates[best] || 0) ? url : best,
          "",
        );

        if (bestVideoUrl) {
          console.log(`Video URL: ${bestVideoUrl}`);
        }
      }
    });
  },
  { urls: ["<all_urls>"] },
  ["responseHeaders"],
);
