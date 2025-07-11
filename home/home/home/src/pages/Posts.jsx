import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

function Posts() {
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    const querySnapshot = await getDocs(collection(db, "posts"));
    const postsData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    setPosts(postsData);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div>
      <h2>Recent Posts</h2>
      {posts.map((post) => (
        <div key={post.id}>
          <p>{post.content}</p>
          <small>
            {post.createdAt && post.createdAt.toDate().toString()}
          </small>
          <hr />
        </div>
      ))}
    </div>
  );
}

export default Posts;
