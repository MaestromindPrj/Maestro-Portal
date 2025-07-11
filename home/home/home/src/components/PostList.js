import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

function PostList() {
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
            <h2>Posts</h2>
            {posts.map((post) => (
                <div key={post.id}>
                    <p>{post.content}</p>
                    <small>{post.createdAt.toDate && post.createdAt.toDate().toString()}</small>
                    <hr />
                </div>
            ))}
        </div>
    );
}

export default PostList;
