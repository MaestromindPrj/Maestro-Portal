import React, { useEffect, useState, useRef } from 'react';
import {
  getDoc, collection, onSnapshot, doc, updateDoc, setDoc, deleteDoc, query, orderBy
} from 'firebase/firestore';
import { db } from '../firebase';
import MainLayout from '../layout/MainLayout';
import RightSidebar from '../components/RightSidebar';
import { useNavigate, useLocation } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import './QnAPage.css';

function QnAPage() {
  const [qna, setQnA] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [newAnswers, setNewAnswers] = useState({});
  const [newReplies, setNewReplies] = useState({});
  const [showReplies, setShowReplies] = useState({});
  const [userVotes, setUserVotes] = useState({});
  const [highlightedId, setHighlightedId] = useState(null);
  const questionRefs = useRef({});
  const location = useLocation();
  const navigate = useNavigate();
  const postRef = useRef(null);

  useEffect(() => {
    const qnaQuery = query(collection(db, 'questions'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(qnaQuery, async (snapshot) => {
      const qData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQnA(qData);

      const user = 'You';
      const votes = {};
      for (const q of qData) {
        const reactionDoc = doc(collection(db, 'questions', q.id, 'reactions'), user);
        const docSnap = await getDoc(reactionDoc);
        if (docSnap.exists()) {
          votes[q.id] = docSnap.data().type;
        }
      }
      setUserVotes(votes);
    });

    if (location.state?.selectedQuestionId) {
      setHighlightedId(location.state.selectedQuestionId);
    }

    return () => unsubscribe();
  }, [location.state]);

  useEffect(() => {
    if (highlightedId && questionRefs.current[highlightedId]) {
      setTimeout(() => {
        questionRefs.current[highlightedId].scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 300);
    }
  }, [highlightedId, qna]);

  const handleAnswerChange = (qid, value) => {
    setNewAnswers(prev => ({ ...prev, [qid]: value }));
  };

  const handleReplyChange = (aid, value) => {
    setNewReplies(prev => ({ ...prev, [aid]: value }));
  };

  const addAnswer = async (qid) => {
    if (!newAnswers[qid]) return;
    const questionRef = doc(db, 'questions', qid);
    const q = qna.find(q => q.id === qid);
    const updatedAnswers = [
      ...(q.answers || []),
      {
        id: Date.now(),
        text: newAnswers[qid],
        author: 'You',
        timestamp: new Date().toISOString(),
        replies: []
      }
    ];
    await updateDoc(questionRef, { answers: updatedAnswers });
    setNewAnswers(prev => ({ ...prev, [qid]: '' }));
  };

  const addReply = async (qid, aid) => {
    if (!newReplies[aid]) return;
    const questionRef = doc(db, 'questions', qid);
    const q = qna.find(q => q.id === qid);
    const updatedAnswers = (q.answers || []).map(ans =>
      ans.id === aid
        ? {
          ...ans,
          replies: [
            ...(ans.replies || []),
            {
              id: Date.now(),
              text: newReplies[aid],
              author: 'You',
              timestamp: new Date().toISOString()
            }
          ]
        }
        : ans
    );
    await updateDoc(questionRef, { answers: updatedAnswers });
    setNewReplies(prev => ({ ...prev, [aid]: '' }));
  };

  const toggleReplies = (aid) => {
    setShowReplies(prev => ({ ...prev, [aid]: !prev[aid] }));
  };

  const formatTimeAgo = (timeString) => {
    return formatDistanceToNow(new Date(timeString), { addSuffix: true });
  };

  const handleVote = async (qid, type) => {
    const q = qna.find(q => q.id === qid);
    if (!q) return;

    const currentVote = userVotes[qid] || null;
    let likeCount = q.likes || 0;
    let dislikeCount = q.dislikes || 0;

    if (currentVote === type) {
      if (type === 'like') likeCount = Math.max(0, likeCount - 1);
      else dislikeCount = Math.max(0, dislikeCount - 1);
      setUserVotes(prev => ({ ...prev, [qid]: null }));

      const questionRef = doc(db, 'questions', qid);
      await updateDoc(questionRef, { likes: likeCount, dislikes: dislikeCount });
      await deleteDoc(doc(collection(db, 'questions', qid, 'reactions'), 'You'));
    } else {
      if (type === 'like') {
        likeCount++;
        if (currentVote === 'dislike') dislikeCount = Math.max(0, dislikeCount - 1);
      } else {
        dislikeCount++;
        if (currentVote === 'like') likeCount = Math.max(0, likeCount - 1);
      }
      setUserVotes(prev => ({ ...prev, [qid]: type }));

      const questionRef = doc(db, 'questions', qid);
      await updateDoc(questionRef, { likes: likeCount, dislikes: dislikeCount });
      await setDoc(doc(collection(db, 'questions', qid, 'reactions'), 'You'), { type });
    }
  };

  const handleShowMore = () => {
    setVisibleCount(prev => prev + 10);
  };

  return (
    <MainLayout>
      <RightSidebar />
      <div className="banner-section">
        <div className="qna-container">
          <div className="caption">
            <button onClick={() => navigate("/#posts")}>View Posts</button>
            <button onClick={() => navigate("/qna")}>M-REDDIT</button>
          </div>

          <div ref={postRef}></div>


          {qna.slice(0, visibleCount).map((q) => (
            <div
              key={q.id}
              ref={(el) => (questionRefs.current[q.id] = el)}
              className={`qna-post-card ${highlightedId === q.id ? 'highlighted-question' : ''}`}
            >
              <div className="qna-post-header">
                <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="profile" className="profile-img" />
                <strong>Anonymous</strong>&nbsp;•&nbsp;
                <span className="timestamp">
                  {q.timestamp ? formatDistanceToNow(q.timestamp.toDate(), { addSuffix: true }) : 'Just now'}
                </span>
              </div>

              <p className="qna-post-content">{q.question}</p>

              <div className="like-dislike-container">
                <button
                  className={`like-btn ${userVotes[q.id] === 'like' ? 'voted' : ''}`}
                  onClick={() => handleVote(q.id, 'like')}
                >
                  <FaThumbsUp /> {q.likes || 0}
                </button>
                <button
                  className={`dislike-btn ${userVotes[q.id] === 'dislike' ? 'voted' : ''}`}
                  onClick={() => handleVote(q.id, 'dislike')}
                >
                  <FaThumbsDown /> {q.dislikes || 0}
                </button>
              </div>

              <div className="answer-input">
                <input
                  type="text"
                  placeholder="Write an answer..."
                  value={newAnswers[q.id] || ''}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                />
                <button onClick={() => addAnswer(q.id)}>Submit</button>
              </div>

              {(q.answers || []).map((ans) => (
                <div key={ans.id} className="answer-box">
                  <div className="answer-meta">
                    <strong>{ans.author}:</strong>&nbsp;
                    <span>{ans.text}</span>&nbsp;
                    <span className="timestamp">
                      {ans.timestamp ? formatTimeAgo(ans.timestamp) : ''}
                    </span>
                  </div>

                  <div className="reply-options">
                    <span className="view-replies" onClick={() => toggleReplies(ans.id)} style={{ cursor: 'pointer' }}>
                      View replies ({(ans.replies || []).length})
                    </span>
                  </div>

                  {showReplies[ans.id] && (
                    <div className="reply-section">
                      {(ans.replies || []).map((r) => (
                        <div key={r.id} className="reply">
                          ↳ <strong>{r.author}</strong>: {r.text}
                          <span className="timestamp small-timestamp">
                            {r.timestamp ? `• ${formatTimeAgo(r.timestamp)}` : ''}
                          </span>
                        </div>
                      ))}

                      <div className="reply-input">
                        <input
                          type="text"
                          placeholder="Reply..."
                          value={newReplies[ans.id] || ''}
                          onChange={(e) => handleReplyChange(ans.id, e.target.value)}
                        />
                        <button onClick={() => addReply(q.id, ans.id)}>Send</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}

          {visibleCount < qna.length && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button
                onClick={handleShowMore}
                style={{
                  padding: '8px 20px',
                  borderRadius: '8px',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                See 10 More+
              </button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default QnAPage;
