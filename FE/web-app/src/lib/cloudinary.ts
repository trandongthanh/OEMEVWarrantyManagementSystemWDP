// Cloudinary upload utility for client-side use
export async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Upload failed");
  }

  const data = await response.json();
  return data.url;
}

export function getFileType(url: string): "image" | "file" {
  const extension = url.split(".").pop()?.toLowerCase();
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg"];

  return imageExtensions.includes(extension || "") ? "image" : "file";
}
