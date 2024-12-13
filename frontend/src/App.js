import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import FolderManager from './components/FolderManager';
import FileUpload from './components/FileUpload';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles.css';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState('');
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [showProfile, setShowProfile] = useState(false);


    useEffect(() => {
        const savedUser = localStorage.getItem('username');
        if (savedUser) {
            setUsername(savedUser);
            setIsAuthenticated(true);
        }
    }, []);

    const handleAuthSuccess = (user) => {
        setUsername(user);
        setIsAuthenticated(true);
        localStorage.setItem('username', user);
        toast.success('Giriş başarılı!', {
            position: 'top-right',
            autoClose: 3000,
        });
    };

    const handleLogout = () => {
        localStorage.removeItem('username');
        setIsAuthenticated(false);
        setUsername('');
        setShowProfile(false);
        toast.info('Çıkış yapıldı.', {
            position: 'top-right',
            autoClose: 3000,
        });
    };

    return (
        <div className="container">
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            {isAuthenticated ? (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h1 style={{ marginLeft: 80 }}>Klasör Yönetimi</h1>
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setShowProfile(!showProfile)}
                                className="profile-button"
                            >
                                Profil
                            </button>
                            {showProfile && (
                                <div className="profile-dropdown">
                                    <p>Kullanıcı: {username}</p>
                                    <button onClick={handleLogout} className="logout-button">
                                        Çıkış Yap
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <FolderManager username={username} onSelectFolder={setSelectedFolder} />
                    {selectedFolder && (
                        <div className="file-upload">
                            <FileUpload folderName={selectedFolder} />
                        </div>
                    )}
                </>
            ) : (
                <Auth onAuthSuccess={handleAuthSuccess} />
            )}
        </div>
    );
}

export default App;
