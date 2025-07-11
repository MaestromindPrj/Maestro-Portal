import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaQuestionCircle } from 'react-icons/fa';
import './RightSidebar.css';

function RightSidebar() {
  const [topQuestions, setTopQuestions] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const selectedId = location.state?.selectedQuestionId || null;

  useEffect(() => {
    // Query ordered by 'likes' in descending order
    const q = query(collection(db, 'questions'), orderBy('likes', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const questions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setTopQuestions(questions.slice(0, 10)); // Show only top 10 by likes
    });

    return () => unsub();
  }, []);

  const handleAskClick = () => {
    navigate('/ask-question');
  };

  const handleQuestionClick = (questionId) => {
    navigate('/qna', {
      state: { selectedQuestionId: questionId }
    });
  };

  return (
    <div className="right-sidebar">
      <div className="ask-header">
        <h3 className="ask-title">Top Questions</h3>
        <FaQuestionCircle
          className="ask-icon"
          onClick={handleAskClick}
          title="Ask a Question"
        />
      </div>

      <ul className="question-list">
        {topQuestions.map((q) => (
          <li key={q.id} className="question-item">
            <button
              className={`question-link ${selectedId === q.id ? 'selected' : ''}`}
              onClick={() => handleQuestionClick(q.id)}
            >
              {q.question}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RightSidebar;
