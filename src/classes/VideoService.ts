import type { ApMediaResponse } from "../interfaces/ApMediaResponse";

export class VideoService {
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
