import { Platform } from "react-native";
const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

const uploadImage = async (file) => {
  if (!file || !file.uri) {
    throw new Error("No file data provided");
  }

  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    console.error("Thiếu cấu hình Cloudinary trong .env");
    throw new Error("Lỗi cấu hình hệ thống (Missing Cloudinary Config)");
  }

  const formData = new FormData();
  
  const fileName = file.fileName || file.uri.split('/').pop();
  const fileType = file.type || 'image/jpeg';

  const filePayload = {
    uri: Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri,
    type: fileType,
    name: fileName,
  };

  formData.append("file", filePayload);
  formData.append("upload_preset", UPLOAD_PRESET);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Cloudinary Upload Error:", data);
      throw new Error(data.error?.message || "Upload failed");
    }

    return data.secure_url;

  } catch (error) {
    console.error("Lỗi upload ảnh:", error);
    throw new Error("Không thể tải ảnh lên. Vui lòng kiểm tra kết nối mạng.");
  }
};

const imageUploadService = {
  uploadImage,
};

export default imageUploadService;