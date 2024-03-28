import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import gsap from "gsap";
import fireworkVertexShader from "./shaders/firework/vertex.glsl";
import fireworkFragmentShader from "./shaders/firework/fragment.glsl";

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

const createFirework = (count, position, size, texture, radius, color) => {
  // Geometry
  const positionsArray = new Float32Array(count * 3);
  const sizesArray = new Float32Array(count);
  const timeMultipliersArray = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    const spherical = new THREE.Spherical(
      radius * (0.75 + Math.random() * 0.25),
      Math.random() * Math.PI,
      Math.random() * Math.PI * 2
    );
    const position = new THREE.Vector3();
    position.setFromSpherical(spherical);

    positionsArray[i3] = position.x;
    positionsArray[i3 + 1] = position.y;
    positionsArray[i3 + 2] = position.z;

    sizesArray[i] = Math.random();

    timeMultipliersArray[i] = 1 + Math.random();
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positionsArray, 3)
  );
  geometry.setAttribute(
    "aSize",
    new THREE.Float32BufferAttribute(sizesArray, 1)
  );
  geometry.setAttribute(
    "aTimeMultiplier",
    new THREE.Float32BufferAttribute(timeMultipliersArray, 1)
  );

  // Material
  const material = new THREE.ShaderMaterial({
    vertexShader: fireworkVertexShader,
    fragmentShader: fireworkFragmentShader,
    uniforms: {
      uSize: new THREE.Uniform(size),
      uResolution: new THREE.Uniform(sizes.resolution),
      uTexture: new THREE.Uniform(texture),
      uColor: new THREE.Uniform(color),
      uProgress: new THREE.Uniform(0),
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
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
  gsap.to(material.uniforms.uProgress, {
    value: 1,
    ease: "linear",
    duration: 3,
    onComplete: destroy,
  });
};

const createRandomFirework = () => {
  const count = Math.round(400 + Math.random() * 1000);
  const position = new THREE.Vector3(
    (Math.random() - 0.5) * 10,
    Math.random() * 2,
    (Math.random() - 0.5) * 2
  );
  const size = 0.1 + Math.random() * 0.1;
  const radius = 0.5 + Math.random();
  const color = new THREE.Color();
  color.setHSL(Math.random(), 1, 0.7);
  createFirework(count, position, size, texture, radius, color);
};

createRandomFirework();

window.addEventListener("click", createRandomFirework);

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
