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
    if (!username || !password) return res.status(400).send('Kullanıcı adı ve şifre gereklidir.');

    fs.readFile(USERS_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Sunucu hatası.');
        const users = data.split('\n');
        const isValidUser = users.some((line) => line === `${username}:${password}`);
        if (isValidUser) res.status(200).json({ message: 'Giriş başarılı.', username });
        else res.status(401).send('Kullanıcı adı veya şifre hatalı.');
    });
});

app.post('/signup', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).send('Kullanıcı adı ve şifre gereklidir.');

    const userData = `${username}:${password}\n`;

    fs.appendFile(USERS_FILE, userData, (err) => {
        if (err) return res.status(500).send('Sunucu hatası: Kullanıcı kaydedilemedi.');
        res.status(200).send('Kayıt başarılı.');
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
    if (fs.existsSync(newFolderPath)) return res.status(400).send('Bu klasör zaten mevcut.');

    fs.mkdirSync(newFolderPath);
    res.status(200).send('Klasör başarıyla oluşturuldu.');
});


// Dosya yükleme ayarları
const upload = multer({ dest: 'upload/' });
const client = new ImageAnnotatorClient();

app.post('/upload/:username/:folderName', upload.single('image'), async (req, res) => {
    const { username, folderName } = req.params;

    try {
        if (!req.file) return res.status(400).send('Dosya yüklenmedi.');

        const filePath = req.file.path;

        // Kullanıcıya özel klasör yolu
        const userFolderPath = path.join(USER_DATA_DIR, username, folderName);
        if (!fs.existsSync(userFolderPath)) fs.mkdirSync(userFolderPath, { recursive: true });

        // OCR işlemi
        const [result] = await client.textDetection(filePath);
        const detections = result.textAnnotations;

        if (!detections || detections.length === 0) {
            fs.unlinkSync(filePath); // Dosyayı sil
            return res.status(400).send('Metin bulunamadı.');
        }

        const textContent = detections[0].description; // OCR ile algılanan metin

        // Tarih formatını ve saat-dakika-saniye ekleyerek benzersiz dosya adı oluştur
        const now = new Date();
        const formattedDate = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1)
            .toString()
            .padStart(2, '0')}-${now.getFullYear()}`;
        const formattedTime = `${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}`;
        // Dosya adını tarih + saat-dakika formatında oluştur
        const fileName = `${formattedDate}-${formattedTime}.pdf`;

        // PDF oluşturma
        const pdfPath = path.join(userFolderPath, fileName);
        const pdfDoc = new PDFDocument();
        const writeStream = fs.createWriteStream(pdfPath);

        pdfDoc.pipe(writeStream);
        pdfDoc.fontSize(12).text(textContent, 100, 100); // OCR'dan gelen metni PDF'e ekle
        pdfDoc.end();

        writeStream.on('finish', () => {
            res.status(200).send('PDF başarıyla oluşturuldu.');
            fs.unlinkSync(filePath); // Geçici dosyayı sil
        });
    } catch (err) {
        console.error('Hata:', err);
        res.status(500).send('Sunucu hatası.');
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
        res.status(404).send('Klasör bulunamadı.');
    }
});

// Statik dosya servisi: user_data klasörünü tarayıcıdan erişilebilir hale getir
app.use('/user_data', express.static(path.join(__dirname, 'user_data')));



// Sunucu başlatma
app.listen(port, () => {
    console.log(`Sunucu http://localhost:${port} adresinde çalışıyor.`);
});
