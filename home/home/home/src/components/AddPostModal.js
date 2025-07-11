import React, { useState } from 'react';
import './AddPostModal.css';

import { db, collection, addDoc, serverTimestamp } from "../firebase";
import CloudinaryUploader from "../components/CloudinaryUploader";
import { FaTimes } from 'react-icons/fa';

function AddPostModal({ isOpen, onClose }) {
    const [postContent, setPostContent] = useState("");
    const [mediaURL, setMediaURL] = useState("");
    const [mediaType, setMediaType] = useState("");
    const [posted, setPosted] = useState(false);


    const handleUploadComplete = (url, type) => {
        setMediaURL(url);
        setMediaType(type.startsWith("video") ? "video" : "image");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, "posts"), {
                username: "Anonymous",
                content: postContent,
                mediaURL,
                mediaType,
                createdAt: serverTimestamp(),
                likes: [],
                dislikes: [],
            });
            setPostContent("");
            setMediaURL("");
            setPosted(true);
        } catch (err) {
            console.error("Error adding post", err);
        }
    };

    if (!isOpen) return null;



    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Add Post 📝</h3>
                <button className="close-button" onClick={onClose}><FaTimes /></button>
                <form onSubmit={handleSubmit}>

                    <textarea
                        placeholder="Write something..."
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        required
                    />
                    <CloudinaryUploader onUploadComplete={handleUploadComplete} />
                    {mediaURL && (
                        mediaType === "video" ? (
                            <video src={mediaURL} controls width="300" height="200" />
                        ) : (
                            <img src={mediaURL} alt="Preview" width="300" />
                        )
                    )}
                    <button type="submit">Submit</button>

                </form>
                {posted && <p style={{ color: "green" }}>✅ Post submitted!</p>}
            </div>
        </div>

    );
}

export default AddPostModal;






