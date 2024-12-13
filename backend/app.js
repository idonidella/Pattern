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

// Kullanıcı kayıt (Sign Up) endpoint'i
app.post('/signup', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).send('Kullanıcı adı ve şifre gereklidir.');

    const userData = `${username}:${password}\n`;

    fs.appendFile(USERS_FILE, userData, (err) => {
        if (err) return res.status(500).send('Sunucu hatası: Kullanıcı kaydedilemedi.');
        res.status(200).send('Kayıt başarılı.');
    });
});

// Kullanıcı giriş (Sign In) endpoint'i
app.post('/signin', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).send('Kullanıcı adı ve şifre gereklidir.');

    fs.readFile(USERS_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Sunucu hatası.');

        const users = data.split('\n');
        const isValidUser = users.some((line) => line === `${username}:${password}`);

        if (isValidUser) res.status(200).json({ message: 'Giriş başarılı.', username });
        else res.status(401).send('Kullanıcı adı veya şifre hatalı.');
    });
});

// Kullanıcının klasörlerini yükleme endpoint'i
app.get('/folders/:username', (req, res) => {
    const username = req.params.username;
    const userFolderFile = path.join(USER_DATA_DIR, `${username}_folders.txt`);

    if (fs.existsSync(userFolderFile)) {
        const folders = fs.readFileSync(userFolderFile, 'utf8');
        res.json(JSON.parse(folders));
    } else {
        res.json([]); // Yeni kullanıcı için boş liste
    }
});

// Kullanıcının klasör oluşturma endpoint'i
app.post('/folders/:username', (req, res) => {
    const username = req.params.username;
    const { folderName } = req.body;

    if (!folderName) return res.status(400).send('Klasör ismi gereklidir.');

    const userFolderFile = path.join(USER_DATA_DIR, `${username}_folders.txt`);

    let folders = [];
    if (fs.existsSync(userFolderFile)) {
        folders = JSON.parse(fs.readFileSync(userFolderFile, 'utf8'));
    }

    if (!folders.includes(folderName)) {
        folders.push(folderName);
        fs.writeFileSync(userFolderFile, JSON.stringify(folders, null, 2));
        res.status(200).send('Klasör oluşturuldu.');
    } else {
        res.status(400).send('Bu isimde bir klasör zaten mevcut.');
    }
});

// Dosya yükleme ayarları
const upload = multer({ dest: 'upload/' });
const client = new ImageAnnotatorClient();

// Görseli OCR ile metne çevirip PDF oluşturma endpoint'i
app.post('/upload/:folderName', upload.single('image'), async (req, res) => {
    const folderName = req.params.folderName;

    try {
        if (!req.file) return res.status(400).send('Dosya yüklenmedi.');

        const filePath = req.file.path;

        // OCR işlemi
        const [result] = await client.textDetection(filePath);
        const detections = result.textAnnotations;

        if (!detections || detections.length === 0) {
            fs.unlinkSync(filePath); // Dosyayı sil
            return res.status(400).send('Metin bulunamadı.');
        }

        const textContent = detections[0].description;

        // PDF oluşturma
        const folderPath = path.join(__dirname, 'upload', folderName);
        if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath);

        const pdfPath = path.join(folderPath, `${Date.now()}.pdf`);
        const pdfDoc = new PDFDocument();
        const writeStream = fs.createWriteStream(pdfPath);

        pdfDoc.pipe(writeStream);
        pdfDoc.fontSize(12).text(textContent, 100, 100);
        pdfDoc.end();

        writeStream.on('finish', () => {
            res.download(pdfPath, 'output.pdf', () => {
                fs.unlinkSync(filePath); // Geçici dosyayı sil
            });
        });
    } catch (err) {
        console.error('Hata:', err);
        res.status(500).send('Sunucu hatası.');
    }
});

// Sunucu başlatma
app.listen(port, () => {
    console.log(`Sunucu http://localhost:${port} adresinde çalışıyor.`);
});
