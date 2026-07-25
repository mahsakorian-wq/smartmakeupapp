// --- تنظیمات اولیه ---
let currentLanguage = 'en';
let currentGender = 'female';
let isCompleted = false;
let detectionTimer = null;
let currentFaceShape = '';
let currentUndertone = '';
let lipstickColor = 'rgba(255, 127, 80, 0.6)';
let lastLandmarks = null;
let snapshotDataURL = null; // متغیر جدید برای ذخیره عکس واقعی

// --- اتصال به عناصر HTML ---
const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('makeupCanvas');
const canvasCtx = canvasElement.getContext('2d');
const startButton = document.getElementById('startBtn');
const vpnWarning = document.getElementById('vpnWarning');
const designerName = document.getElementById('designerName');
const shapeLabel = document.getElementById('shapeLabel');
const shapeValue = document.getElementById('shapeValue');
const undertoneLabel = document.getElementById('undertoneLabel');
const undertoneValue = document.getElementById('undertoneValue');
const recTitle = document.getElementById('recTitle');
const recCards = document.getElementById('recCards');
const btnEn = document.getElementById('btnEn');
const btnFa = document.getElementById('btnFa');
const btnMale = document.getElementById('btnMale');
const btnFemale = document.getElementById('btnFemale');
const recommendationsSection = document.getElementById('recommendations');

// --- دیکشنری ---
const translations = {
    en: {
        warning: "⚠️ Inside Iran, you must turn ON a VPN to use this app. However, if you have 'Internet Pro', you MUST turn OFF your VPN.",
        designer: "Designed by Dr. Masoud Amiri",
        startBtn: "Start camera", restartBtn: "Restart Camera", waiting: "Waiting...",
        shapeLabel: "FACE SHAPE", undertoneLabel: "SKIN UNDERTONE", recTitle: "Recommendations",
        oval: "Oval", round: "Round", square: "Square",
        warm: "Warm", cool: "Cool", neutral: "Neutral",
        lips: "Lips", eyes: "Eyes & Contour", foundation: "Foundation",
        fOvalWarm: { lips: "Coral/Peach lipstick", eyes: "Contour cheekbones, Winged eyeliner", foundation: "Yellow-based foundation" },
        fOvalCool: { lips: "Berry/Pink lipstick", eyes: "Soft smokey eye, Rounded eyeliner", foundation: "Pink-based foundation" },
        fOvalNeutral: { lips: "Mauve/Rose lipstick", eyes: "Natural contour, Thin eyeliner", foundation: "Neutral foundation" },
        fRoundWarm: { lips: "Coral/Nude lipstick", eyes: "Angular contour, Cat-eye eyeliner", foundation: "Yellow-based foundation" },
        fRoundCool: { lips: "Pink/Plum lipstick", eyes: "Angular contour, Cat-eye eyeliner", foundation: "Pink-based foundation" },
        fRoundNeutral: { lips: "Mauve/Nude lipstick", eyes: "Angular contour, Cat-eye eyeliner", foundation: "Neutral foundation" },
        fSquareWarm: { lips: "Warm Peach lipstick", eyes: "Soften jawline with blush, Rounded eyeliner", foundation: "Yellow-based foundation" },
        fSquareCool: { lips: "Cool Berry lipstick", eyes: "Soften jawline with blush, Rounded eyeliner", foundation: "Pink-based foundation" },
        fSquareNeutral: { lips: "Neutral Rose lipstick", eyes: "Soften jawline with blush, Rounded eyeliner", foundation: "Neutral foundation" },
        male: { lips: "Clear lip balm or natural tint", eyes: "Subtle jawline contour, Cover dark circles", foundation: "Natural matte foundation" }
    },
    fa: {
        warning: "⚠️ در ایران برای استفاده از این اپلیکیشن، وی‌پی‌ان باید روشن باشد. اما اگر اینترنت پرو دارید، حتماً وی‌پی‌ان باید خاموش باشد.",
        designer: "کاری از دکتر مسعود امیری",
        startBtn: "فعال کردن دوربین", restartBtn: "شروع دوباره", waiting: "در انتظار...",
        shapeLabel: "فرم صورت", undertoneLabel: "زیرین پوست", recTitle: "پیشنهادهای آرایش",
        oval: "بیضی", round: "گرد", square: "مربع",
        warm: "گرم", cool: "سرد", neutral: "خنثی",
        lips: "لب", eyes: "چشم و سایه‌زنی", foundation: "پودر و کانسیلر",
        fOvalWarm: { lips: "رژ لب هلو و مرجانی", eyes: "سایه‌زنی استخوان گونه، خط چشم گربه‌ای", foundation: "پودر با پایه زرد/طلایی" },
        fOvalCool: { lips: "رژ لب یخی و مالین", eyes: "سایه چشم دودی ملایم، خط چشم دودی", foundation: "پودر با پایه صورتی" },
        fOvalNeutral: { lips: "رژ لب رز و ماو", eyes: "سایه‌زنی طبیعی، خط چشم نازک", foundation: "پودر خنثی" },
        fRoundWarm: { lips: "رژ لب هلو و نود", eyes: "سایه‌زنی زاویه‌دار، خط چشم گربه‌ای", foundation: "پودر با پایه زرد" },
        fRoundCool: { lips: "رژ لب صورتی و انگوری", eyes: "سایه‌زنی زاویه‌دار، خط چشم گربه‌ای", foundation: "پودر با پایه صورتی" },
        fRoundNeutral: { lips: "رژ لب ماو و نود", eyes: "سایه‌زنی زاویه‌دار، خط چشم گربه‌ای", foundation: "پودر خنثی" },
        fSquareWarm: { lips: "رژ لب هلو گرم", eyes: "رنگ کردن خط فک، خط چشم گرد", foundation: "پودر با پایه زرد" },
        fSquareCool: { lips: "رژ لب انگوری سرد", eyes: "رنگ کردن خط فک، خط چشم گرد", foundation: "پودر با پایه صورتی" },
        fSquareNeutral: { lips: "رژ لب رز خنثی", eyes: "رنگ کردن خط فک، خط چشم گرد", foundation: "پودر خنثی" },
        male: { lips: "بالمر شفاف یا نود طبیعی", eyes: "سایه‌زنی ملایم خط فک، پوشش سیاهی دور چشم", foundation: "پودر مات طبیعی" }
    }
};

