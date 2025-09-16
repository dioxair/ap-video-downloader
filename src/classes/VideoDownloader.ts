import { VideoService } from "./VideoService";

export class VideoDownloader {
  constructor(private videoService: VideoService) {
    this.initEventListeners();
  }

  private handleDownloadVideo() {}
  private handleDownloadSubtitles() {}
  private async handleOpenTab() {
    const url: string = this.getInputText();
    if (!this.isValidVideoLink(url)) return;

    const videoID = this.getVideoID(url);
    if (!videoID) return;

    const videoInfo = await this.videoService.getVideoInfo(videoID);
    if (!videoInfo) return;

    window.open(videoInfo.media.assets[0].url);
  }
  private populateVideoQualities() {}

  private getVideoID(url: string): string | null {
    return new URLSearchParams(new URL(url).search).get("apd");
  }

  private isValidVideoLink(url: string): boolean {
    try {
      new URL(url);
    } catch (_) {
      alert("Please input a link to an AP Classroom video.");
      return false;
    }

    const videoID = this.getVideoID(url);
    if (!videoID) {
      alert("Please input a link to an AP Classroom video.");
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
    window.addEventListener("load", () => this.populateVideoQualities());
  }
}
