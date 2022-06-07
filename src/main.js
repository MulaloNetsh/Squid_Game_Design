import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import { BasicCharacterController } from './charactercontrol.js'
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/GLTFLoader.js';
import { Reflector } from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/objects/Reflector.js';
import { ThirdPersonCamera } from './thirdpersoncamera.js'
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';
import { Doll } from './doll.js'
import { soundManager } from './soundManager.js';
import { ReinhardToneMapping } from '../modules/three.module.js';
let insetWidth, insetHeight;
let timeLeft;
let dollLight;
let text = document.querySelector('.text');
const startBtn = document.querySelector('.start-btn');
const soundOnbtn = document.querySelector('.soundON');
const soundOffbtn = document.querySelector('.soundOFF');
let uniforms = {};
uniforms.colorA = { type: 'vec3', value: new THREE.Color(0x98a3d4) }
uniforms.colorB = { type: 'vec3', value: new THREE.Color(0x3690e3) }

function vertexShader() {
  return `
    varying vec3 vUv; 

    void main() {
      vUv = position; 

      vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * modelViewPosition; 
    }
  `
}
function fragmentShader() {
  return `
      uniform vec3 colorA; 
      uniform vec3 colorB; 
      varying vec3 vUv;

      void main() {
        gl_FragColor = vec4(mix(colorA, colorB, vUv.z), 1.0);
      }
  `
}


class Level1 {
  constructor() {

    this.Initialize();
  }