// --- دکمه‌ها ---
btnEn.onclick = () => { currentLanguage = 'en'; btnEn.classList.add('active-lang'); btnFa.classList.remove('active-lang'); updateUI(); };
btnFa.onclick = () => { currentLanguage = 'fa'; btnFa.classList.add('active-lang'); btnEn.classList.remove('active-lang'); updateUI(); };
btnMale.onclick = () => { currentGender = 'male'; btnMale.classList.add('active-gender'); btnFemale.classList.remove('active-gender'); };
btnFemale.onclick = () => { currentGender = 'female'; btnFemale.classList.add('active-gender'); btnMale.classList.remove('active-gender'); };

function updateUI() {
    const t = translations[currentLanguage];
    vpnWarning.innerText = t.warning;
    designerName.innerText = t.designer;
    shapeLabel.innerText = t.shapeLabel;
    undertoneLabel.innerText = t.undertoneLabel;
    recTitle.innerText = t.recTitle;
    document.body.dir = currentLanguage === 'fa' ? 'rtl' : 'ltr';
    document.body.style.fontFamily = currentLanguage === 'fa' ? 'Tahoma, Arial, sans-serif' : 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif';
    if(!isCompleted) { startButton.innerText = t.startBtn; shapeValue.innerText = t.waiting; undertoneValue.innerText = t.waiting; }
    else { startButton.innerText = t.restartBtn; }
}

