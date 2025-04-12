import axios from "axios";

const uploadToCloudinary = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
    );

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${
        import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
      }/raw/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("image uploaded to cloudinary.");
    return response.data.secure_url;
  } catch (error) {
    console.error("failed to upload the image.", error);
    throw new Error("failed to upload the image.");
  }
};

export default uploadToCloudinary;
