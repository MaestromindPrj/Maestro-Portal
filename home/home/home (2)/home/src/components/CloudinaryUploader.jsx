import React, { useState } from "react";
import axios from "axios";
import "./uploader.css"; // create this CSS file for clean styling

function CloudinaryUploader({ onUploadComplete }) {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "unsigned_upload");
        formData.append("folder", "Circletab");

        try {
            const response = await axios.post(
                "https://api.cloudinary.com/v1_1/dvvahx5fu/auto/upload",
                formData
            );
            onUploadComplete(response.data.secure_url, file.type);
            setFile(null);
        } catch (err) {
            console.error("Upload error", err);
        }
        setUploading(false);
    };

    return (
        <div className="uploader-container">
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload} disabled={uploading}>
                {uploading ? "Uploading..." : "Upload"}
            </button>
        </div>
    );
}

export default CloudinaryUploader;
