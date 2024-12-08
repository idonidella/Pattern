const express = require('express');
const cors = require('cors');
const multer = require('multer');
const PDFDocument = require('pdfkit');
const { ImageAnnotatorClient } = require('@google-cloud/vision');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;

// CORS middleware ekleme
app.use(cors());

// Dosya yükleme yapılandırması
const upload = multer({ dest: 'upload/' });

// Google Vision API istemcisi
const client = new ImageAnnotatorClient();

app.post('/upload', upload.single('image'), async (req, res) => {
    try {
        // Dosya kontrolü
        if (!req.file) {
            return res.status(400).send('Dosya yüklenmedi.');
        }

        const filePath = req.file.path;

        // Vision API ile OCR işlemi
        const [result] = await client.textDetection(filePath);
        const detections = result.textAnnotations;

        if (!detections || !detections.length) {
            fs.unlinkSync(filePath); // Yüklenen resmi sil
            return res.status(400).send('Metin bulunamadı.');
        }

        const textContent = detections[0].description;

        // PDF oluşturma
        const pdfPath = path.join(__dirname, 'output.pdf');
        const pdfDoc = new PDFDocument();
        const writeStream = fs.createWriteStream(pdfPath);

        pdfDoc.pipe(writeStream);
        pdfDoc.fontSize(12).text(textContent, 100, 100);
        pdfDoc.end();

        // PDF oluşturma tamamlandığında kullanıcıya gönder
        writeStream.on('finish', () => {
            res.download(pdfPath, 'output.pdf', (err) => {
                if (err) {
                    console.error('PDF gönderim hatası:', err);
                }
                // Temizlik işlemi
                fs.unlinkSync(filePath); // Yüklenen resmi sil
                fs.unlinkSync(pdfPath);  // Oluşturulan PDF'yi sil
            });
        });
    } catch (err) {
        console.error('Hata:', err);
        res.status(500).send('Sunucu hatası');
    }
});

app.listen(port, () => {
    console.log(`Sunucu http://localhost:${port} adresinde çalışıyor.`);
});
