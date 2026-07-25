// --- تنظیمات ---
let currentLanguage = 'en';
let currentGender = 'female';
let isCompleted = false;
let detectionTimer = null;
let currentFaceShape = '';
let currentUndertone = '';
let lipstickColor = 'rgba(232, 134, 125, 0.65)';
let lastLandmarks = null;

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

// --- دیکشنری حرفه‌ای ---
const translations = {
    en: {
        warning: "⚠️ Inside Iran, you must turn ON a VPN to use this app. However, if you have 'Internet Pro', you MUST turn OFF your VPN.",
        designer: "Designed by Dr. Masoud Amiri",
        startBtn: "Start camera", restartBtn: "Restart Camera", waiting: "Waiting...",
        shapeLabel: "FACE SHAPE", undertoneLabel: "SKIN UNDERTONE", recTitle: "Professional Recommendations",
        oval: "Oval", round: "Round", square: "Square",
        warm: "Warm", cool: "Cool", neutral: "Neutral",
        lips: "Lip Color", eyes: "Eyes & Contour", foundation: "Base & Concealer",
        grooming: "Grooming & Skin",
        fOvalWarm: { lips: "Warm Peach / Terracotta Nude", eyes: "Soft sculpted cheekbones, Winged eyeliner", foundation: "Yellow/Gold-based base with peach concealer" },
        fOvalCool: { lips: "Berry Rose / Icy Mauve", eyes: "Soft smokey eye, Rounded eyeliner", foundation: "Pink-based base with lilac corrector" },
        fOvalNeutral: { lips: "Mauve / Dusty Rose", eyes: "Natural contour, Thin classic eyeliner", foundation: "Neutral olive or beige base" },
        fRoundWarm: { lips: "Coral Nude / Warm Peach", eyes: "Angular contour to lengthen face, Cat-eye eyeliner", foundation: "Yellow-based matte base" },
        fRoundCool: { lips: "Plum / Cool Pink", eyes: "Angular contour to lengthen face, Cat-eye eyeliner", foundation: "Pink-based matte base" },
        fRoundNeutral: { lips: "Mauve Nude / Soft Berry", eyes: "Angular contour to lengthen face, Cat-eye eyeliner", foundation: "Neutral matte base" },
        fSquareWarm: { lips: "Warm Peach / Soft Coral", eyes: "Blush on jawline to soften, Rounded soft eyeliner", foundation: "Yellow-based base" },
        fSquareCool: { lips: "Cool Berry / Deep Rose", eyes: "Blush on jawline to soften, Rounded soft eyeliner", foundation: "Pink-based base" },
        fSquareNeutral: { lips: "Neutral Rose / Dusty Pink", eyes: "Blush on jawline to soften, Rounded soft eyeliner", foundation: "Neutral base" },
        male: { grooming: "Clear skin & Well-groomed brows", eyes: "Subtle jawline contour, Cover dark circles with peach corrector", foundation: "Natural matte tinted moisturizer" }
    },
    fa: {
        warning: "⚠️ در ایران برای استفاده از این اپلیکیشن، وی‌پی‌ان باید روشن باشد. اما اگر اینترنت پرو دارید، حتماً وی‌پی‌ان باید خاموش باشد.",
        designer: "کاری از دکتر مسعود امیری",
        startBtn: "فعال کردن دوربین", restartBtn: "شروع دوباره", waiting: "در انتظار...",
        shapeLabel: "فرم صورت", undertoneLabel: "زیرین پوست", recTitle: "پیشنهادهای حرفه‌ای آرایش",
        oval: "بیضی", round: "گرد", square: "مربع",
        warm: "گرم", cool: "سرد", neutral: "خنثی",
        lips: "رنگ لب", eyes: "چشم و سایه‌زنی", foundation: "پودر و کانسیلر",
        grooming: "مراقبت و آبرو",
        fOvalWarm: { lips: "رژ لب نود پچ / تراکوتا گرم", eyes: "سایه‌زنی ملایم استخوان گونه، خط چشم گربه‌ای", foundation: "پودر با پایه طلایی/زرد، کانسیلر پچ" },
        fOvalCool: { lips: "رژ لب رز یخی / ماو بنفش", eyes: "سایه چشم دودی ملایم، خط چشم گرد", foundation: "پودر با پایه صورتی، کانسیلر بنفش" },
        fOvalNeutral: { lips: "رژ لب ماو / رز خاکستری", eyes: "سایه‌زنی طبیعی، خط چشم کلاسیک", foundation: "پودر خنثی (بیج یا سبز فASF)" },
        fRoundWarm: { lips: "رژ لب نود مرجانی / پچ", eyes: "سایه‌زنی زاویه‌دار برای کشیدگی صورت، خط چشم گربه‌ای", foundation: "پودر مات با پایه زرد" },
        fRoundCool: { lips: "رژ لب انگوری / صورتی سرد", eyes: "سایه‌زنی زاویه‌دار برای کشیدگی صورت، خط چشم گربه‌ای", foundation: "پودر مات با پایه صورتی" },
        fRoundNeutral: { lips: "رژ لب ماو نود / بنفش ملایم", eyes: "سایه‌زنی زاویه‌دار برای کشیدگی صورت، خط چشم گربه‌ای", foundation: "پودر مات خنثی" },
        fSquareWarm: { lips: "رژ لب پچ گرم / مرجانی ملایم", eyes: "رنگ کردن خط فک برای نرم کردن زاویه، خط چشم گرد", foundation: "پودر با پایه زرد" },
        fSquareCool: { lips: "رژ لب رز عمیق / انگوری سرد", eyes: "رنگ کردن خط فک برای نرم کردن زاویه، خط چشم گرد", foundation: "پودر با پایه صورتی" },
        fSquareNeutral: { lips: "رژ لب رز خنثی / صورتی خاکی", eyes: "رنگ کردن خط فک برای نرم کردن زاویه، خط چشم گرد", foundation: "پودر خنثی" },
        male: { grooming: "پوست تمیز و ابروهای مرتب", eyes: "سایه‌زنی ملایم خط فک، پوشش سیاهی دور چشم با کانسیلر پچ", foundation: "مرطوب‌کننده رنگی مات طبیعی" }
    }
};

