import React, { useEffect, useState, useCallback } from 'react';
import { FaThumbsUp, FaThumbsDown, FaPaperPlane, FaShareAlt } from 'react-icons/fa';
import './PostCard.css';
import { db } from '../firebase';
import { formatDistanceToNow } from 'date-fns';
import {
  updateDoc,
  getDoc,
  setDoc,
  doc,
  collection,
  getDocs,
  addDoc
} from 'firebase/firestore';

function PostCard({ post }) {
  const [likes, setLikes] = useState(post.likes || 0);
  const [dislikes, setDislikes] = useState(post.dislikes || 0);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [reaction, setReaction] = useState(null);

  const user = 'You'; // Replace with actual logged-in user's ID

  const postRef = useCallback(() => doc(db, 'posts', post.id), [post.id]);
  const commentsRef = useCallback(() => collection(db, 'posts', post.id, 'comments'), [post.id]);
  const reactionsRef = useCallback(() => doc(collection(db, 'posts', post.id, 'reactions'), user), [post.id, user]);

  const handleVote = async (type) => {
    const reactionSnap = await getDoc(reactionsRef());
    let currentReaction = null;
    if (reactionSnap.exists()) {
      currentReaction = reactionSnap.data().type;
    }

    if (currentReaction === type) return;

    let newLikes = likes;
    let newDislikes = dislikes;

    if (currentReaction === 'like') newLikes = Math.max(0, newLikes - 1);
    if (currentReaction === 'dislike') newDislikes = Math.max(0, newDislikes - 1);

    if (type === 'like') newLikes++;
    else if (type === 'dislike') newDislikes++;

    await updateDoc(postRef(), {
      likes: newLikes,
      dislikes: newDislikes
    });

    await setDoc(reactionsRef(), { type });

    setLikes(newLikes);
    setDislikes(newDislikes);
    setReaction(type);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.href}#post-${post.id}`);
    alert('Post link copied to clipboard!');
  };

  const handleCommentSubmit = async () => {
    if (comment.trim()) {
      await addDoc(commentsRef(), {
        text: comment,
        user: user,
      });
      setComment('');
      fetchComments();
    }
  };

  const fetchComments = useCallback(async () => {
    const snapshot = await getDocs(commentsRef());
    const cData = snapshot.docs.map((doc) => doc.data());
    setComments(cData);
  }, [commentsRef]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const fetchData = useCallback(async () => {
    const docSnap = await getDoc(postRef());
    if (docSnap.exists()) {
      const data = docSnap.data();
      setLikes(data.likes || 0);
      setDislikes(data.dislikes || 0);
    }

    const reactionSnap = await getDoc(reactionsRef());
    if (reactionSnap.exists()) {
      setReaction(reactionSnap.data().type);
    }
  }, [postRef, reactionsRef]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formattedDate = post.createdAt
    ? formatDistanceToNow(new Date(post.createdAt.seconds * 1000), { addSuffix: true })
    : 'Just now';

  return (
    <>
      <div className="post-card" id={`post-${post.id}`}>
        <div className="post-header">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            alt="profile"
            className="profile-img"
          />
          <strong>{post.username || 'Anonymous'}</strong> &nbsp;•&nbsp;
          <span className="timestamp">{formattedDate}</span>
        </div>

        {post.mediaURL && (
          post.mediaType === 'video' ? (
            <video src={post.mediaURL} controls className="post-video" />
          ) : (
            <img
              src={post.mediaURL}
              alt="Post"
              className="post-image"
              style={{ cursor: 'pointer' }}
              onClick={() => setFullscreenImage(post.mediaURL)}
            />
          )
        )}

        <p className="post-content">{post.content}</p>

        <div className="post-actions">
          <button
            className={reaction === 'like' ? 'active' : ''}
            onClick={() => handleVote('like')}
          >
            <FaThumbsUp /> {likes}
          </button>
          <button
            className={reaction === 'dislike' ? 'active' : ''}
            onClick={() => handleVote('dislike')}
          >
            <FaThumbsDown /> {dislikes}
          </button>
          <button onClick={handleShare}>
            <FaShareAlt />
          </button>
        </div>

        <div className="comment-section">
          {comments.map((c, idx) => (
            <div key={idx} className="comment">
              <strong>{c.user}:</strong> {c.text}
            </div>
          ))}

          <div className="comment-input">
            <input
              type="text"
              placeholder="Write a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit()}
            />
            <FaPaperPlane className="send-icon" onClick={handleCommentSubmit} />
          </div>
        </div>
      </div>

      {fullscreenImage && (
        <div className="image-modal" onClick={() => setFullscreenImage(null)}>
          <img src={fullscreenImage} alt="Full View" className="modal-content" />

        </div>
      )}
    </>
  );
}

export default PostCard;
