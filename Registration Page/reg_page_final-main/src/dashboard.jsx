import React, { useEffect, useState } from 'react';
import { auth, db } from './firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [role, setRole] = useState(''); // "intern" or "employee"
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        navigate('/'); // Redirect to login if not authenticated
        return;
      }

      const uid = currentUser.uid;

      try {
        // Try fetching from interns collection first
        const internDoc = await getDoc(doc(db, 'interns', uid));
        if (internDoc.exists()) {
          setUserData(internDoc.data());
          setRole('Intern');
        } else {
          // Else try employees
          const employeeDoc = await getDoc(doc(db, 'employees', uid));
          if (employeeDoc.exists()) {
            setUserData(employeeDoc.data());
            setRole('Employee');
          } else {
            setUserData(null);
            setRole('');
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }

      setLoading(false);
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  if (loading) return <p>Loading...</p>;

  if (!userData) return <p>User data not found</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Welcome, {userData.name} 🎉</h2>
      <p><strong>Role:</strong> {role}</p>
      <p><strong>Email:</strong> {userData.email}</p>
      <p><strong>Mobile:</strong> {userData.mobile}</p>

      {role === 'Intern' && (
        <>
          <p><strong>College:</strong> {userData.college}</p>
          <p><strong>Year of Study:</strong> {userData.year}</p>
        </>
      )}

      {role === 'Employee' && (
        <>
          <p><strong>Age:</strong> {userData.age}</p>
        </>
      )}

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
