import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import gsap from "gsap";
import fireworkVertexShader from "./shaders/vertex.glsl";
import fireworkFragmentShader from "./shaders/fragment.glsl";

// Boilerplate
const canvas = document.querySelector("canvas.webgl");

const scene = new THREE.Scene();

const textureLoader = new THREE.TextureLoader();

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
};
sizes.resolution = new THREE.Vector2(
  sizes.width * sizes.pixelRatio,
  sizes.height * sizes.pixelRatio
);

// Resize behavior for rendering
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);
  sizes.resolution.set(
    sizes.width * sizes.pixelRatio,
    sizes.height * sizes.pixelRatio
  );

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(sizes.pixelRatio);
});

const camera = new THREE.PerspectiveCamera(
  50,
  sizes.width / sizes.height,
  0.1,
  2000
);
camera.position.set(0, 0, 6);
scene.add(camera);

// Axes
const axesHelper = new THREE.AxesHelper();
scene.add(axesHelper);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);

// Firework code

const texture = textureLoader.load("./particle.png");

const createFirework = () => {
  const count = Math.round(1000);
  const position = new THREE.Vector3();
  const size = 2;
  const radius = 2;
  const color = new THREE.Color();
  color.setHSL(Math.random(), 1, 0.7);

  // Geometry
  const fireworkPositions = new Float32Array(count * 3);
  const fireworkSizes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    const spherical = new THREE.Spherical(
      radius,
      Math.random() * Math.PI,
      Math.random() * Math.PI * 2
    );
    const position = new THREE.Vector3();
    position.setFromSpherical(spherical);

    fireworkPositions[i3] = position.x;
    fireworkPositions[i3 + 1] = position.y;
    fireworkPositions[i3 + 2] = position.z;

    fireworkSizes[i] = size;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(fireworkPositions, 3)
  );
  geometry.setAttribute(
    "gSize",
    new THREE.Float32BufferAttribute(fireworkSizes, 1)
  );

  // Material
  const material = new THREE.ShaderMaterial({
    vertexShader: fireworkVertexShader,
    fragmentShader: fireworkFragmentShader,
  });

  // Points
  const firework = new THREE.Points(geometry, material);
  firework.position.copy(position);
  scene.add(firework);

  // Destroy
  const destroy = () => {
    console.log("destroy");
    scene.remove(firework);
    geometry.dispose();
    material.dispose();
  };

  // Animate
};

window.addEventListener("click", createFirework);

/**
 * Animate
 */
const tick = () => {
  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
