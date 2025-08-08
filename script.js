document.addEventListener('DOMContentLoaded', () => {
  console.log('Script loaded and DOM ready!');

  const growButton = document.getElementById('growButton');
  const ecosystemArea = document.getElementById('ecosystemArea');

  growButton.addEventListener('click', () => {
    // Create a new plant element
    const plant = document.createElement('div');
    plant.classList.add('plant');

    // Play a subtle grow sound (optional)
    playGrowSound();

    // Add plant to ecosystem area
    ecosystemArea.appendChild(plant);
  });

  function playGrowSound() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(400, audioCtx.currentTime); // frequency in Hz
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); // volume

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.3); // play for 0.3 seconds
  }

  // Register service worker for PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(() => console.log('Service Worker Registered'))
      .catch(err => console.error('Service Worker registration failed:', err));
  }
});
