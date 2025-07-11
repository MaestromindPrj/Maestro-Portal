import React, { useState } from 'react';
import './AddPost.css';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { FaTimes } from 'react-icons/fa';

function AddPost({ showModal, onClose }) {
  const [postContent, setPostContent] = useState('');
  const [preview, setPreview] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'posts'), {
        username: 'Anonymous',
        content: postContent,
        image: preview,
        createdAt: serverTimestamp(),
        likes: 0,
        dislikes: 0,
        shares: 0,
        comments: [],
      });
      setPostContent('');
      setPreview(null);
      onClose();
    } catch (error) {
      console.error('Error adding post: ', error);
    }
  };

  if (!showModal) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Add a New Post</h3>
        <button className="close-button" onClick={onClose}><FaTimes /></button>
        <form onSubmit={handleSubmit}>
          <textarea
            placeholder="Write your post here..."
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            required
          />
          <label className="file-label">Upload Image</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          {preview && <img src={preview} alt="Preview" className="image-preview" />}
          <div className="submit-button-container">
            <button type="submit">Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddPost;
