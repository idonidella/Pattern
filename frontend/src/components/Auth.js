import React, { useState } from 'react';

function Auth({ onAuthSuccess }) {
    const [isSignUp, setIsSignUp] = useState(false);
    const [username, setUsername] = useState('');

    const handleSubmit = () => {
        if (!username) {
            alert('Please enter a username.');
            return;
        }
        const basePath = '/model/index.html'; // Yeni public/model yoluna yönlendirme
        window.location.href = `${basePath}?username=${encodeURIComponent(username)}&signup=${isSignUp}`;
    };

    const handleToggle = () => {
        setIsSignUp(!isSignUp);
        setUsername('');
    };

    return (
        <div style={{ marginTop: '50px', textAlign: 'center' }}>
            <h1>{isSignUp ? 'Register' : 'Login'}</h1>
            <div style={{ width: '100%', maxWidth: '400px', margin: 'auto' }}>
                <input
                    style={{ width: "100%", height: 10 }}
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>
            <button
                onClick={handleSubmit}
                style={{
                    marginTop: '10px',
                    backgroundColor: '#3498db',
                    color: '#fff',
                    padding: '10px 15px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                }}
            >
                Continue
            </button>

            {!isSignUp ? (
                <p style={{ cursor: 'pointer', marginTop: '10px', fontSize: '0.9rem' }}>
                    Don't have an account?{' '}
                    <span onClick={handleToggle} style={{ color: '#5ca2dc', fontWeight: 'bold' }}>Sign Up</span>
                </p>
            ) : (
                <p style={{ cursor: 'pointer', marginTop: '10px', fontSize: '0.9rem' }}>
                    Already have an account?{' '}
                    <span onClick={handleToggle} style={{ color: '#5ca2dc', fontWeight: 'bold' }}>Login</span>
                </p>
            )}
        </div>
    );
}

export default Auth;
