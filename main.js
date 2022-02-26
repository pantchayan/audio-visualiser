// IMPORTING ORBIT CONTROLS
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js";

const textureLoader = new THREE.TextureLoader();

const canvas = document.querySelector("canvas");
const planeUniforms = {
  iTime: { value: 0 },
  iResolution: { value: new THREE.Vector3() },
};

const sizes = { width: window.innerWidth, height: window.innerHeight };
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.render(scene, camera);
});

const scene = new THREE.Scene();

const planeGeometry = new THREE.PlaneBufferGeometry(10, 10, 20, 20);
const planeMaterial = new THREE.ShaderMaterial({
  uniforms: planeUniforms,
  vertexShader: /* cpp */ `
  #include <common>
  attribute vec3 Position;
  varying vec4 vPosition;
  void main()
  {
      vec4 modelPosition = modelMatrix * vec4(position, 1.0);
      vPosition = modelPosition;
      vec4 viewPosition = viewMatrix * modelPosition;
      vec4 projectedPosition = projectionMatrix * viewPosition;
      gl_Position = projectedPosition;
  }
  `,
  fragmentShader: /* glsl */ `
  #include <common>
  uniform vec3 iResolution;
  uniform float iTime;
  varying vec4 vPosition;
  // By iq: https://www.shadertoy.com/user/iq  
  // license: Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
  void mainImage( out vec4 fragColor, in vec2 fragCoord )
  {
      // Normalized pixel coordinates (from 0 to 1)
      vec2 uv = fragCoord/iResolution.xy;
  
      // Time varying pixel color
      vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));

      col.rgb -=  abs(7.0 - vPosition.y - 2.0)/25.0;
      // Output to screen
      fragColor = vec4(col,1.0);
  }
  
  void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
  }
  `,
});
planeMaterial.side = THREE.DoubleSide;
planeMaterial.wireframe = false;

const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);

const ambientLight = new THREE.AmbientLight(new THREE.Color("white"), 1);
scene.add(ambientLight);

const camera = new THREE.PerspectiveCamera(
  55,
  sizes.width / sizes.height,
  0.1,
  500
);
camera.position.z = 10;
camera.position.y = 0;

renderer.render(scene, camera);

const controls = new OrbitControls(camera, renderer.domElement);
const clock = new THREE.Clock();
function animate(time) {
  time *= 0.001;
  let elapsedTime = clock.getElapsedTime();
  planeUniforms.iResolution.value.set(canvas.width, canvas.height, 1);
  planeUniforms.iTime.value = time;
  renderer.render(scene, camera);
  controls.update();
  requestAnimationFrame(animate);
};

animate();
