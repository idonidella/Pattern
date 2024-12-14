const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const PDFDocument = require('pdfkit');
const { ImageAnnotatorClient } = require('@google-cloud/vision');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;
app.use(cors());
app.use(express.json());

// Kullanıcı dosyalarını saklamak için ana klasör
const USER_DATA_DIR = path.join(__dirname, 'user_data');

// Eğer user_data klasörü yoksa oluştur
if (!fs.existsSync(USER_DATA_DIR)) {
    fs.mkdirSync(USER_DATA_DIR);
}

// Kullanıcı verilerini tutan dosya
const USERS_FILE = path.join(__dirname, 'users.txt');

app.post('/signin', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).send('Username and password required.');

    fs.readFile(USERS_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Server error.');
        const users = data.split('\n');
        const isValidUser = users.some((line) => line === `${username}:${password}`);
        if (isValidUser) res.status(200).json({ message: 'Login successful.', username });
        else res.status(401).send('Username and password is incorrect.');
    });
});

app.post('/signup', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).send('Username and password required.');

    const userData = `${username}:${password}\n`;

    fs.appendFile(USERS_FILE, userData, (err) => {
        if (err) return res.status(500).send('Server error. User could not be registered.');
        res.status(200).json({ message: 'Signup successful.' });
    });
});


app.get('/folders/:username', (req, res) => {
    const { username } = req.params;
    const userFolderPath = path.join(USER_DATA_DIR, username);

    if (!fs.existsSync(userFolderPath)) return res.json([]); // Boş liste dön
    const folders = fs.readdirSync(userFolderPath).filter((folder) =>
        fs.statSync(path.join(userFolderPath, folder)).isDirectory()
    );

    res.status(200).json(folders);
});


// Kullanıcının klasör oluşturma endpoint'i
app.post('/folders/:username', (req, res) => {
    const { username } = req.params;
    const { folderName } = req.body;

    const userFolderPath = path.join(USER_DATA_DIR, username); // Kullanıcı ana klasörü
    const newFolderPath = path.join(userFolderPath, folderName);

    if (!fs.existsSync(userFolderPath)) fs.mkdirSync(userFolderPath, { recursive: true });
    if (fs.existsSync(newFolderPath)) return res.status(400).send('This folder already exists.');

    fs.mkdirSync(newFolderPath);
    res.status(200).send('Folder created successfully.');
});


// Dosya yükleme ayarları
const upload = multer({ dest: 'upload/' });
const client = new ImageAnnotatorClient();

app.post('/upload/:username/:folderName', upload.single('image'), async (req, res) => {
    const { username, folderName } = req.params;

    try {
        if (!req.file) return res.status(400).send('Folder could not be loaded.');

        const filePath = req.file.path;

        // Kullanıcıya özel klasör yolu
        const userFolderPath = path.join(USER_DATA_DIR, username, folderName);
        if (!fs.existsSync(userFolderPath)) fs.mkdirSync(userFolderPath, { recursive: true });

        // OCR işlemi
        const [result] = await client.textDetection(filePath);
        const detections = result.textAnnotations;

        if (!detections || detections.length === 0) {
            fs.unlinkSync(filePath); // Dosyayı sil
            return res.status(400).send('Text could not be found.');
        }

        const textContent = detections[0].description; // OCR ile algılanan metin

        // Tarih formatını ve saat-dakika-saniye ekleyerek benzersiz dosya adı oluştur
        const now = new Date();
        const formattedDate = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()}`;
        const formattedTime = `${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}`;
        const fileName = `${formattedDate}-${formattedTime}.pdf`;

        // PDF oluşturma
        const pdfPath = path.join(userFolderPath, fileName);
        const pdfDoc = new PDFDocument();
        const writeStream = fs.createWriteStream(pdfPath);

        pdfDoc.pipe(writeStream);
        pdfDoc.fontSize(12).text(textContent, 100, 100); // OCR'dan gelen metni PDF'e ekle
        pdfDoc.end();

        writeStream.on('finish', () => {
            fs.unlinkSync(filePath); // Geçici dosyayı sil
            // Dosyayı doğrudan indirmek için
            res.download(pdfPath, fileName, (err) => {
                if (err) {
                    console.error('Download Error:', err);
                    res.status(500).send('File download failed.');
                }
            });
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Server error.');
    }
});




app.get('/list-files/:username/:folderName', (req, res) => {
    const { username, folderName } = req.params;
    const folderPath = path.join(USER_DATA_DIR, username, folderName);

    if (fs.existsSync(folderPath)) {
        const files = fs.readdirSync(folderPath).map((file) => ({
            name: file,
            url: `http://localhost:5001/user_data/${username}/${folderName}/${file}`,
        }));
        res.status(200).json(files);
    } else {
        res.status(404).send('File could not be found.');
    }
});

// Statik dosya servisi: user_data klasörünü tarayıcıdan erişilebilir hale getir
app.use('/user_data', express.static(path.join(__dirname, 'user_data')));



// Sunucu başlatma
app.listen(port, () => {
    console.log(`Server works on http://localhost:${port}`);
});
