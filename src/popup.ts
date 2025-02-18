const downloadButton = document.getElementById(
  "downloadVideoButton",
) as HTMLButtonElement;
const downloadSubtitlesButton = document.getElementById(
  "downloadSubsButton",
) as HTMLButtonElement;
const openTabButton = document.getElementById(
  "openVideoInTabButton",
) as HTMLButtonElement;

function isOriginalAsset(asset: { type: string }) {
  if (asset.type === "original") return true;
}

async function getVideoUrl(currentUrl: string): Promise<string | null> {
  const videoID = getVideoID(currentUrl);
  const infoUrl = `https://fast.wistia.com/embed/medias/${videoID}.json`;

  try {
    const response = await fetch(infoUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    const videoAsset = data?.media?.assets?.find(isOriginalAsset);

    if (videoAsset) {
      // silly replace but i dont think this raises any problems
      return videoAsset.url.replace("bin", "mp4");
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching or processing the JSON:", error);
    return null;
  }
}

async function getCurrentUrl(): Promise<string | null> {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  if (tab.url === undefined) return null;
  return tab.url;
}

function getVideoID(url: string): string | null {
  return new URLSearchParams(new URL(url).search).get("apd");
}

async function checkIfClassroomTab(): Promise<boolean> {
  const currentUrl = await getCurrentUrl();
  if (currentUrl === null) throw new Error("Current tab URL is null.");

  if (!getVideoID(currentUrl)) {
    alert("Please navigate to an AP Classroom video.");
    return false;
  }

  return true;
}

async function downloadFile(url: string, filename: string) {
  const response = await fetch(url);
  const blob = await response.blob();
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

function getSubtitlesUrl(url: string): string | null {
  const videoID = getVideoID(url);

  if (videoID) {
    return `https://fast.wistia.net/embed/captions/${videoID}.vtt?language=eng`;
  } else {
    return null;
  }
}

downloadButton.addEventListener("click", async () => {
  const currentUrl = await getCurrentUrl();
  if (currentUrl === null) throw new Error("Current tab URL is null.");
  if (!(await checkIfClassroomTab())) return;

  getVideoUrl(currentUrl).then(async (url) => {
    if (url === null)
      throw new Error("URL in getVideoUrl from downloadButton is null.");
    // TODO: Use name in metadata for file names
    await downloadFile(url, "video.mp4");
  });
});

downloadSubtitlesButton.addEventListener("click", async () => {
  const currentUrl = await getCurrentUrl();
  if (currentUrl === null) throw new Error("Current tab URL is null.");
  if (!(await checkIfClassroomTab())) return;

  const subtitlesUrl = getSubtitlesUrl(currentUrl);
  if (subtitlesUrl !== null) {
    await downloadFile(subtitlesUrl, "subtitles.vtt");
  } else if (subtitlesUrl === null) {
    throw new Error("subtitlesUrl is null.");
  }
});

openTabButton.addEventListener("click", async () => {
  const currentUrl = await getCurrentUrl();
  if (currentUrl === null) throw new Error("Current tab URL is null.");
  if (!(await checkIfClassroomTab())) return;

  getVideoUrl(currentUrl).then(async (url) => {
    if (url === null)
      throw new Error("URL in getVideoUrl from openTabButton is null.");
    chrome.tabs.create({ url: url });
  });
});