btnEn.onclick = () => { currentLanguage = 'en'; btnEn.classList.add('active-lang'); btnFa.classList.remove('active-lang'); updateUI(); };
btnFa.onclick = () => { currentLanguage = 'fa'; btnFa.classList.add('active-lang'); btnEn.classList.remove('active-lang'); updateUI(); };
btnMale.onclick = () => { currentGender = 'male'; btnMale.classList.add('active-gender'); btnFemale.classList.remove('active-gender'); };
btnFemale.onclick = () => { currentGender = 'female'; btnFemale.classList.add('active-gender'); btnMale.classList.remove('active-gender'); };

function updateUI() {
    const t = translations[currentLanguage];
    vpnWarning.innerText = t.warning; designerName.innerText = t.designer;
    shapeLabel.innerText = t.shapeLabel; undertoneLabel.innerText = t.undertoneLabel; recTitle.innerText = t.recTitle;
    document.body.dir = currentLanguage === 'fa' ? 'rtl' : 'ltr';
    document.body.style.fontFamily = currentLanguage === 'fa' ? 'Tahoma, Arial, sans-serif' : 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif';
    if(!isCompleted) { startButton.innerText = t.startBtn; shapeValue.innerText = t.waiting; undertoneValue.innerText = t.waiting; }
    else { startButton.innerText = t.restartBtn; }
}

