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
  async getVideoInfo(videoUrl: string): Promise<ApMediaResponse | null> {
    try {
      const response = await fetch(videoUrl);

      if (!response.ok) {
        throw Error(
          `HTTP error making GET request to ${videoUrl}. Status code ${response.status} ${response.statusText}.`
        );
      }

      let videoInfo: ApMediaResponse = await response.json();
      return videoInfo;
    } catch (err) {
      console.error("Error fetching video URL:", err);
      return null;
    }
  }

  async getVideoName(videoUrl: string): Promise<string | null> {
    const videoInfo = await this.getVideoInfo(videoUrl);
    return videoInfo ? this.sanitizeFilename(videoInfo.media.name) : null;
  }

  async getVideoQualities(videoUrl: string): Promise<string[] | null> {
    const videoInfo = await this.getVideoInfo(videoUrl);
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
  constructor(videoService: VideoService) {
    this.initEventListeners();
  }

  private handleDownloadVideo() {}
  private handleDownloadSubtitles() {}
  private handleOpenTab() {}
  private populateVideoQualities() {}

  private getVideoID(url: string): string | null {
    return new URLSearchParams(new URL(url).search).get("apd");
  }

  private isValidVideoLink(url: string): boolean {
    const videoID = this.getVideoID(url);
    if (!videoID) {
      alert("Please input a link to an AP Classroom video.");
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
