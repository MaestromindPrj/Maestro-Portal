export const uploadToCloudinary = async (file, folder) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'unsigned_preset'); // Replace with your actual preset
  formData.append('folder', folder);

  // Determine if it's a document and set the correct endpoint
  const isDocument = file.type === 'application/pdf' ||
                     file.type === 'application/msword' ||
                     file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  const uploadUrl = isDocument
    ? 'https://api.cloudinary.com/v1_1/drityt8gc/raw/upload'
    : 'https://api.cloudinary.com/v1_1/drityt8gc/auto/upload';

  try {
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      return data.secure_url; // ✅ Return the URL to save in Firestore
    } else {
      throw new Error(data.error?.message || 'Upload failed');
    }
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    throw err;
  }
};
