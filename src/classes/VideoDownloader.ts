import { VideoService } from "./VideoService";
import { DownloadService } from "./DownloadService";

export class VideoDownloader {
  constructor(
    private videoService: VideoService,
    private downloadService: DownloadService,
  ) {
    this.initEventListeners();
  }

  private async handleDownloadVideo() {
    const url: string = this.getInputText();
    if (!this.isValidVideoLink(url)) {
      alert("Please input a link to an AP Classroom video.");
      return;
    }

    const videoID = this.getVideoID(url);
    if (!videoID) return;

    const progressBar = document.getElementById(
      "downloadProgress",
    ) as HTMLProgressElement;
    const progressLabel = document.getElementById(
      "progressLabel",
    ) as HTMLLabelElement;

    if (!progressBar || !progressLabel) return;

    progressBar.style.display = "block";
    progressLabel.textContent = "Fetching video info...";

    try {
      const videoURL = await this.videoService.getVideoURL(
        videoID,
        this.getSelectedVideoQuality(),
      );
      if (!videoURL) throw new Error("Video URL is null.");

      const videoName = await this.videoService.getVideoName(videoID);
      if (!videoName) throw new Error("Video name is null");

      const onProgress = (progress: number) => {
        progressBar.value = progress;
        progressLabel.textContent = `Downloading... ${progress}%`;
      };

      await this.downloadService.downloadFile(
        videoURL,
        `${videoName} (${this.getSelectedVideoQuality()}).mp4`,
        onProgress,
      );

      progressLabel.textContent = "Download complete!";
      setTimeout(() => {
        progressBar.style.display = "none";
        progressLabel.textContent = "";
      }, 2000);
    } catch (error) {
      console.error(error);
      alert("An error occurred during download :(\nSee console for details.");
      progressLabel.textContent = "Download failed.";
      setTimeout(() => {
        progressBar.style.display = "none";
        progressLabel.textContent = "";
      }, 3000);
    }
  }
  private handleDownloadSubtitles() {}
  private async handleOpenTab() {
    const url: string = this.getInputText();
    if (!this.isValidVideoLink(url)) {
      alert("Please input a link to an AP Classroom video.");
      return;
    }
    const videoID = this.getVideoID(url);
    if (!videoID) return;

    const videoURL = await this.videoService.getVideoURL(
      videoID,
      this.getSelectedVideoQuality(),
    );
    if (!videoURL) return;

    window.open(videoURL);
  }
  // FIXME: implement debouncing so that this doesn't spam requests
  private async populateVideoQualities() {
    const dropdown = document.getElementById(
      "qualityDropdown",
    ) as HTMLSelectElement;

    const url: string = this.getInputText();
    if (!this.isValidVideoLink(url)) {
      dropdown.length = 0;
      return;
    }

    const videoID = this.getVideoID(url);
    if (!videoID) {
      dropdown.length = 0;
      return;
    }

    const qualities = await this.videoService.getVideoQualities(videoID);
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

  private getVideoID(url: string): string | null {
    return new URLSearchParams(new URL(url).search).get("apd");
  }

  private isValidVideoLink(url: string): boolean {
    try {
      new URL(url);
    } catch (_) {
      return false;
    }

    const videoID = this.getVideoID(url);
    if (!videoID) {
      return false;
    }

    return true;
  }

  private getSelectedVideoQuality(): string {
    const dropdown = document.getElementById(
      "qualityDropdown",
    ) as HTMLSelectElement;
    return dropdown.value;
  }

  private getInputText(): string {
    const inputElement = document.getElementById(
      "videoInput",
    ) as HTMLInputElement;

    return inputElement.value;
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
    document
      .getElementById("videoInput")
      ?.addEventListener("input", () => this.populateVideoQualities());
  }
}
