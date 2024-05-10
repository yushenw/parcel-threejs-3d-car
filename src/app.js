import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  AxesHelper,
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
  TextureLoader,
  AmbientLight,
  GridHelper,
  PlaneGeometry,
  MeshPhysicalMaterial,
  DoubleSide,
  SpotLight,
  CylinderGeometry,
  MeshStandardMaterial,
  Vector3
} from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import Model from './public/model.glb';
import GUI from 'lil-gui';
import * as TWEEN from '@tweenjs/tween.js';

// import logo from './public/logo.png';

let scene, camera, renderer, controls, grid;

let doors = [];

// 车身材质
let bodyMaterial = new MeshPhysicalMaterial({
  color: '',
  metalness: 1, // 是金属
  roughness: 0.5, // 这个参数决定了材质的粗糙程度。取值范围为 0 到 1,0 表示光滑,1 表示非常粗糙
  clearcoat: 1.0, // 这个参数决定了材质是否有一层透明的保护层(清漆)。取值范围为 0 到 1,0 表示没有清漆,1 表示有清漆。
  clearcoatRoughness: 0.03, // 这个参数决定了清漆层的粗糙程度。取值范围为 0 到 1,0 表示光滑,1 表示非常粗糙
});

// 玻璃材质
let glassMaterial = new MeshPhysicalMaterial({
  color: '#793f3f',
  metalness: 0.25,
  roughness: 0.5,
  transmission: 1.0, // 透光性
});

// 场景
function initScene() {
  scene = new Scene();
}

// 初始化相机
function initCamera() {
  camera = new PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    10,
    1000
  );
  // camera.position.z = 10
  camera.position.set(20, 15, 25);
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
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; //惯性效果

  // controls.autoRotate = true // 自动旋转
  controls.maxDistance = 50; // 最大距离
  controls.minDistance = 30; // 最小距离

  controls.minPolarAngle = Math.PI / 8; // 最小仰角
  controls.maxPolarAngle = (80 / 360) * 2 * Math.PI; // 最大仰角
  //   controls.maxPolarAngle = Math.PI / 2; // 最大仰角
}

// 绘制地面网格
function initGridHelper() {
  grid = new GridHelper(100, 100);
  grid.material.transparent = true;
  grid.material.opacity = 0.6;
  scene.add(grid);
}

function loadCarModel() {
  new GLTFLoader().load(Model, function (gltf) {
    const carModel = gltf.scene;
    // 绕Y轴旋转180度
    carModel.rotation.y = Math.PI;
    carModel.traverse(child => {
      const carBodyModel = [
        'Main',
        'Roof',
        'Mesh_Door_LH_1',
        'Hood',
        'Rear',
        'Boot',
        'Board',
        'Front',
      ];
      console.log(child.name);
      if (child.isMesh && carBodyModel.some(key => child.name.includes(key))) {
        // 创建新的材质
        // const material = new MeshStandardMaterial({
        //   color: child.material.color, // 保留原有颜色
        // //   color: bodyMaterial.color, // 保留原有颜色
        //   metalness: 0.2, // 降低金属感
        //   roughness: 0.7, // 增加粗糙度
        // });

        // 将新材质应用到网格上
        // child.material = material;
        child.material = bodyMaterial;
      }
      // 门
      if (child.name === 'Obj_Side_Doors') {
        doors = child;
      }
    });

    console.log('doors', doors);
    // console.log(gltf.scene);
    scene.add(gltf.scene);
  });
}

// 光照
function initAmbientLight() {
  const ambientLight = new AmbientLight(0xffffff, 1);
  scene.add(ambientLight);
}

// function initFloor() {
//   // 创建一个平面几何体
//   const floorGeometry = new PlaneGeometry(100, 100);
//   const material = new MeshPhysicalMaterial({
//     // 双面绘制
//     side: DoubleSide,
//     color: 0x808080,
//     metalness: 0,
//     // 粗糙度 越小越光滑
//     roughness: 0.5,
//   });
//   const mesh = new Mesh(floorGeometry, material);
//   mesh.rotation.x = Math.PI / 2;
//   scene.add(mesh);
// }

function initFloor() {
  const floorGeometry = new PlaneGeometry(100, 100);
  const material = new MeshPhysicalMaterial({
    side: DoubleSide,
    color: 0x555555, // 调暗地面颜色
    metalness: 0,
    roughness: 0.7, // 增加粗糙度,让地面不那么光滑
  });
  const mesh = new Mesh(floorGeometry, material);
  mesh.rotation.x = Math.PI / 2;
  scene.add(mesh);
}

// 聚光灯
// function initSpotLight(){
//     const spotLight = new SpotLight(0xffffff, 2);
//     spotLight.angle = Math.PI / 8; // 散射角度，跟水平线的夹角
//     spotLight.penumbra = 0.2; // 衰减程度 横向：聚光锥的半影衰减百分比
//     spotLight.decay = 2; // 衰减度 横向：聚光锥的强度衰减度
//     spotLight.distance = 100; // 聚光灯的照射距离
//     spotLight.shadow.radius = 10
//     spotLight.shadow.mapSize.set(4096, 4096) // 阴影贴图大小

//     // spotLight.position.set(15, 40, 35);
//     spotLight.position.set(100, 100, 100);
//     // 光照方向
//     spotLight.target.position.set(0, 0, 0);
//     spotLight.castShadow = true; // 产生阴影
//     scene.add(spotLight);
// }

