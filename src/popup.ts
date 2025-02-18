const downloadButton = document.getElementById(
  "downloadVideoButton",
) as HTMLButtonElement;
const downloadSubtitlesButton = document.getElementById(
  "downloadSubsButton",
) as HTMLButtonElement;
const openTabButton = document.getElementById(
  "openVideoInTabButton",
) as HTMLButtonElement;
const toggleButton = document.getElementById(
  "toggleMonitoringButton",
) as HTMLButtonElement;

function getVideoUrl(callback: (url: string | null) => void) {
  chrome.storage.local.get("videoUrl", (data) => {
    callback(data.videoUrl || null);
  });
}

function getMonitoringState(callback: (url: string | null) => void) {
  chrome.storage.local.get("monitoring", (data) => {
    callback(data.monitoring || null);
  });
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

downloadButton.addEventListener("click", () => {
  getVideoUrl(async (videoUrl) => {
    if (videoUrl) {
      await downloadFile(videoUrl, "video.mp4");
    } else {
      alert("No video URL detected yet.");
    }
  });
});

downloadSubtitlesButton.addEventListener("click", async () => {
  const currentUrl = await getCurrentUrl();
  if (currentUrl === null) {
    console.log("Could not find current tab URL");
    return;
  }

  if (!getVideoID(currentUrl)) {
    alert("Please navigate to an AP Classroom video.");
  }

  const subtitlesUrl = getSubtitlesUrl(currentUrl);
  if (subtitlesUrl !== null) {
    await downloadFile(subtitlesUrl, "subtitles.vtt");
  }
});

openTabButton.addEventListener("click", () => {
  getVideoUrl((videoUrl) => {
    if (videoUrl) {
      chrome.tabs.create({ url: videoUrl });
    } else {
      alert("No video URL detected yet.");
    }
  });
});

toggleButton.addEventListener("click", () => {
  getMonitoringState((monitoring) => {
    if (monitoring) {
      chrome.storage.local.set({ monitoring: false });
      toggleButton.textContent = "Enable monitoring";
    } else {
      chrome.storage.local.set({ monitoring: true });
      toggleButton.textContent = "Disable monitoring";
    }
  });
});
