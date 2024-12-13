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
            if (!isSignUp) onAuthSuccess(username);
        } catch (err) {
            alert(err.response?.data || 'Bir hata oluştu.');
        }
    };

    const handleToggle = () => {
        setIsSignUp(!isSignUp);
        setUsername('');
        setPassword('');
    };

    return (
        <div style={{ marginTop: '50px', textAlign: 'center' }}>
            <h1>{isSignUp ? 'Kayıt Ol' : 'Giriş Yap'}</h1>
            <div style={{ width: '100%', maxWidth: '400px', margin: 'auto' }}>
                <input
                    style={{ width: "100%", height: 32 }}
                    type="text2"
                    placeholder="Kullanıcı Adı"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    style={{ width: "100%", height: 32 }}
                    type="password"
                    placeholder="Şifre"
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
                {isSignUp ? 'Kayıt Ol' : 'Giriş Yap'}
            </button>

            {/* Koşula bağlı metin */}
            {!isSignUp ? (
                <p style={{ cursor: 'pointer', marginTop: '10px', fontSize: '0.9rem' }}>
                    Hesabın yok mu?{' '}
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
                    Zaten hesabın var mı?{' '}
                    <span
                        onClick={handleToggle}
                        style={{
                            color: '#5ca2dc',
                            fontWeight: 'bold',
                        }}
                    >
                        Giriş Yap
                    </span>
                </p>
            )}
        </div>
    );
}

export default Auth;


