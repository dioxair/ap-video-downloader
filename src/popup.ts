const downloadButton = document.getElementById(
  "downloadVideoButton",
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

function downloadVideo(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
}

downloadButton.addEventListener("click", () => {
  getVideoUrl((videoUrl) => {
    if (videoUrl) {
      downloadVideo(videoUrl, "video.mp4");
    } else {
      alert("No video URL detected yet.");
    }
  });
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
