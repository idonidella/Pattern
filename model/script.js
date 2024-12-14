// Canvas'ı seç ve çizim bağlamını al
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');

// Çizim durumu
let isDrawing = false;

// Çizime başlama
canvas.addEventListener('mousedown', () => {
    isDrawing = true;
    ctx.beginPath(); // Yeni bir çizim başlat
});

// Çizimi bitirme
canvas.addEventListener('mouseup', () => {
    isDrawing = false;
});

// Fare hareketiyle çizim yap
canvas.addEventListener('mousemove', (event) => {
    if (!isDrawing) return; // Çizim yapılmıyorsa çık
    const rect = canvas.getBoundingClientRect(); // Canvas'ın pozisyonunu al
    const x = event.clientX - rect.left; // Fare pozisyonu (x)
    const y = event.clientY - rect.top;  // Fare pozisyonu (y)
    
    ctx.lineWidth = 10; // Çizgi kalınlığı
    ctx.lineCap = 'round'; // Çizgi ucu şekli
    ctx.strokeStyle = 'black'; // Çizgi rengi
    
    ctx.lineTo(x, y); // Çizim son noktasını belirle
    ctx.stroke(); // Çizim yap
});

// Temizleme butonuna tıklandığında canvas'ı temizle
document.getElementById('clearButton').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Canvas'ı temizle
    document.getElementById('result').innerText = 'Tanınan Rakam: Bekleniyor...'; // Sonuçları sıfırla
    document.getElementById('confidence').innerText = 'Güven Oranı: Bekleniyor...';
});

// Tanıma butonuna tıklandığında resmi gönder
document.getElementById('recognizeButton').addEventListener('click', () => {
    const dataUrl = canvas.toDataURL('image/png'); // Canvas içeriğini base64 olarak al

    // Flask API'ye istek gönder
    fetch('http://127.0.0.1:5000/recognize', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: dataUrl }) // Base64 resmi gönder
    })
    .then(response => response.json()) // Yanıtı JSON olarak al
    .then(data => {
        // Yanıttaki tahmini sonucu ve güven oranını ekrana yaz
        document.getElementById('result').innerText = 'Tanınan Rakam: ' + data.prediction;
        document.getElementById('confidence').innerText = 'Güven Oranı: ' + (data.confidence * 100).toFixed(2) + '%';
    })
    .catch(error => {
        console.error('Hata:', error); // Hata varsa konsola yaz
    });
});