// 调整聚光灯
// 将光源强度从 2 增加到 5,让光线更亮。
// 将聚光锥角度从 Math.PI / 8 增大到 Math.PI / 6,让光线覆盖范围更广。
// 将半影衰减程度从 0.2 减小到 0.1,让光线边缘更清晰。
// 将衰减度从 2 减小到 1,让光线衰减更平缓。
// 将照射距离从 30 增大到 50,让光线照射范围更大。
// 调整了光源位置,让它更好地照亮场景。
// 将阴影贴图分辨率从 4096x4096 增大到 2048x2048,让阴影质量更好。
// 调整了阴影近平面和远平面的值,优化了阴影的效果。
// function initSpotLight() {
//   const spotLight = new SpotLight(0xffffff); // 设置为白色光
//   spotLight.intensity = 5; // 增加光源强度
//   spotLight.angle = Math.PI / 6; // 增大聚光锥角度
//   spotLight.penumbra = 0.1; // 减小半影衰减程度
//   spotLight.decay = 1; // 减小衰减度
//   spotLight.distance = 50; // 增大照射距离

//   spotLight.position.set(10, 20, 20); // 调整光源位置
//   spotLight.target.position.set(0, 0, 0); // 调整光照方向

//   spotLight.castShadow = true; // 开启阴影投射
//   spotLight.shadow.mapSize.width = 2048; // 增大阴影贴图分辨率
//   spotLight.shadow.mapSize.height = 2048;
//   spotLight.shadow.camera.near = 1; // 调整阴影近平面
//   spotLight.shadow.camera.far = 100; // 调整阴影远平面

//   scene.add(spotLight);
// }

function initSpotLight() {
  const spotLight = new SpotLight(0xffffff);
  spotLight.intensity = 30; // 大幅增加光源强度
  spotLight.angle = Math.PI / 10; // 进一步增大聚光锥角度
  spotLight.penumbra = 0.05; // 减小半影衰减程度
  spotLight.decay = 0.8; // 减小衰减度
  spotLight.distance = 300; // 进一步增大照射距离

  spotLight.position.set(30, 40, 30); // 调整光源位置
  spotLight.target.position.set(0, 0, 0); // 调整光照方向

  spotLight.castShadow = true;
  spotLight.shadow.mapSize.width = 2048;
  spotLight.shadow.mapSize.height = 2048;
  spotLight.shadow.camera.near = 1;
  spotLight.shadow.camera.far = 150; // 进一步增大阴影远平面

  scene.add(spotLight);
}

// 圆柱体模拟展厅
function initCylinder() {
  const geometry = new CylinderGeometry(50, 50, 80, 32);
  const material = new MeshPhysicalMaterial({
    color: 0x6b6b6b,
    side: DoubleSide,
  });
  const cylinder = new Mesh(geometry, material);
  scene.add(cylinder);
}

function initGui() {
  let obj = {
    bodyColor: '#FFA500',
    doorOpen,
    doorClose,
    carIn,
    carOut,
  };
  const gui = new GUI();
  gui
    .addColor(obj, 'bodyColor')
    .name('车身颜色')
    .onChange(value => {
      bodyMaterial.color.set(value);
    });
  gui.add(obj, 'doorOpen').name('打开车门');
  gui.add(obj, 'doorClose').name('关闭车门');
  gui.add(obj, 'carIn').name('进入车辆');
  gui.add(obj, 'carOut').name('离开车辆');
}

function doorOpen() {
  setAnimateDoor({ y: 0 }, { y: -Math.PI / 3 }, doors);
}

function doorClose() {
  //   for (let index = 0; index < doors.length; index++) {
  // const element = doors[index];
  setAnimateDoor({ y: -Math.PI / 3 }, { y: 0 }, doors);
  //   }
}

function setAnimateDoor(start, end, mesh) {
  console.log(1, mesh);
  const rotationAxis = new Vector3(0, 1, 0); // 设置旋转轴在 y 轴上

  tween = new TWEEN.Tween(start).to({ y: end.y }, 2000).easing(TWEEN.Easing.Quadratic.Out);
  tween.onUpdate(that => {
    console.log(1, that.y);
    mesh.rotation.setFromVector3(rotationAxis.multiplyScalar(that.y));
  });
  tween.start();
}

// function setAnimateDoor(start, end, mesh) {
//   console.log(1, mesh, start, end);
//   const tween = new TWEEN.Tween(start)
//     .to(end, 3000)
//     .easing(TWEEN.Easing.Quadratic.Out);
//   tween.onUpdate(that => {
//     // console.log(2, that.x);
//     // mesh.rotation.x = that.x;
//     // mesh.rotation.y = that.y;
//     mesh.rotation.y = that.y;
//   });
//   tween.start();
// }

function carIn() {}

function carOut() {}

function init() {
  initScene();
  initCamera();
  initRenderer();
  initAxesHelper();
  initOrbitControls();
  initGridHelper();
  loadCarModel();
  initAmbientLight();
  initFloor();
  initSpotLight();
  initCylinder();
  initGui();
}

init();

function render(time) {
  TWEEN.update(time);
  // 使渲染器和场景以及相机进行渲染
  renderer.render(scene, camera);
  requestAnimationFrame(render);
  controls.update(); // 重新计算控制器
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
    console.log('resize');
    // 更新camera长宽比
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    // 更新渲染器长宽比
    renderer.setSize(window.innerWidth, window.innerHeight);
  }, 200)
);
