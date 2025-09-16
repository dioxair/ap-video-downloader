interface ApMediaResponse {
  media: {
    /**
     * Decimal representation of aspect ratio
     *
     * 1.7777777777777777 = roughly 16:9
     */
    aspectRatio: number;
    assets: {
      is_enhanced: boolean;
      type: string;
      slug: string;
      /**
       * These will be used for video quality names.
       *
       * Valid AP Classroom display names for assets I've seen include Original File, 1080p, 720p, etc.
       */
      display_name: string;
      width?: number;
      height?: number;
      /**
       * Size of the media in bytes
       */
      size: number;
      bitrate: number;
      public: boolean;
      /**
       * TODO: make non scuffed implementation
       */
      metadata: Record<string, any>;
      url: string;
      /**
       * Unix timestamp
       */
      created_at: number;
    }[];
    branding: boolean;
    createdAt: number;
    distilleryUrl: string;
    /**
     * Duration of video in seconds
     */
    duration: number;
    enableCustomerLogo: boolean;
    firstEmbedForAccount: boolean;
    firstShareForAccount: boolean;
    hashedId: string;
    mediaId: number;
    mediaKey: string;
    mediaType: string;
    name: string;
    preloadPreference: any;
    seoDescription: string;
    playableWithoutInstantHls: boolean;
    privacyMode: boolean;
    stats: {
      loadCount: number;
      playCount: number;
      uniqueLoadCount: number;
      uniquePlayCount: number;
      averageEngagement: number;
    };
    hls_enabled: boolean;
  };
}

class VideoService {
  async getVideoInfo(videoID: string): Promise<ApMediaResponse | null> {
    const infoUrl = `https://fast.wistia.com/embed/medias/${videoID}.json`;
    try {
      const response = await fetch(infoUrl);

      if (!response.ok) {
        throw Error(
          `HTTP error making GET request to ${infoUrl}. Status code ${response.status} ${response.statusText}.`
        );
      }

      const videoInfo: ApMediaResponse = await response.json();
      return videoInfo;
    } catch (err) {
      console.error("Error fetching video URL:", err);
      return null;
    }
  }

  async getVideoName(videoID: string): Promise<string | null> {
    const videoInfo = await this.getVideoInfo(videoID);
    return videoInfo ? this.sanitizeFilename(videoInfo.media.name) : null;
  }

  async getVideoQualities(videoID: string): Promise<string[] | null> {
    const videoInfo = await this.getVideoInfo(videoID);
    return videoInfo
      ? videoInfo.media.assets.map((asset) => asset.display_name)
      : null;
  }

  getSubtitlesUrl(videoID: string): string {
    return `https://fast.wistia.com/embed/captions/${videoID}.vtt?language=eng`;
  }

  // regex rules from https://stackoverflow.com/a/31976060
  sanitizeFilename(fileName: string): string {
    fileName = fileName
      .replace(/[<>:"\/\\|?*\x00-\x1F]/g, "")
      .replace(/[ .]+$/, "");
    return /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\..*)?$/i.test(fileName) ||
      fileName === "." ||
      fileName === ".."
      ? `_invalid_${fileName}`
      : fileName;
  }
}

class VideoDownloader {
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
const videoService = new VideoService();
new VideoDownloader(videoService);
