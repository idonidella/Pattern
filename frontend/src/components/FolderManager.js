import React, { useState, useEffect } from 'react';
import axios from 'axios';

function FolderManager({ username, onSelectFolder }) {
    const [folders, setFolders] = useState([]);
    const [newFolder, setNewFolder] = useState('');
    const [selectedFolder, setSelectedFolder] = useState(null);

    // Kullanıcının klasörlerini yükle
    useEffect(() => {
        axios.get(`http://localhost:5001/folders/${username}`)
            .then(response => setFolders(response.data))
            .catch(err => console.error('Klasörler yüklenemedi:', err));
    }, [username]);

    const handleCreateFolder = () => {
        if (newFolder.trim() && !folders.includes(newFolder)) {
            axios.post(`http://localhost:5001/folders/${username}`, { folderName: newFolder })
                .then(() => {
                    setFolders([...folders, newFolder]);
                    setNewFolder('');
                })
                .catch(err => alert(err.response?.data || 'Bir hata oluştu.'));
        }
    };

    const handleFolderClick = (folder) => {
        setSelectedFolder(folder);
        onSelectFolder(folder);
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <input
                type="text"
                placeholder="Yeni Klasör Adı"
                value={newFolder}
                onChange={(e) => setNewFolder(e.target.value)}
                style={{
                    width: '80%',
                    padding: '8px',
                    borderRadius: '5px',
                    border: '1px solid #ccc',
                    marginBottom: '10px',
                }}
            />
            <br />
            <button
                onClick={handleCreateFolder}
                style={{
                    backgroundColor: '#3498db',
                    color: '#fff',
                    padding: '10px 15px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginTop: '20px',
                    marginBottom: '20px',
                    fontWeight: 'bold',
                }}
            >
                Klasör Oluştur
            </button>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
                {folders.map((folder, index) => (
                    <button
                        key={index}
                        onClick={() => handleFolderClick(folder)}
                        style={{
                            backgroundColor: selectedFolder === folder ? '#ff7675' : '#6c5ce7',
                            color: '#fff',
                            padding: '12px 20px',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: '0.3s ease',
                        }}
                    >
                        {folder}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default FolderManager;