// --- هوش مصنوعی (حالت خام، CSS آینه را تنظیم می‌کند) ---
const faceMesh = new FaceMesh({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}` });
faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true, selfieMode: false }); 
faceMesh.onResults(onResults);

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

// --- پردازش زنده (رسم تصویر + خطوط هوش مصنوعی) ---
function onResults(results) {
  if (isCompleted) return;

  canvasElement.width = results.image.width;
  canvasElement.height = results.image.height;

  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  // رسم تصویر خام دوربین (بدون هیچ کد آینه‌ای در JS)
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
    const landmarks = results.multiFaceLandmarks[0];
    lastLandmarks = landmarks;

    // رسم خطوط روی صورت (این خطوط فقط در حالت زنده دیده می‌شوند)
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
    if ((R + G) > (B * 1.5)) { currentUndertone = 'warm'; undertoneValue.innerText = t.warm; lipstickColor = 'rgba(232, 134, 125, 0.65)'; }
    else if (B > (R * 0.9)) { currentUndertone = 'cool'; undertoneValue.innerText = t.cool; lipstickColor = 'rgba(168, 56, 106, 0.65)'; }
    else { currentUndertone = 'neutral'; undertoneValue.innerText = t.neutral; lipstickColor = 'rgba(190, 140, 150, 0.65)'; }
    if (currentGender === 'male') lipstickColor = 'transparent';

    if (!detectionTimer) { detectionTimer = setTimeout(() => completeAnalysis(), 3000); }
  } else {
    shapeValue.innerText = translations[currentLanguage].waiting;
    undertoneValue.innerText = translations[currentLanguage].waiting;
    if (detectionTimer) { clearTimeout(detectionTimer); detectionTimer = null; }
  }
  canvasCtx.restore();
}

// --- توقف دوربین و ساخت عکس نهایی واقعی ---
function completeAnalysis() {
  isCompleted = true;
  
  // ۱. پاک کردن تمام خطوط کارتونی (دایره قرمز و...) از روی Canvas
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  
  // ۲. رسم فقط تصویر واقعی دوربین (صورت و پس‌زمینه) بدون هیچ خطوطی
  canvasCtx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
  
  // ۳. گرفتن عکس از این تصویر واقعی و تمیز (Snapshot)
  const cleanSnapshotDataURL = canvasElement.toDataURL('image/png');
  
  // ۴. خاموش کردن چراغ دوربین گوشی
  const stream = videoElement.srcObject;
  if (stream) { stream.getTracks().forEach(track => track.stop()); }
  videoElement.srcObject = null;
  startButton.innerText = translations[currentLanguage].restartBtn;

  // ۵. بارگذاری عکس واقعی تمیز و رسم فقط رژ لب روی آن
  const img = new Image();
  img.onload = () => {
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      
      // رسم عکس واقعی صورت شما (هیچ خط قرمز و آبی در این عکس نیست)
      canvasCtx.drawImage(img, 0, 0, canvasElement.width, canvasElement.height);
      
      // فقط برای خانمها: رسم رنگ رژ لب دقیقاً روی لب واقعی در عکس
      if (lastLandmarks && lipstickColor !== 'transparent') { drawFilledLips(canvasCtx, lastLandmarks, lipstickColor); }
      
      // نمایش پیشنهادها
      recommendationsSection.classList.remove('hidden');
      renderRecommendations();
  };
  img.src = cleanSnapshotDataURL;
}

function renderRecommendations() {
    const t = translations[currentLanguage];
    recCards.innerHTML = '';
    let recData;
    if (currentGender === 'male') { 
        recData = t.male;
        const categories = [ { title: t.grooming, text: recData.grooming }, { title: t.eyes, text: recData.eyes }, { title: t.foundation, text: recData.foundation } ];
        categories.forEach(cat => { const card = document.createElement('div'); card.className = 'rec-card'; card.innerHTML = `<h3>${cat.title}</h3><p>${cat.text}</p>`; recCards.appendChild(card); });
    } else {
        const key = `f${currentFaceShape.charAt(0).toUpperCase() + currentFaceShape.slice(1)}${currentUndertone.charAt(0).toUpperCase() + currentUndertone.slice(1)}`;
        recData = t[key] || t.fOvalNeutral;
        const categories = [ { title: t.lips, text: recData.lips }, { title: t.eyes, text: recData.eyes }, { title: t.foundation, text: recData.foundation } ];
        categories.forEach(cat => { const card = document.createElement('div'); card.className = 'rec-card'; card.innerHTML = `<h3>${cat.title}</h3><p>${cat.text}</p>`; recCards.appendChild(card); });
    }
}

async function enableCamera() {
  try {
    if (isCompleted) {
        isCompleted = false; detectionTimer = null; lastLandmarks = null;
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
