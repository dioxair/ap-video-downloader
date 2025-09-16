import { VideoService } from "./VideoService";

export class VideoDownloader {
  constructor(private videoService: VideoService) {
    this.initEventListeners();
  }

  private handleDownloadVideo() {}
  private handleDownloadSubtitles() {}
  private async handleOpenTab() {
    const url: string = this.getInputText();
    if (!this.isValidVideoLink(url)) {
      alert("Please input a link to an AP Classroom video.");
      return;
    }

    const videoID = this.getVideoID(url);
    if (!videoID) return;

    const videoInfo = await this.videoService.getVideoInfo(videoID);
    if (!videoInfo) return;

    window.open(videoInfo.media.assets[0].url);
  }
  // FIXME: implement debouncing so that this doesn't spam requests
  private async populateVideoQualities() {
    const dropdown = document.getElementById(
      "qualityDropdown"
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

  private getInputText(): string {
    const inputElement = document.getElementById(
      "videoInput"
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
