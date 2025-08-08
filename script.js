
// Preload images
const images = {};
const imageSources = {
  squirrel: 'images/coffee_squirrel.png',
  deer: 'images/business_deer.png',
  parrot: 'images/motivational_parrot.png',
};

function loadImages(sources, callback) {
  const loadedImages = {};
  let loadedCount = 0;
  const total = Object.keys(sources).length;

  for (const key in sources) {
    loadedImages[key] = new Image();
    loadedImages[key].src = sources[key];
    loadedImages[key].onload = () => {
      loadedCount++;
      if (loadedCount >= total) {
        callback(loadedImages);
      }
    };
  }
}

// Call loadImages once at the start
loadImages(imageSources, (imgs) => {
  Object.assign(images, imgs);
  updateZoo(); // draw initial zoo with images
});

// Update your updateZoo function to use images instead of shapes
function updateZoo() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw Plant (coffee plant) as before (or replace with image too)
  ctx.fillStyle = '#4caf50';
  ctx.fillRect(380, 450, 40, -stressLevel * 3);

  // Draw Coffee Squirrel image
  if (stressLevel > 20 && images.squirrel) {
    ctx.drawImage(images.squirrel, 160, 320, 100, 100); // adjust position and size
  }

  // Draw Business Deer image
  if (stressLevel > 40 && images.deer) {
    ctx.drawImage(images.deer, 580, 280, 120, 120);
  }

  // Draw Motivational Parrot image
  if (stressLevel > 70 && images.parrot) {
    ctx.drawImage(images.parrot, 365, 160, 90, 90);
  }
}
