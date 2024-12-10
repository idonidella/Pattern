import React, { useState } from 'react';
import axios from 'axios'; 


function App() {
    const [file, setFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);

        // Görsel önizlemesi
        if (selectedFile) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setPreviewImage(event.target.result);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            alert("Lütfen bir dosya seçin!");
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await axios.post('http://localhost:5001/upload', formData, {
                responseType: 'blob',
            });

            // PDF dosyasını indir
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'output.pdf');
            document.body.appendChild(link);
            link.click();
        } catch (err) {
            console.error("Hata:", err);
            alert("Dosya yüklenirken bir hata oluştu.");
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>OCR PDF Uygulaması</h1>
            <div style={styles.content}>
                <input type="file" accept="image/*" onChange={handleFileChange} style={styles.fileInput} />
                {previewImage && (
                    <img src={previewImage} alt="Önizleme" style={styles.preview} />
                )}
                <button onClick={handleUpload} style={styles.button}>Yükle ve PDF İndir</button>
            </div>
        </div>
    );
}

const styles = {
    
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#66785F',
        color: '#333',
        margin: 0,
    },
    title: {
        marginBottom: '20px',
        color: '#fff',
        fontSize: '28px',
    },
    content: {
        backgroundColor: '#F5F5DC',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '400px',
    },
    fileInput: {
        marginBottom: '20px',
    },
    button: {
        marginTop: '20px',
        padding: '10px 20px',
        backgroundColor: '#007BFF',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        fontSize: '16px',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    },
    buttonHover: {
        backgroundColor: '#0056b3',
    },
    preview: {
        maxWidth: '100%',
        maxHeight: '200px',
        marginTop: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
    },
};

export default App;
