/**
 * Utility functions to handle file attachments in chat messages
 * Files are sent as Cloudinary URLs in the message content
 */

export interface FileAttachment {
  url: string;
  type: "image" | "file";
  name: string;
}

/**
 * Check if a URL is a Cloudinary URL
 */
export function isCloudinaryUrl(url: string): boolean {
  return url.includes("cloudinary.com");
}

/**
 * Check if URL is an image based on extension or Cloudinary format
 */
export function isImageUrl(url: string): boolean {
  const imageExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".svg",
    ".bmp",
  ];
  const urlLower = url.toLowerCase();

  // Check file extension
  if (imageExtensions.some((ext) => urlLower.includes(ext))) {
    return true;
  }

  // Check Cloudinary image transformation patterns
  if (urlLower.includes("cloudinary.com") && urlLower.includes("/image/")) {
    return true;
  }

  return false;
}

/**
 * Extract Cloudinary URLs from message content
 * Returns array of URLs found in the message
 */
export function extractCloudinaryUrls(content: string): string[] {
  const urlPattern = /(https?:\/\/res\.cloudinary\.com\/[^\s]+)/g;
  return content.match(urlPattern) || [];
}

/**
 * Parse message content to extract file attachments and text
 */
export function decodeFileFromContent(content: string): {
  file: FileAttachment | null;
  text: string;
} {
  const urls = extractCloudinaryUrls(content);

  if (urls.length > 0) {
    const url = urls[0]; // Take first URL
    const isImage = isImageUrl(url);

    // Extract filename from URL (last segment)
    const urlParts = url.split("/");
    const lastPart = urlParts[urlParts.length - 1];
    const fileName = lastPart.split("?")[0]; // Remove query params

    // Remove URL from content to get remaining text
    const text = content.replace(url, "").trim();

    return {
      file: {
        url,
        type: isImage ? "image" : "file",
        name: fileName,
      },
      text,
    };
  }

  return {
    file: null,
    text: content,
  };
}
