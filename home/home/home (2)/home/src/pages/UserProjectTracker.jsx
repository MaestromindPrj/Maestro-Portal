import React from 'react';

const UserProjectTracker = () => {
    return (
        <div style={{ padding: '20px' }}>
            <iframe
                src="/user.html"
                title="User Tracker"
                style={{
                    width: '100%',
                    height: '100vh',
                    border: 'none',
                    borderRadius: '8px'
                }}
            />
        </div>
    );
};

export default UserProjectTracker;
