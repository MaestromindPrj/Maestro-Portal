import React, { useState } from "react";
import MainLayout from "../layout/MainLayout";
import { db, collection, addDoc, serverTimestamp } from "../firebase";
import CloudinaryUploader from "../components/CloudinaryUploader";
import "./AddPost.css";

function AddPost() {
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

    return (
        <MainLayout>
            <div className="add-post-container">
                <h3>Add a New Post</h3>
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
                            <video src={mediaURL} controls width="300" height="100" />
                        ) : (
                            <img src={mediaURL} alt="Preview" width="300" />
                        )
                    )}
                    <button type="submit">Submit</button>
                </form>
                {posted && <p style={{ color: "green" }}>✅ Post submitted!</p>}
            </div>
        </MainLayout>
    );
}

export default AddPost;
