import React, { useEffect, useState } from 'react';
import MainLayout from '../layout/MainLayout';
import RightSidebar from '../components/RightSidebar';
import PostCard from '../components/PostCard';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import { db } from '../firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { FaSearch } from 'react-icons/fa';

function Home() {


  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();


  // New search & visible count states
  const [searchText, setSearchText] = useState('');
  const [visibleCount, setVisibleCount] = useState(10);

  const fetchPosts = async () => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const postsData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setPosts(postsData);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  const filteredPosts = posts.filter((post) =>
    post.content?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <MainLayout>
      <RightSidebar />
      <div className="banner-section">
        <div className="caption">
          <button onClick={() => navigate('/#posts')}>View Posts</button>
          <button onClick={() => navigate('/qna')}>M-REDDIT</button>
        </div>
      </div>

      {/* Search Box */}
      <div className="search-box-container">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search posts..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="search-box"
        />
      </div>

      {/* Filtered posts with pagination */}
      {filteredPosts.slice(0, visibleCount).map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {visibleCount < filteredPosts.length && (
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


    </MainLayout>
  );
}

export default Home;