  Initialize() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
    });
    this.dollState = new Doll('idle');
    soundManager.loadSounds();
    this.renderer.outputEncoding = THREE.sRGBEncoding; //render convert the final color value in the fragment shaders from linear to sRGB color space
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.scene = new THREE.Scene();


    document.body.appendChild(this.renderer.domElement);
    window.addEventListener('resize', () => {
      this.
        OnWindowResize();
    }, false);

    //if soundOn button is click the sound background sound is played
    soundOnbtn.addEventListener('click', () => {
      soundManager.backgroundSong.pause();
      soundManager.backgroundSong.play();
    })
    //if soundOff button is click the sound background sound is switched off
    soundOffbtn.addEventListener('click', () => {
      soundManager.backgroundSong.pause();
    })
    const fov = 60;
    const aspect = 1920 / 1080;
    const near = 1.0;
    const far = 1000.0;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.set(0, -100, 0);

    //top view & Orbit Controls Camera
    this.cameraTop = new THREE.PerspectiveCamera(45, 60, 2, 1000);
    this.cameraTop.position.set(30, 250, 500);

    //adds both camera to the scene
    this.scene.add(this.camera);
    this.scene.add(this.cameraTop);

    //add skybox jpg images on xn,xp,yn,yp,zn,zp
    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
      '../skybox1/posx.jpg',
      '../skybox1/negx.jpg',
      '../skybox1/posy.jpg',
      '../skybox1/negy.jpg',
      '../skybox1/posz.jpg',
      '../skybox1/negz.jpg',
    ]);
    this.scene.background = texture;

    //set new OrbitControls(creates camera control)
    //set the vector of the topCamera(the one on the top right corner)
    this.controls = new OrbitControls(
      this.cameraTop, this.renderer.domElement);
    this.controls.target.set(0, 100, -100);
    this.controls.update();


    //adding ambient light to the scene
    var ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    //white spotlight shine on the doll
    //cast dynamic shadow
    dollLight = new THREE.SpotLight(0xff0000, 4);
    dollLight.castShadow = true;
    dollLight.shadow.bias = -0.0001;
    dollLight.distance = 250;
    dollLight.shadow.mapSize.width = 1024 * 4;
    dollLight.shadow.mapSize.height = 1024 * 4;
    dollLight.position.set(0, 200, -240);
    this.scene.add(dollLight);

    //directional light from behind doll 
    var slight = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    slight.position.set(0, 150, -200);
    slight.castShadow = true;
    slight.shadow.bias = -0.001;
    slight.shadow.mapSize.width = 4096;
    slight.shadow.mapSize.height = 4096;
    slight.shadow.camera.near = 1.0;
    slight.shadow.camera.far = 1000;
    slight.shadow.camera.left = 400;
    slight.shadow.camera.right = -400;
    slight.shadow.camera.top = 300;
    slight.shadow.camera.bottom = -300;
    this.scene.add(slight);

    //light shining directly onto ground
    //set it position, shines at 0.7 intensity from it position
    var glight = new THREE.DirectionalLight(0xffffff, 0.5);
    glight.position.set(0, 200, 0);
    this.scene.add(glight);

    //light shining onto front wall
    var flight = new THREE.DirectionalLight(0xffffff, 0.7);
    flight.position.set(0, 0, 300);
    this.scene.add(flight);

    //light shining onto right wall
    //set it position, shines at 0.7 intensity from it position
    var rlight = new THREE.DirectionalLight(0xffffff, 0.7);
    rlight.position.set(-250, 0, 0);
    this.scene.add(rlight);

    //light shining onto left wall
    //set it position, shines at 0.7 intensity from it position
    var llight = new THREE.DirectionalLight(0xffffff, 0.7);
    llight.position.set(250, 0, 0);
    this.scene.add(llight);

    //add fog of color white 
    this.scene.fog = new THREE.Fog(0x000000, 0.015, 1);
   
    this.addGround();
    this.addWalls();
    this.addCheckpointLine();
    this.addTree();
    this.LoadAnimatedModel();
    this.loadSoldierModel(-40, -38, -230);
    this.loadSoldierModel(40, -38, -230);
    this.addStreetLights();


    this.mixers = [];
    this.previousRAF = null;
    this.animate();

    

  }

  addGround() {
    var groundTexture = new THREE.TextureLoader().load('../images/level1Ground.jpg');
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(10, 30);

    var groundMaterial = new THREE.MeshStandardMaterial({ map: groundTexture });

    var mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(500, 600), groundMaterial);
    mesh.position.y = -40;
    mesh.rotation.x = - Math.PI / 2;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
  }

  addWalls() {
    this.addFrontWall();
    this.addBackWall();
    this.addLeftWall();
    this.addRightWall();
  }
  buildWall(length) {
    const frontWallTexture = new THREE.TextureLoader().load(
      '../images/SideWalls.jpg',
    );
    const material = new THREE.MeshLambertMaterial({
      map: frontWallTexture,
    });

    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(length, 100, 2),
      material,
    );
    wall.receiveShadow = true;
    return wall;
  }
  addFrontWall() {
    const wall = this.buildWall(500);
    wall.position.y += 5;
    wall.position.z = -300;
    this.scene.add(wall);
  }
  addBackWall() {
    const wall = this.buildWall(500);
    wall.position.y += 5;
    wall.position.z = 300;
    this.scene.add(wall);
  }
  addLeftWall() {
    const wall = this.buildWall(600);
    wall.position.x = -250;
    wall.position.y += 5;
    wall.rotateY(Math.PI / 2);
    this.scene.add(wall);
  }
  addRightWall() {
    const wall = this.buildWall(600);
    wall.position.x = 250;
    wall.position.y += 5;
    wall.rotateY(Math.PI / 2);
    this.scene.add(wall);
  }

  addTree() {
    const loader = new GLTFLoader()
    loader.load("../models/oldTree/scene.gltf", (gltf) => {
      gltf.scene.traverse(c => {
        c.castShadow = true;
      });
      gltf.scene.position.set(0, -38, -250);
      gltf.scene.scale.set(13, 13, 13);
      this.scene.add(gltf.scene);

    })
  }
  addCheckpointLine() {
    const mirrorBack1 = new Reflector(
      new THREE.PlaneBufferGeometry(500, 4),
      {
        color: new THREE.Color(0x00ffff),
        textureWidth: window.innerWidth * window.devicePixelRatio,
        textureHeight: window.innerHeight * window.devicePixelRatio
      }
    )
    mirrorBack1.position.y = -28;
    mirrorBack1.position.z = -200;
    this.scene.add(mirrorBack1);
  }

  LoadAnimatedModel() {
    this.doll = this.loadDoll();
    const params = {
      camera: this.camera,
      scene: this.scene,
    }
    this.playerControls = new BasicCharacterController(params);
    this._thirdPersonCamera = new ThirdPersonCamera({
      camera: this.camera,
      target: this.playerControls,
    });
    this.gameLogic();
  }
  async loadDoll() {
    const loader = new GLTFLoader();
    await loader.load("../models/doll/scene.gltf", (gltf) => {
      gltf.scene.traverse(c => {
        c.castShadow = true;
        c.receiveShadow = true;
      });
      gltf.scene.position.set(0, -20, -230);
      gltf.scene.scale.set(4, 4, 4);
      this.scene.add(gltf.scene);
      this.doll = gltf.scene;
    })
  }
  buildStreetPole() {
    const geometry = new THREE.CylinderGeometry(1, 1, 20, 32);
    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      fragmentShader: fragmentShader(),
      vertexShader: vertexShader(),
    })
    const pole = new THREE.Mesh(geometry, material);
    pole.castShadow = true;
    pole.scale.set(1, 2, 1);
    return pole;
  }
  buildStreetLightBulb() {
    var pointLight = new THREE.PointLight(0xffffff, 0.02);
    pointLight.add(
      new THREE.Mesh(new THREE.SphereGeometry(2,4,8), 
      new THREE.MeshPhongMaterial({
        color: 0x000000,
        specular:0x666666,
        emissive: 0xFF8C00,
        shininess: 10,
        opacity:0.9,
        transparent: true})))
    return pointLight;
  }


  buildStreetLight(x, z) {
    const streetLight = new THREE.Group();
    let pole = this.buildStreetPole()
    let lightBulb = this.buildStreetLightBulb();
    streetLight.add(pole);
    lightBulb.position.set(0, 20, 0);
    streetLight.add(lightBulb);
    this.scene.add(streetLight);
    streetLight.position.set(x, -20, z);
  }

  addStreetLights() {
    let z = 250;
    for (var i = 0; i < 10; i++) {
      this.buildStreetLight(-200, z);
      z = z - 50;
    }
    z = 250
    for (var i = 0; i < 10; i++) {
      this.buildStreetLight(200, z);
      z = z - 50;
    }
  }

  async loadSoldierModel(x, y, z) {
    //loads the soldier model to the scene
    //adds its shadow
    //adds set it position and scale it,then adds on the scene
    const loader = new GLTFLoader();
    await loader.load("../models/soldier/scene.gltf", (gltf) => {
      gltf.scene.traverse(c => {
        c.castShadow = true;
        c.receiveShadow = true;
      });
      gltf.scene.position.set(x, y, z);
      gltf.scene.scale.set(13, 13, 13);
      this.scene.add(gltf.scene);
    });
  }

  gameLogic() {
    setTimeout(() => {
      startBtn.innerText = "start"

    }, 12000);
    setTimeout(() => {
      startBtn.addEventListener('click', () => {
        if (startBtn.innerText == "START") {
          document.querySelector('.modal').style.display = "none";
          const loadingScreen = document.querySelector('.loading-screen')
          loadingScreen.classList.add('fade-out');
          loadingScreen.addEventListener('transitionend', this.onTransitionEnd);
          loadingScreen.style.display = "none";
          this.timer();
        }
      })
    }, 2000);
  }
  async lookBackward() {
    //rotate the doll to look backward and set the doll stae to "green"
    gsap.to(this.doll.rotation, { y: -3.15, duration: 2 });
    await this.delay(500);
    this.dollState.setState('green');
    text.style.color = "#0f0";
  }

  async lookForward() {
    //rotate the doll to look forward and set the doll stae to "red"
    gsap.to(this.doll.rotation, { y: 0, duration: 2 })
    await this.delay(1300);
    this.dollState.setState('red');
    text.style.color = '#f00';

  }

  async start() {
    this.lookBackward();
    await this.delay((Math.random() * 1000) + 5000);
    this.lookForward();
    await this.delay((Math.random() * 1000) + 5000);
    this.start();
  }

  async timer() {
    soundManager.backgroundSong.play();
    await this.delay(5000)
    text.innerText = "Starting in 5"
    this.scene.fog.far = 10;
    await this.delay(1000)
    text.innerText = "Starting in 4"
    this.scene.fog.far = 50;
    await this.delay(1000)
    text.innerText = "Starting in 3"
    this.scene.fog.far = 100;
    await this.delay(1000)
    text.innerText = "Starting in 2"
    this.scene.fog.far = 1000;
    await this.delay(1000)
    text.innerText = "Starting in 1"
    this.scene.fog.far = 10000;
    await this.delay(1000)
    this.start();
    for (let i = 120; i >= 0; i--) {
      text.innerText = (i + " : Seconds Left");
      timeLeft = i;
      await this.delay(1000)
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  OnWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    insetWidth = window.innerWidth / 3;
    insetHeight = window.innerHeight / 3;

    this.cameraTop.aspect = insetWidth / insetHeight;
    this.cameraTop.updateProjectionMatrix();
  }

  check() {
    if (this.dollState.getState() == 'red' && (this.playerControls.State == 'walk' || this.playerControls.State == 'run' || this.playerControls.State == 'dance')) {
      window.location.replace("../html/loseScreen.html");
    }
    if (timeLeft == 0 && this.playerControls._position.z > -200) {
      window.location.replace("../html/loseScreen.html");
    }
    if (this.timeLeft != 0 && this.playerControls._position.z <= -200) {
      window.location.replace("../html/winScreen.html");
    }
  }
  animate() {
    requestAnimationFrame((t) => {
      if (this.previousRAF === null) {
        this.previousRAF = t;
      }

      this.animate();


      this.check();
      this.OnWindowResize();
      this.renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
      this.renderer.render(this.scene, this.camera);
      this.Step(t - this.previousRAF);
      this.previousRAF = t;

      this.renderer.clearDepth();
      this.renderer.setScissorTest(true);

      this.renderer.setScissor(
        window.innerWidth - insetWidth - 16,
        window.innerHeight - insetHeight - 16,
        insetWidth,
        insetHeight
      );
      this.renderer.setViewport(
        window.innerWidth - insetWidth - 16,
        window.innerHeight - insetHeight - 16,
        insetWidth,
        insetHeight
      );
      this.renderer.render(this.scene, this.cameraTop);
      this.renderer.setScissorTest(false);

    });
  }
  Step(timeElapsed) {
    const timeElapsedS = timeElapsed * 0.001;
    if (this.mixers) {
      this.mixers.map(m => m.update(timeElapsedS));
    }

    if (this.playerControls) {
      this.playerControls.Update(timeElapsedS);
    }

    this._thirdPersonCamera.Update(timeElapsedS);
  }
}
let APP = null;
window.addEventListener('DOMContentLoaded', () => {
  APP = new Level1();
});
function _LerpOverFrames(frames, t) {
  const s = new THREE.Vector3(0, 0, 0);
  const e = new THREE.Vector3(100, 0, 0);
  const c = s.clone();

  for (let i = 0; i < frames; i++) {
    c.lerp(e, t);
  }
  return c;
}

function _TestLerp(t1, t2) {
  const v1 = _LerpOverFrames(100, t1);
  const v2 = _LerpOverFrames(50, t2);
  console.log(v1.x + ' | ' + v2.x);
}

_TestLerp(0.01, 0.01);
_TestLerp(1.0 / 100.0, 1.0 / 50.0);
_TestLerp(1.0 - Math.pow(0.3, 1.0 / 100.0),
  1.0 - Math.pow(0.3, 1.0 / 50.0));

