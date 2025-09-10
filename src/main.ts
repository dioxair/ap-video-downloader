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
  async getVideoInfo(videoUrl: string): Promise<ApMediaResponse> {
    const response = await fetch(videoUrl);

    if (!response.ok) {
      throw Error(
        `HTTP error making GET request to ${videoUrl}. Status code ${response.status} ${response.statusText}.`
      );
    }

    let videoInfo: ApMediaResponse = await response.json();
    return videoInfo;
  }
}
