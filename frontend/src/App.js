import React, { useState } from 'react';
import Auth from './components/Auth';
import FolderManager from './components/FolderManager';
import FileUpload from './components/FileUpload';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles.css';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState(null);

    const handleAuthSuccess = () => {
        setIsAuthenticated(true);
        toast.success('Giriş başarılı!', {
            position: 'top-right',
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
    };

    

    return (
        <div className="container">
            <ToastContainer /> 
            {!isAuthenticated ? (
                <Auth onAuthSuccess={handleAuthSuccess} />
            ) : (
                <>
                    <h1>Klasör Yönetimi</h1>
                    <FolderManager onSelectFolder={setSelectedFolder} />
                    {selectedFolder && (
                        <div className="file-upload">
                            <FileUpload folderName={selectedFolder} />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default App;
