import React, { useState } from 'react';
import MainLayout from '../layout/MainLayout';
import './AddPost.css';
import { db } from '../firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import axios from 'axios';

function AddPost() {
    const [postContent, setPostContent] = useState('');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [posted, setPosted] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleFileUpload = (e) => {
        const uploadedFile = e.target.files[0];
        if (uploadedFile) {
            setFile(uploadedFile);
            setPreview(URL.createObjectURL(uploadedFile));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        let fileURL = '';
        let mediaType = '';

        if (file) {
            // Upload to Cloudinary
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'unsigned_upload'); // your preset name

            try {
                const response = await axios.post(
                    "https://api.cloudinary.com/v1_1/dvvahx5fu/auto/upload",
                    formData
                );

                fileURL = response.data.secure_url;
                mediaType = file.type.startsWith('video') ? 'video' : 'image';
            } catch (error) {
                console.error('Cloudinary upload failed:', error);
                setUploading(false);
                return;
            }
        }

        // Now add the post to Firestore
        try {
            await addDoc(collection(db, 'posts'), {
                username: 'Anonymous',
                content: postContent,
                mediaURL: fileURL,
                mediaType: mediaType,
                createdAt: serverTimestamp(),
                likes: [],
                dislikes: [],
            });

            setPosted(true);
            setPostContent('');
            setPreview(null);
            setFile(null);
        } catch (error) {
            console.error('Error adding post:', error);
        }

        setUploading(false);
    };

    return (
        <MainLayout>
            <div className="add-post-container">
                <h3>Add a New Post</h3>
                <form onSubmit={handleSubmit}>
                    <textarea
                        placeholder="Write your post here..."
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        required
                    />
                    <label className="file-label">
                        Upload Image/Video
                        <input type="file" accept="image/*,video/*" onChange={handleFileUpload} />
                    </label>
                    {preview && (
                        file.type && file.type.startsWith('video') ? (
                            <video src={preview} controls className="image-preview" />
                        ) : (
                            <img src={preview} alt="Preview" className="image-preview" />
                        )
                    )}
                    <div className="form-buttons">
                        <button type="submit" disabled={uploading}>
                            {uploading ? 'Uploading...' : 'Submit'}
                        </button>
                    </div>
                    {posted && <p style={{ color: 'green' }}>✅ Post submitted successfully!</p>}
                </form>
            </div>
        </MainLayout>
    );
}

export default AddPost;
