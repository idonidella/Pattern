import React, { useState } from 'react';
import axios from 'axios';

function FileUpload({ folderName }) {
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile)); 
        }
    };

    // Dosyayı yükle ve PDF oluştur
    const handleUpload = async () => {
        if (!file) {
            alert('Lütfen bir dosya seçin.');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await axios.post(`http://localhost:5001/upload/${folderName}`, formData, {
                responseType: 'blob',
            });

            // PDF dosyasını indirmek için oluşturulan bağlantı
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'output.pdf');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            alert('Bir hata oluştu. Dosya yüklenemedi.');
            console.error(error);
        }
    };

    return (
        <div style={{ textAlign: 'center', padding: '20px', borderRadius: '8px' }}>
            <h2 style={{ marginBottom: '10px' }}>
                {folderName} - <span style={{ fontWeight: 'normal' }}>Dosya Yükle</span>
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
