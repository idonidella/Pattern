import React, { useState } from 'react';
import axios from 'axios';

function App() {
    const [file, setFile] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
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
                responseType: 'blob', // PDF dosyasını blob olarak al
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
        <div>
            <h1>OCR PDF Uygulaması</h1>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload}>Yükle ve PDF İndir</button>
        </div>
    );
}

export default App;
