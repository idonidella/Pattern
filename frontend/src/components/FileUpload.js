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
            alert('Dosya, kullanıcı veya klasör adı eksik!');
            return;
        }
        const formData = new FormData();
        formData.append('image', file);
        axios
            .post(`http://localhost:5001/upload/${username}/${folderName}`, formData)
            .then(() => {
                alert('Dosya başarıyla yüklendi.');
                window.location.reload();
            })
            .catch((err) => {
                console.error('Dosya yüklenirken hata oluştu:', err);
                alert('Bir hata oluştu. Dosya yüklenemedi.');
            });
    };


    return (
        <div style={{ textAlign: 'center', padding: '20px', borderRadius: '8px' }}>
            <h2 style={{ marginBottom: '10px' }}>
                <span style={{ fontWeight: 'normal' }}>Dosya Yükle</span>
            </h2>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <br />
            {previewUrl && (
                <div style={{ marginTop: '20px' }}>
                    <p style={{ marginBottom: '5px' }}>Seçilen Görsel:</p>
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
                Yükle ve PDF İndir
            </button>
        </div>
    );
}

export default FileUpload;
