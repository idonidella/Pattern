import React, { useState } from 'react';
import axios from 'axios';

function Auth({ onAuthSuccess }) {
    const [isSignUp, setIsSignUp] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async () => {
        const url = isSignUp ? 'http://localhost:5001/signup' : 'http://localhost:5001/signin';
        try {
            await axios.post(url, { username, password });
            if (isSignUp) {
                alert('Registration successful. Please log in.');
                window.location.href = '/signin'; 
            } else {
                onAuthSuccess(username);
            }
        } catch (err) {
            alert(err.response?.data || 'An error has occured.');
        }
    };

    const handleToggle = () => {
        setIsSignUp(!isSignUp);
        setUsername('');
        setPassword('');
    };

    return (
        <div style={{ marginTop: '50px', textAlign: 'center' }}>
            <h1>{isSignUp ? 'Register' : 'Login'}</h1>
            <div style={{ width: '100%', maxWidth: '400px', margin: 'auto' }}>
                <input
                    style={{ width: "100%", height: 32 }}
                    type="text2"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    style={{ width: "100%", height: 32 }}
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                {isSignUp ? 'Register' : 'Login'}
            </button>

            {/* Koşula bağlı metin */}
            {!isSignUp ? (
                <p style={{ cursor: 'pointer', marginTop: '10px', fontSize: '0.9rem' }}>
                    You don't have an account?{' '}
                    <span
                        onClick={handleToggle}
                        style={{
                            color: '#5ca2dc',
                            fontWeight: 'bold',
                        }}
                    >
                        Kayıt Ol
                    </span>
                </p>
            ) : (
                <p style={{ cursor: 'pointer', marginTop: '10px', fontSize: '0.9rem' }}>
                    You already have an account??{' '}
                    <span
                        onClick={handleToggle}
                        style={{
                            color: '#5ca2dc',
                            fontWeight: 'bold',
                        }}
                    >
                        Login
                    </span>
                </p>
            )}
        </div>
    );
}

export default Auth;


