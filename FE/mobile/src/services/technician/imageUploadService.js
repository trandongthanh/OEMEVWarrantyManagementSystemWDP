import api from "../api";
/**
 * Tải file (ảnh) lên server.
 * File này thay thế cho 'cloudinary.ts' của web.
 *
 * Yêu cầu: Backend phải có một endpoint (ví dụ: /upload)
 * chấp nhận 'multipart/form-data' và trả về JSON có chứa URL của ảnh.
 *
 * @param {object} file - Đối tượng file từ react-native-image-picker
 * (phải có uri, type, và fileName)
 * @returns {Promise<string>} URL của file đã tải lên
 */
const uploadImage = async (file) => {
  // 1. Tạo FormData
  const formData = new FormData();

  // 2. Thêm file vào FormData
  // Cú pháp cho React Native FormData hơi khác so với web
  formData.append("file", {
    uri: file.uri, // Đường dẫn tới file trên thiết bị
    type: file.type, // Loại file (ví dụ: 'image/jpeg')
    name: file.fileName || "image.jpg", // Tên file
  });

  try {
    // 3. Gửi request POST với header 'multipart/form-data'
    // Instance axios 'api' sẽ tự động xử lý header này khi
    // bạn truyền FormData làm body
    const response = await api.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // 4. Trích xuất URL từ response
    // Giả sử backend trả về: { data: { url: "..." } }
    // hoặc { url: "..." }
    // Điều chỉnh dòng này nếu cấu trúc response của bạn khác
    const url = response.data?.url || response.data?.data?.url;

    if (!url) {
      console.error("API did not return a URL", response.data);
      throw new Error("API did not return a URL");
    }

    return url;
  } catch (error) {
    console.error("Lỗi khi tải ảnh (uploadImage):", error);
    throw new Error("Failed to upload image.");
  }
};

const imageUploadService = {
  uploadImage,
};

export default imageUploadService;