import React, { useState } from 'react';
import axios from 'axios';

function FileUpload({ username, folderName }) {
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const handleUpload = () => {
        if (!file || !folderName || !username) {
            alert('File is missing!');
            return;
        }
        const formData = new FormData();
        formData.append('image', file);
        axios
            .post(`http://localhost:5001/upload/${username}/${folderName}`, formData)
            .then(() => {
                alert('File uploaded successfully.');
                window.location.reload();
            })
            .catch((err) => {
                console.error('An error occurred while uploading the file.', err);
                alert('An error occurred, the file could not be loaded.');
            });
    };


    return (
        <div style={{ textAlign: 'center', padding: '20px', borderRadius: '8px' }}>
            <h2 style={{ marginBottom: '10px' }}>
                <span style={{ fontWeight: 'normal' }}>Upload File</span>
            </h2>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <br />
            {previewUrl && (
                <div style={{ marginTop: '20px' }}>
                    <p style={{ marginBottom: '5px' }}>Selected File:</p>
                    <img
                        src={previewUrl}
                        alt="Preview"
                        style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '5px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
                    />
                </div>
            )}
            <button
                onClick={handleUpload}
                style={{
                    marginTop: '20px',
                    backgroundColor: '#3498db',
                    color: '#fff',
                    padding: '10px 15px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                }}
            >
                Download as PDF
            </button>
        </div>
    );
}

export default FileUpload;
