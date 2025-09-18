import { VideoService } from "./classes/VideoService";
import { DownloadService } from "./classes/DownloadService";
import { VideoDownloader } from "./classes/VideoDownloader";

const videoService = new VideoService();
const downloadService = new DownloadService();
new VideoDownloader(videoService, downloadService);
