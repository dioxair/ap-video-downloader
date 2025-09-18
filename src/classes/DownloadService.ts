export class DownloadService {
  async downloadFile(
    url: string,
    fileName: string,
    onProgress: (progress: number) => void,
  ): Promise<void> {
    const response = await fetch(url);
    if (!response.ok || !response.body) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    const contentLength = response.headers.get("content-length");
    if (!contentLength) {
      throw new Error(
        "Content-Length header not found! Cannot track progress.",
      );
    }
    const totalSize = parseInt(contentLength, 10);
    let loadedSize = 0;

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      chunks.push(value);
      loadedSize += value.length;

      const progress = Math.round((loadedSize / totalSize) * 100);
      onProgress(progress);
    }

    const blob = new Blob(chunks);
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  }
}
