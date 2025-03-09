class VideoService {
  constructor(private baseUrl: string) {}

  async getVideoUrl(videoID: string, quality: string): Promise<string | null> {
    const infoUrl = `${this.baseUrl}/embed/medias/${videoID}.json`;
    try {
      const response = await fetch(infoUrl);
      if (!response.ok)
        throw new Error(
          `Received non-ok status code ${response.status} from ${infoUrl}`,
        );

      const data = await response.json();
      const videoAsset = data?.media?.assets?.find(
        (asset: { display_name: string }) => asset.display_name === quality,
      );

      return videoAsset ? videoAsset.url.replace("bin", "mp4") : null;
    } catch (error) {
      console.error("Error fetching video URL:", error);
      return null;
    }
  }

  async getVideoName(videoID: string): Promise<string | null> {
    const infoUrl = `${this.baseUrl}/embed/medias/${videoID}.json`;
    try {
      const response = await fetch(infoUrl);
      if (!response.ok)
        throw new Error(
          `Received non-ok status code ${response.status} from ${infoUrl}`,
        );

      const data = await response.json();
      const videoName = data?.media?.name;

      return videoName ? this.sanitizeFilename(videoName) : null;
    } catch (error) {
      console.error("Error fetching video URL:", error);
      return null;
    }
  }

  async getVideoQualities(videoID: string): Promise<string[] | null> {
    const infoUrl = `${this.baseUrl}/embed/medias/${videoID}.json`;
    try {
      const response = await fetch(infoUrl);
      if (!response.ok) {
        throw new Error(
          `Received non-ok status code ${response.status} from ${infoUrl}`,
        );
      }

      const data = await response.json();
      const videoAssets = data?.media?.assets;

      if (!videoAssets) {
        return null;
      }

      const videoQualities = videoAssets
        .filter((asset: { display_name: string }) => {
          return (
            asset.display_name.endsWith("p") ||
            asset.display_name === "Original File"
          );
        })
        .map((asset: { display_name: string }) => asset.display_name)
        .sort((a: string, b: string) => parseInt(b) - parseInt(a));

      return videoQualities ?? null;
    } catch (error) {
      console.error("Error fetching video qualities:", error);
      return null;
    }
  }

  getSubtitlesUrl(videoID: string): string {
    return `${this.baseUrl}/embed/captions/${videoID}.vtt?language=eng`;
  }

  // regex rules from https://stackoverflow.com/a/31976060
  sanitizeFilename(filename: string): string {
    filename = filename
      .replace(/[<>:"\/\\|?*\x00-\x1F]/g, "")
      .replace(/[ .]+$/, "");
    return /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\..*)?$/i.test(filename) ||
      filename === "." ||
      filename === ".."
      ? `_invalid_${filename}`
      : filename;
  }
}

class TabService {
  async getCurrentUrl(): Promise<string | null> {
    const [tab] = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true,
    });
    return tab.url ?? null;
  }
}

class DownloadService {
  async downloadFile(url: string, filename: string): Promise<void> {
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
}

class VideoDownloader {
  constructor(
    private videoService: VideoService,
    private tabService: TabService,
    private downloadService: DownloadService,
  ) {
    this.initEventListeners();
  }

  private async populateVideoQualities(): Promise<void> {
    const currentUrl = await this.tabService.getCurrentUrl();
    if (!currentUrl) return;

    const videoID = this.getVideoID(currentUrl);
    if (!videoID) return;

    const qualities = await this.videoService.getVideoQualities(videoID);
    const dropdown = document.getElementById(
      "qualityDropdown",
    ) as HTMLSelectElement;

    if (qualities && dropdown) {
      dropdown.innerHTML = "";
      qualities.forEach((quality) => {
        const option = document.createElement("option");
        option.value = quality;
        option.textContent = quality;
        dropdown.appendChild(option);
      });
    }
  }

  private getSelectedVideoQuality(): string {
    const dropdown = document.getElementById(
      "qualityDropdown",
    ) as HTMLSelectElement;
    return dropdown.value;
  }

  private async handleDownloadVideo(): Promise<void> {
    const currentUrl = await this.tabService.getCurrentUrl();
    if (!currentUrl || !this.isValidClassroomTab(currentUrl)) return;

    const videoID = this.getVideoID(currentUrl);
    if (!videoID) return;

    const videoUrl = await this.videoService.getVideoUrl(
      videoID,
      this.getSelectedVideoQuality(),
    );
    if (!videoUrl) throw new Error("Video URL is null.");

    const videoName = await this.videoService.getVideoName(videoID);
    if (!videoName) throw new Error("Video name is null");

    await this.downloadService.downloadFile(videoUrl, `${videoName}.mp4`);
  }

  private async handleDownloadSubtitles(): Promise<void> {
    const currentUrl = await this.tabService.getCurrentUrl();
    if (!currentUrl || !this.isValidClassroomTab(currentUrl)) return;

    const videoID = this.getVideoID(currentUrl);
    if (!videoID) return;

    const videoName = await this.videoService.getVideoName(videoID);
    if (!videoName) throw new Error("Video name is null");

    const subtitlesUrl = this.videoService.getSubtitlesUrl(videoID);
    await this.downloadService.downloadFile(subtitlesUrl, `${videoName}.vtt`);
  }

  private async handleOpenTab(): Promise<void> {
    const currentUrl = await this.tabService.getCurrentUrl();
    if (!currentUrl || !this.isValidClassroomTab(currentUrl)) return;

    const videoID = this.getVideoID(currentUrl);
    if (!videoID) return;

    const videoUrl = await this.videoService.getVideoUrl(
      videoID,
      this.getSelectedVideoQuality(),
    );
    if (!videoUrl) throw new Error("Video URL is null.");

    chrome.tabs.create({ url: videoUrl });
  }

  private getVideoID(url: string): string | null {
    return new URLSearchParams(new URL(url).search).get("apd");
  }

  private isValidClassroomTab(url: string): boolean {
    const videoID = this.getVideoID(url);
    if (!videoID) {
      alert("Please navigate to an AP Classroom video.");
      return false;
    }
    return true;
  }

  private initEventListeners(): void {
    document
      .getElementById("downloadVideoButton")
      ?.addEventListener("click", () => this.handleDownloadVideo());
    document
      .getElementById("downloadSubsButton")
      ?.addEventListener("click", () => this.handleDownloadSubtitles());
    document
      .getElementById("openVideoInTabButton")
      ?.addEventListener("click", () => this.handleOpenTab());
    window.addEventListener("load", () => this.populateVideoQualities());
  }
}

const videoService = new VideoService("https://fast.wistia.com");
const tabService = new TabService();
const downloadService = new DownloadService();
new VideoDownloader(videoService, tabService, downloadService);
