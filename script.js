let scene, camera, renderer, particles;
let scaleFactor = 1;

init();
initHandTracking();
animate();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("canvas"),
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);

  createHeartParticles();
}

// ❤️ HEART PARTICLES
function createHeartParticles() {
  const geometry = new THREE.BufferGeometry();
  const count = 1000;

  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    let t = Math.random() * Math.PI * 2;

    let x = 16 * Math.pow(Math.sin(t), 3);
    let y =
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t);

    let z = (Math.random() - 0.5) * 2;

    positions[i * 3] = x * 0.05;
    positions[i * 3 + 1] = y * 0.05;
    positions[i * 3 + 2] = z * 0.05;
  }

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  const material = new THREE.PointsMaterial({
    color: 0xff3366,
    size: 0.05
  });

  particles = new THREE.Points(geometry, material);
  scene.add(particles);
}

// 🎥 HAND TRACKING
function initHandTracking() {
  const video = document.getElementById("video");

  const hands = new Hands({
    locateFile: (file) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
  });

  hands.setOptions({
    maxNumHands: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7
  });

  hands.onResults((results) => {
    if (results.multiHandLandmarks.length > 0) {
      const lm = results.multiHandLandmarks[0];

      let thumbY = lm[4].y;
      let indexY = lm[8].y;

      // 👍 expand / shrink
      if (thumbY < indexY) {
        scaleFactor += 0.02;
      } else {
        scaleFactor -= 0.02;
      }

      scaleFactor = Math.max(0.5, Math.min(2.5, scaleFactor));
    }
  });

  const cam = new Camera(video, {
    onFrame: async () => {
      await hands.send({ image: video });
    },
    width: 320,
    height: 240
  });

  cam.start();
}

// 🎬 ANIMATION
function animate() {
  requestAnimationFrame(animate);

  if (particles) {
    particles.rotation.y += 0.01;
    particles.rotation.x += 0.005;

    particles.scale.set(scaleFactor, scaleFactor, scaleFactor);
  }

  renderer.render(scene, camera);
}

// 📱 RESIZE FIX
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
