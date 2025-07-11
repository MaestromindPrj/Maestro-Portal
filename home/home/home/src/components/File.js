import React, { useState } from "react";
import axios from "axios";

function UploadToCloudinary() {
    const [file, setFile] = useState(null);
    const [url, setUrl] = useState("");

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            alert("Please select a file first!");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "unsigned_upload"); // your Cloudinary upload preset

        try {
            const response = await axios.post(
                "https://api.cloudinary.com/v1_1/dvvahx5fu/auto/upload", // replace YOUR_CLOUD_NAME here
                formData
            );

            console.log("Uploaded URL:", response.data.secure_url);
            setUrl(response.data.secure_url);

        } catch (error) {
            console.error("Upload failed:", error);
            alert("Upload failed, please check the console for more info.");
        }
    };

    return (
        <div>
            <h3>Upload Image or Video</h3>
            <input type="file" accept="image/*,video/*" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload to Cloudinary</button>

            {url && (
                <div style={{ marginTop: "20px" }}>
                    <p>Uploaded File:</p>
                    {file && file.type.startsWith("video") ? (
                        <video width="300" height="200" controls src={url}></video>
                    ) : (
                        <img src={url} alt="Uploaded" width="300" />
                    )}
                </div>
            )}
        </div>
    );
}

export default UploadToCloudinary;
