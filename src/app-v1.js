import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  AxesHelper,
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
  TextureLoader,
} from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import * as TWEEN from '@tweenjs/tween.js';

import logo from './public/logo.png';

let scene, camera, renderer, mesh, tween;

// 场景
function initScene() {
  scene = new Scene();
}

// 初始化相机
function initCamera() {
  camera = new PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  // camera.position.z = 10
  camera.position.set(0, 0, 100);
  camera.lookAt(scene.position);
}

// 初始化渲染器
function initRenderer() {
  renderer = new WebGLRenderer({
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
}

function initAxesHelper() {
  const axesHelper = new AxesHelper(30);
  scene.add(axesHelper);
}

function initOrbitControls() {
  const controls = new OrbitControls(camera, renderer.domElement);
}

function initMesh() {
  // 形状
  const geometry = new BoxGeometry(10, 10, 10);
  const texture = new TextureLoader().load(logo);
  //   材质
  const material = new MeshBasicMaterial(
    // 红色
    {
      //   color: 0xfff,
      map: texture, // 花纹
    }
  );
  mesh = new Mesh(geometry, material);
  scene.add(mesh);
}

function initTween() {
  const coords = { x: 0, y: 0 }; // Start at (0, 0)
  tween = new TWEEN.Tween(coords, false) // Create a new tween that modifies 'coords'.
    .to({ x: 300, y: 200 }, 3000) // Move to (300, 200) in 1 second.
    .easing(TWEEN.Easing.Quadratic.InOut) // Use an easing function to make the animation smooth.
    .onUpdate(that => {
      mesh.position.x = that.x;
      // Called after tween.js updates 'coords'.
      // Move 'box' to the position described by 'coords' with a CSS translation.
      //   box.style.setProperty(
      //     'transform',
      //     'translate(' + coords.x + 'px, ' + coords.y + 'px)'
      //   );
    })
    .start(); // Start the tween immediately.
}

function init() {
  initScene();
  initCamera();
  initRenderer();
  initAxesHelper();
  initOrbitControls();
  initMesh();
  initTween();
}

init();

function render(time) {
  //   if (mesh.position.x < 3) {
  //     mesh.position.x += 0.01;
  //   }
  tween.update(time);
  // 使渲染器和场景以及相机进行渲染
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

render();

function debounceResize(func, delay) {
  let timeoutId;
  return function () {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, arguments);
    }, delay);
  };
}

window.addEventListener(
  'resize',
  debounceResize(function () {
    console.log('resize')
    // 更新camera长宽比
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    // 更新渲染器长宽比
    renderer.setSize(window.innerWidth, window.innerHeight);
  }, 200)
);