// --- هوش مصنوعی گوگل ---
const faceMesh = new FaceMesh({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}` });
faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true, selfieMode: false }); // خاموش کردن حالت آینه‌ای در گوگل
faceMesh.onResults(onResults);

// --- تابع رسم رژ لب مجازی ---
function drawFilledLips(ctx, landmarks, color) {
    const upperOuter = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291];
    const lowerOuter = [291, 375, 321, 405, 314, 17, 84, 181, 91, 146, 61];
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(landmarks[upperOuter[0]].x * canvasElement.width, landmarks[upperOuter[0]].y * canvasElement.height);
    for (let i = 1; i < upperOuter.length; i++) { ctx.lineTo(landmarks[upperOuter[i]].x * canvasElement.width, landmarks[upperOuter[i]].y * canvasElement.height); }
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(landmarks[lowerOuter[0]].x * canvasElement.width, landmarks[lowerOuter[0]].y * canvasElement.height);
    for (let i = 1; i < lowerOuter.length; i++) { ctx.lineTo(landmarks[lowerOuter[i]].x * canvasElement.width, landmarks[lowerOuter[i]].y * canvasElement.height); }
    ctx.closePath(); ctx.fill();
}

// --- پردازش نتایج (زنده) ---
function onResults(results) {
  if (isCompleted) return;

  canvasElement.width = results.image.width;
  canvasElement.height = results.image.height;

  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  // انعکاس آینه‌ای برای دوربین سلفی
  canvasCtx.translate(canvasElement.width, 0);
  canvasCtx.scale(-1, 1);

  // رسم تصویر واقعی دوربین
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
    const landmarks = results.multiFaceLandmarks[0];
    lastLandmarks = landmarks;

    drawConnectors(canvasCtx, landmarks, FACEMESH_FACE_OVAL, {color: '#FF4757', lineWidth: 2});
    drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYE, {color: '#70A1FF', lineWidth: 2});
    drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYE, {color: '#70A1FF', lineWidth: 2});
    drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYEBROW, {color: '#A4B0BE', lineWidth: 2});
    drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYEBROW, {color: '#A4B0BE', lineWidth: 2});
    drawConnectors(canvasCtx, landmarks, FACEMESH_LIPS, {color: '#E8B4B8', lineWidth: 2});

    const forehead = landmarks[10]; const chin = landmarks[152]; const leftCheek = landmarks[234]; const rightCheek = landmarks[454];
    const faceLength = Math.abs(forehead.y - chin.y); const faceWidth = Math.abs(leftCheek.x - rightCheek.x);
    const ratio = faceLength / faceWidth;
    const t = translations[currentLanguage];
    if (ratio > 1.4) { currentFaceShape = 'oval'; shapeValue.innerText = t.oval; }
    else if (ratio < 1.1) { currentFaceShape = 'square'; shapeValue.innerText = t.square; }
    else { currentFaceShape = 'round'; shapeValue.innerText = t.round; }

    const foreheadPixel = landmarks[10];
    const x = Math.round(foreheadPixel.x * canvasElement.width);
    const y = Math.round(foreheadPixel.y * canvasElement.height);
    const pixel = canvasCtx.getImageData(x, y, 1, 1).data;
    const R = pixel[0]; const G = pixel[1]; const B = pixel[2];
    if ((R + G) > (B * 1.5)) { currentUndertone = 'warm'; undertoneValue.innerText = t.warm; lipstickColor = 'rgba(255, 127, 80, 0.6)'; }
    else if (B > (R * 0.9)) { currentUndertone = 'cool'; undertoneValue.innerText = t.cool; lipstickColor = 'rgba(199, 21, 133, 0.6)'; }
    else { currentUndertone = 'neutral'; undertoneValue.innerText = t.neutral; lipstickColor = 'rgba(224, 176, 255, 0.6)'; }
    if (currentGender === 'male') lipstickColor = 'rgba(210, 180, 140, 0.4)';

    if (!detectionTimer) { detectionTimer = setTimeout(() => completeAnalysis(), 3000); }
  } else {
    shapeValue.innerText = translations[currentLanguage].waiting;
    undertoneValue.innerText = translations[currentLanguage].waiting;
    if (detectionTimer) { clearTimeout(detectionTimer); detectionTimer = null; }
  }
  canvasCtx.restore();
}

// --- توقف و نمایش نهایی (عکس واقعی + رژ لب روی لب) ---
function completeAnalysis() {
  isCompleted = true;
  
  // ۱. گرفتن یک عکس (Snapshot) از تصویر واقعی دوربین و خطوط قبل از خاموش شدن
  snapshotDataURL = canvasElement.toDataURL('image/png');

  // ۲. خاموش کردن چراغ دوربین گوشی
  const stream = videoElement.srcObject;
  if (stream) { stream.getTracks().forEach(track => track.stop()); }
  videoElement.srcObject = null;

  startButton.innerText = translations[currentLanguage].restartBtn;

  // ۳. بارگذاری عکس واقعی ذخیره شده و رسم رژ لب روی آن
  const img = new Image();
  img.onload = () => {
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      canvasCtx.save();
      
      // انعکاس آینه‌ای
      canvasCtx.translate(canvasElement.width, 0);
      canvasCtx.scale(-1, 1);
      
      // رسم عکس واقعی کاربر (پس‌زمینه فرش و صورت واقعی)
      canvasCtx.drawImage(img, 0, 0, canvasElement.width, canvasElement.height);
      
      // رسم رژ لب مجازی دقیقاً روی لب واقعی کاربر
      if (lastLandmarks) { drawFilledLips(canvasCtx, lastLandmarks, lipstickColor); }
      
      // رسم دوباره خطوط قرمز و آبی روی عکس (تا دقیقاً روی صورت بمانند)
      drawConnectors(canvasCtx, lastLandmarks, FACEMESH_FACE_OVAL, {color: '#FF4757', lineWidth: 2});
      drawConnectors(canvasCtx, lastLandmarks, FACEMESH_LEFT_EYE, {color: '#70A1FF', lineWidth: 2});
      drawConnectors(canvasCtx, lastLandmarks, FACEMESH_RIGHT_EYE, {color: '#70A1FF', lineWidth: 2});
      drawConnectors(canvasCtx, lastLandmarks, FACEMESH_LEFT_EYEBROW, {color: '#A4B0BE', lineWidth: 2});
      drawConnectors(canvasCtx, lastLandmarks, FACEMESH_RIGHT_EYEBROW, {color: '#A4B0BE', lineWidth: 2});
      
      canvasCtx.restore();
      
      // نمایش پیشنهادها
      recommendationsSection.classList.remove('hidden');
      renderRecommendations();
  };
  img.src = snapshotDataURL;
}

// --- تولید کادر پیشنهادها ---
function renderRecommendations() {
    const t = translations[currentLanguage];
    recCards.innerHTML = '';
    let recData;
    if (currentGender === 'male') { recData = t.male; } 
    else {
        const key = `f${currentFaceShape.charAt(0).toUpperCase() + currentFaceShape.slice(1)}${currentUndertone.charAt(0).toUpperCase() + currentUndertone.slice(1)}`;
        recData = t[key] || t.fOvalNeutral;
    }
    const categories = [ { title: t.lips, text: recData.lips }, { title: t.eyes, text: recData.eyes }, { title: t.foundation, text: recData.foundation } ];
    categories.forEach(cat => {
        const card = document.createElement('div'); card.className = 'rec-card';
        card.innerHTML = `<h3>${cat.title}</h3><p>${cat.text}</p>`;
        recCards.appendChild(card);
    });
}

// --- دوربین ---
async function enableCamera() {
  try {
    if (isCompleted) {
        isCompleted = false; detectionTimer = null; lastLandmarks = null; snapshotDataURL = null;
        recommendationsSection.classList.add('hidden');
        shapeValue.innerText = translations[currentLanguage].waiting;
        undertoneValue.innerText = translations[currentLanguage].waiting;
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    }
    startButton.innerText = "Loading AI... ⏳";
    const camera = new Camera(videoElement, {
      onFrame: async () => { if (!isCompleted) { await faceMesh.send({image: videoElement}); } },
      width: 720, height: 960, facingMode: 'user'
    });
    await camera.start();
    startButton.innerText = translations[currentLanguage].startBtn;
  } catch (error) {
    console.error("Error:", error);
    alert("Please use Chrome browser and allow camera access.");
  }
}

startButton.addEventListener('click', enableCamera);
updateUI();
