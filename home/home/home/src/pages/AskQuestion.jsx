import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import MainLayout from '../layout/MainLayout';
import './AskQuestion.css';

function AskQuestion() {
  const [question, setQuestion] = useState('');
  const [posted, setPosted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, 'questions'), {
        question,
        timestamp: serverTimestamp(),
        answers: [],
      });

      setQuestion('');
      setPosted(true);
    } catch (error) {
      console.error('Error adding question: ', error);
    }
  };

  const handleClose = () => {
    navigate('/qna');
  };

  return (
    <MainLayout>
      <div className="ask-question-container">
        <div className="ask-header">
          <h3>Add a New Question</h3>
          <button className="ask-close-btn" onClick={handleClose}>✖</button>
        </div>


        <form onSubmit={handleSubmit}>
          <textarea
            placeholder="Type your question here..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
          />
          <div className="form-buttons">
            <button type="submit">Submit</button>
          </div>
          {posted && (
            <p style={{ color: 'green' }}>
              ✅ Question posted! Check QnA page to view.
            </p>
          )}
        </form>
      </div>
    </MainLayout>
  );
}

export default AskQuestion;