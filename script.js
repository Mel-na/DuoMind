window.onload = async () => {
  await loadFaceApiModels();
  startApp();
};

async function loadFaceApiModels() {
  const MODEL_URL = 'https://cdn.jsdelivr.net/npm/face-api.js/models';
  await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
  await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
  console.log('Face-api models loaded');
}

function startApp() {
  const typingArea = document.getElementById('typingArea');
  const stressLevelDisplay = document.getElementById('stressLevel');
  const growButton = document.getElementById('growButton');
  const ecosystemArea = document.getElementById('ecosystemArea');
  const webcam = document.getElementById('webcam');
  const overlay = document.getElementById('overlay');
  const overlayCtx = overlay.getContext('2d');

  let stressScore = 0;
  let lastTypingTime = null;

  // Roblox-style SVG plants
  const plantSVGs = [
    `<svg viewBox="0 0 64 96" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="96" fill="#4CAF50" rx="8" ry="8"/>
      <rect y="40" width="64" height="24" fill="#81C784"/>
      <rect y="72" width="64" height="8" fill="#388E3C"/>
      <rect x="28" y="16" width="8" height="40" fill="#2E7D32"/>
    </svg>`,
    `<svg viewBox="0 0 64 96" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="96" fill="#66BB6A" rx="10" ry="10"/>
      <circle cx="32" cy="40" r="20" fill="#81C784"/>
      <rect y="64" width="64" height="12" fill="#388E3C"/>
    </svg>`,
    `<svg viewBox="0 0 64 96" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="96" fill="#2E7D32" rx="6" ry="6"/>
      <polygon points="16,96 32,60 48,96" fill="#4CAF50"/>
      <rect y="40" width="64" height="16" fill="#81C784"/>
    </svg>`
  ];

  // Roblox-style SVG animals
  const animalSVGs = [
    `<svg viewBox="0 0 64 96" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="96" fill="#FFC107" rx="12" ry="12"/>
      <circle cx="20" cy="40" r="8" fill="#FFEB3B"/>
      <circle cx="44" cy="40" r="8" fill="#FFEB3B"/>
      <rect y="72" width="64" height="8" fill="#FFA000"/>
    </svg>`,
    `<svg viewBox="0 0 64 96" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="96" fill="#EF5350" rx="14" ry="14"/>
      <circle cx="32" cy="50" r="20" fill="#E53935"/>
      <rect y="70" width="64" height="14" fill="#B71C1C"/>
    </svg>`,
    `<svg viewBox="0 0 64 96" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="96" fill="#42A5F5" rx="10" ry="10"/>
      <rect x="12" y="40" width="40" height="30" fill="#90CAF9"/>
      <rect y="75" width="64" height="10" fill="#1E88E5"/>
    </svg>`
  ];

  // Webcam + face emotion detection
  startWebcam();

  // Ambient Light Sensor
  if ('AmbientLightSensor' in window) {
    try {
      const sensor = new AmbientLightSensor();
      sensor.addEventListener('reading', () => {
        handleLightLevel(sensor.illuminance);
      });
      sensor.start();
    } catch (err) {
      console.warn('AmbientLightSensor error:', err);
    }
  } else {
    console.log('Ambient Light Sensor not supported.');
  }

  // Typing detection
  typingArea.addEventListener('input', (e) => {
    const now = Date.now();
    if (lastTypingTime) {
      const deltaSec = (now - lastTypingTime) / 1000;
      const speed = 1 / deltaSec;
      updateStressFromTyping(speed, e.data);
    }
    lastTypingTime = now;
  });

  growButton.addEventListener('click', () => {
    growEcosystem();
  });

  async function startWebcam() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        webcam.srcObject = stream;

        setInterval(async () => {
          const detections = await faceapi
            .detectSingleFace(webcam, new faceapi.TinyFaceDetectorOptions())
            .withFaceExpressions();
          overlayCtx.clearRect(0, 0, overlay.width, overlay.height);

          if (detections) {
            const resizedDetections = faceapi.resizeResults(detections, {
              width: webcam.width,
              height: webcam.height
            });
            faceapi.draw.drawDetections(overlay, resizedDetections);
            faceapi.draw.drawFaceExpressions(overlay, resizedDetections);

            const expressions = detections.expressions;
            const stressFromFace = mapExpressionsToStress(expressions);
            adjustStress(stressFromFace);
          }
        }, 3000);
      } catch (err) {
        console.warn('Webcam access denied or error:', err);
      }
    }
  }

  function mapExpressionsToStress(expressions) {
    if (expressions.happy > 0.6 || expressions.neutral > 0.6) return -2;
    const negativeExpressions = ['sad', 'angry', 'fearful', 'disgusted'];
    let stress = 0;
    negativeExpressions.forEach(exp => {
      stress += expressions[exp] * 5;
    });
    return stress;
  }

  function handleLightLevel(lux) {
    if (lux < 30) adjustStress(0.5);
    else adjustStress(-0.5);
  }

  function updateStressFromTyping(speed, lastChar) {
    if (speed > 5) adjustStress(1);
    else adjustStress(-0.5);
    if (lastChar && ['.', ',', '!', '?', '\b'].includes(lastChar)) adjustStress(1);
  }

  function adjustStress(amount) {
    stressScore += amount;
    stressScore = Math.min(Math.max(stressScore, 0), 10);
    updateStressDisplay();
  }

  function updateStressDisplay() {
    let levelText = 'Calm';
    if (stressScore > 7) levelText = 'High Stress 😰';
    else if (stressScore > 4) levelText = 'Moderate Stress 😟';
    else if (stressScore > 1) levelText = 'Low Stress 🙂';

    stressLevelDisplay.textContent = 'Stress Level: ' + levelText;

    const items = ecosystemArea.children;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const svg = item.querySelector('svg');
      if (!svg) continue;

      if (stressScore > 7) {
        item.style.filter = 'grayscale(70%) sepia(50%) saturate(300%) hue-rotate(10deg) brightness(70%)';
      } else if (stressScore > 4) {
        item.style.filter = 'sepia(0.3) saturate(150%) brightness(90%)';
      } else {
        item.style.filter = 'none';
      }
      const scale = 1 - (stressScore / 15);
      item.style.transform = `scale(${scale})`;
    }
  }

  function growEcosystem() {
    const container = document.createElement('div');

    const isAnimal = Math.random() < 0.4;
    container.classList.add(isAnimal ? 'animal' : 'plant');

    // Pick random SVG and insert as innerHTML
    const svgString = isAnimal
      ? animalSVGs[Math.floor(Math.random() * animalSVGs.length)]
      : plantSVGs[Math.floor(Math.random() * plantSVGs.length)];

    container.innerHTML = svgString;
    ecosystemArea.appendChild(container);

    playGrowSound();
    updateStressDisplay();
  }

  function playGrowSound() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.2);
  }
}
