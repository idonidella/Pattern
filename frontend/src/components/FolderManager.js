import React, { useState, useEffect } from 'react';
import axios from 'axios';

function FolderManager({ username, onSelectFolder }) {
    const [folders, setFolders] = useState([]);
    const [newFolder, setNewFolder] = useState('');
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [files, setFiles] = useState([]);


    useEffect(() => {
        setSelectedFolder(null);
        setFiles([]);
        onSelectFolder(null);
        axios
            .get(`http://localhost:5001/folders/${username}`)
            .then((response) => setFolders(response.data))
            .catch((err) => console.error('Could not upload the file:', err));
    }, [username]);

    const handleCreateFolder = () => {
        if (newFolder.trim() && !folders.includes(newFolder)) {
            axios
                .post(`http://localhost:5001/folders/${username}`, { folderName: newFolder })
                .then(() => {
                    setFolders([...folders, newFolder]);
                    setNewFolder('');
                })
                .catch((err) => alert(err.response?.data || 'An error occured'));
        }
    };

    const handleFolderClick = (folder) => {
        setSelectedFolder(folder);
        onSelectFolder(folder);
        axios
            .get(`http://localhost:5001/list-files/${username}/${folder}`)
            .then((response) => setFiles(response.data))
            .catch((err) => {
                console.error('Could not upload the file:', err);
                setFiles([]);
            });
    };

    return (
        <div>
            <input
                type="text"
                placeholder="New Folder Name"
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
                Create Folder
            </button>

            {/* Klasör Listesi */}
            <div style={{ marginTop: '20px' }}>
                {folders.map((folder, index) => {
                    const formattedFolderName = folder.charAt(0).toUpperCase() + folder.slice(1);
                    return (
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
                            {formattedFolderName}
                        </button>
                    );
                })}
            </div>
            {selectedFolder && (
                <div style={{ marginTop: '20px' }}>
                    <h3 style={{ marginBottom: '10px' }}>
                        {selectedFolder.charAt(0).toUpperCase() + selectedFolder.slice(1)} Files - PDF Files
                    </h3>
                    <ul style={{ listStyleType: 'none', padding: 0 }}>
                        {files.length > 0 ? (
                            files.map((file, index) => {
                                const displayName = file.name.split('-').slice(0, 3).join('-') + '-' + file.name.split('-').slice(3, 5).join('-') + '.pdf';
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
                                            → {displayName}
                                        </a>
                                    </li>
                                );
                            })
                        ) : (
                            <li>There's no file in this folder.</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default FolderManager;
