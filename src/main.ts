import { VideoService } from "./classes/VideoService";
import { VideoDownloader } from "./classes/VideoDownloader";

const videoService = new VideoService();
new VideoDownloader(videoService);
