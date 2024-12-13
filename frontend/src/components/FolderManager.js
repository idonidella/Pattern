import React, { useState, useEffect } from 'react';
import axios from 'axios';

function FolderManager({ username, onSelectFolder }) {
    const [folders, setFolders] = useState([]); 
    const [newFolder, setNewFolder] = useState(''); 
    const [selectedFolder, setSelectedFolder] = useState(null); // Seçilen klasör
    const [files, setFiles] = useState([]); // Klasördeki PDF dosyaları

    // Kullanıcının klasörlerini yükle
    useEffect(() => {
        axios
            .get(`http://localhost:5001/folders/${username}`)
            .then((response) => setFolders(response.data))
            .catch((err) => console.error('Klasörler yüklenemedi:', err));
    }, [username]);

    // Yeni klasör oluştur
    const handleCreateFolder = () => {
        if (newFolder.trim() && !folders.includes(newFolder)) {
            axios
                .post(`http://localhost:5001/folders/${username}`, { folderName: newFolder })
                .then(() => {
                    setFolders([...folders, newFolder]);
                    setNewFolder('');
                })
                .catch((err) => alert(err.response?.data || 'Bir hata oluştu.'));
        }
    };

    // Klasöre tıklandığında PDF dosyalarını yükle
    const handleFolderClick = (folder) => {
        setSelectedFolder(folder);
        onSelectFolder(folder);

        axios
            .get(`http://localhost:5001/list-files/${folder}`)
            .then((response) => setFiles(response.data))
            .catch((err) => {
                console.error('Dosyalar yüklenemedi:', err);
                setFiles([]);
            });
    };

    return (
        <div>
            {/* Yeni Klasör Oluşturma */}
            <input
                type="text"
                placeholder="Yeni Klasör Adı"
                value={newFolder}
                onChange={(e) => setNewFolder(e.target.value)}
                style={{
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #ccc',
                    marginRight: '10px',
                }}
            />
            <button
                onClick={handleCreateFolder}
                style={{
                    padding: '10px 15px',
                    borderRadius: '6px',
                    backgroundColor: '#3498db',
                    color: '#fff',
                    fontWeight: 'bold',
                    border: 'none',
                    cursor: 'pointer',
                    marginTop: '20px',
                }}
            >
                Klasör Oluştur
            </button>

            {/* Klasör Listesi */}
            <div style={{ marginTop: '20px' }}>
                {folders.map((folder, index) => (
                    <button
                        key={index}
                        onClick={() => handleFolderClick(folder)}
                        style={{
                            margin: '10px',
                            padding: '10px 15px',
                            borderRadius: '6px',
                            backgroundColor: selectedFolder === folder ? '#ff7675' : '#6c5ce7',
                            color: '#fff',
                            fontWeight: 'bold',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        {folder}
                    </button>
                ))}
            </div>

            {/* Seçilen Klasördeki PDF Dosyaları */}
            {selectedFolder && (
                <div style={{ marginTop: '20px' }}>
                    <h3 style={{ marginBottom: '10px' }}>
                        {selectedFolder} Klasörü - PDF Dosyaları
                    </h3>
                    <ul style={{ listStyleType: 'none', padding: 0 }}>
                        {files.length > 0 ? (
                            files.map((file, index) => {
                                // Dosya ismini parçala ve sadece tarih kısmını al
                                const displayName = file.name.split('_')[0] + '.pdf';
                                return (
                                    <li key={index} style={{ margin: '10px 0' }}>
                                        <a
                                            href={file.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                textDecoration: 'none',
                                                color: '#3498db',
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            → {displayName} {/* Görünür isim: tarih + uzantı */}
                                        </a>
                                    </li>
                                );
                            })
                        ) : (
                            <li>Bu klasörde henüz dosya yok.</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default FolderManager;
