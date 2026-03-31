let scene, camera, renderer, particleSystem;
let gestureState = "idle";

init();
initHandTracking();
animate();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("canvas") });
  renderer.setSize(window.innerWidth * 0.8, window.innerHeight * 0.8);

  createParticles();
}

function createParticles(type = "sphere") {
  const geometry = new THREE.BufferGeometry();
  const count = 800;

  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    let x, y, z;

    if (type === "heart") {
      let t = Math.random() * Math.PI * 2;
      x = 16 * Math.pow(Math.sin(t), 3);
      y = 13 * Math.cos(t) - 5 * Math.cos(2*t);
      z = Math.random() * 2 - 1;
    } else {
      x = (Math.random() - 0.5) * 5;
      y = (Math.random() - 0.5) * 5;
      z = (Math.random() - 0.5) * 5;
    }

    positions[i * 3] = x * 0.1;
    positions[i * 3 + 1] = y * 0.1;
    positions[i * 3 + 2] = z * 0.1;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xff4d6d,
    size: 0.05
  });

  if (particleSystem) scene.remove(particleSystem);

  particleSystem = new THREE.Points(geometry, material);
  scene.add(particleSystem);
}

function animate() {
  requestAnimationFrame(animate);

  if (gestureState === "expand") {
    particleSystem.scale.x += 0.01;
    particleSystem.scale.y += 0.01;
  }

  if (gestureState === "contract") {
    particleSystem.scale.x -= 0.01;
    particleSystem.scale.y -= 0.01;
  }

  renderer.render(scene, camera);
}

function initHandTracking() {
  const video = document.getElementById("video");

  const hands = new Hands({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
  });

  hands.setOptions({
    maxNumHands: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7
  });

  hands.onResults(results => {
    if (results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];

      let thumbY = landmarks[4].y;
      let indexY = landmarks[8].y;

      if (thumbY < indexY) {
        gestureState = "expand";
      } else {
        gestureState = "contract";
      }

      if (landmarks[8].x < 0.3) {
        createParticles("heart");
      }
      if (landmarks[8].x > 0.7) {
        createParticles("sphere");
      }
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
