import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import { BasicCharacterController } from './charactercontrol.js'
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/GLTFLoader.js';
import { Reflector } from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/objects/Reflector.js';
import { ThirdPersonCamera } from './thirdpersoncamera.js'
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';
import { Doll } from './doll.js'
import { soundManager } from './soundManager.js';
let insetWidth, insetHeight;
let timeLeft;
var wall;
let text = document.querySelector('.text');
const startBtn = document.querySelector('.start-btn');
const soundOnbtn = document.querySelector('.soundON');
const soundOffbtn = document.querySelector('.soundOFF');
const loseMusic = new Audio('../sounds/gunshot.mp3')
class Level3 {
  constructor() {

    this.Initialize();
  }

  Initialize() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
    });
    this.dollState = new Doll('idle');
    soundManager.loadSounds();
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);


    this.scene = new THREE.Scene();
    const bgdloader = new THREE.TextureLoader();
    const bgTexture = bgdloader.load('../images/bground.jpg');
    this.scene.background = bgTexture;

    document.body.appendChild(this.renderer.domElement);
    window.addEventListener('resize', () => {
      this.
        OnWindowResize();
    }, false);
    
    

    soundOnbtn.addEventListener('click', () => {
      soundManager.backgroundLevel3Song.pause();
      soundManager.backgroundLevel3Song.play();
    })
    soundOffbtn.addEventListener('click', () => {
      soundManager.backgroundLevel3Song.pause();
    })


    const fov = 60;
    const aspect = 1920 / 1080;
    const near =1;
    const far = 1000.0;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.set(100, -600, 0);

    //top view camera
    this.cameraTop = new THREE.PerspectiveCamera(45, 60, 2, 1000);
    this.cameraTop.position.set(0, -10, 0);


    // this.mirrorcamera = new THREE.PerspectiveCamera(50,window.innerWidth / window.innerHeight,1,1000);
    // this.camera.position.set(0, 0, 500);

    this.scene.add(this.camera);
    this.scene.add(this.cameraTop);

    //adding ambient light to the scene
    var ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);

    // var pointlight = new THREE.PointLight(0xffffff, -0.001);
    // pointlight.position.set(0, 0, 200);
    // this.scene.add(pointlight);

    //directional light for character shadow
    var slight = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    slight.position.set(0, 150, 150);
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
    var glight = new THREE.DirectionalLight(0x000000, 3);
    glight.position.set(0, 40,0);
    this.scene.add(glight);

    //light shining onto front wall
    var flight = new THREE.DirectionalLight(0xffffff, 0.5);
    flight.position.set(0, 0, 300);
    this.scene.add(flight);
    
    // //light shining onto back wall
    // var flight = new THREE.DirectionalLight(0xffffff, 0.5);
    // flight.position.set(0, 0, -200);
    // this.scene.add(flight);

    //light shining onto right wall
    var rlight = new THREE.DirectionalLight(0xffffff, 0.4);
    rlight.position.set(-200, 0, 0);
    this.scene.add(rlight);

    //light shining onto left wall
    var llight = new THREE.DirectionalLight(0xffffff, 0.7);
    llight.position.set(250, 0, 0);
    this.scene.add(llight);


    this.addGround();
    this.addCheckpointLine();
    this.addTree();
    this.addSideWalls();
    this.addFrontWall();
    this.addBackWall();
    this.addreflectionwall();
    // this code adds see through(transparent) obstruction wall
    for (var i =0;i<6;i++){
      this.addObstructionkWall(-125,-150+ i*75);
      this.addObstructionkWall(0,-150+ i*75);
      this.addObstructionkWall(125,-150+ i*75);

    }
    // this code adds reflectixive/mirror windows
    this.addreflectionwall2(167,0*133);
    this.addreflectionwall2(256,0*133);
    this.addreflectionwall2(167,1*133);
    this.addreflectionwall2(256,1*133);
    
    this.LoadAnimatedModel();
    this.loadSoldierModel(-40, -38, -230);
    this.loadSoldierModel(40, -38, -230);

    

    this.mixers = [];
    this.previousRAF = null;
    this.animate();

  }
  addGround() {
    var groundTexture = new THREE.TextureLoader().load('../images/Old_Street_Pavement.jpg');
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(10, 10);
    
    var groundMaterial = new THREE.MeshStandardMaterial({ 
      map: groundTexture,
      roughness: 0.9,
      metalness: 0,
    });

    var mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(500, 600), groundMaterial);
    mesh.position.y = -40;
    mesh.rotation.x = - Math.PI / 2;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
  }
  addFrontWall() {
    const frontWallTexture = new THREE.TextureLoader().load(
      '../images/window.png',
    );
    frontWallTexture.wrapS = THREE.RepeatWrapping;
    frontWallTexture.wrapT = THREE.RepeatWrapping;
    frontWallTexture.repeat.set(3,3)
    const m = new THREE.MeshLambertMaterial({
      map: frontWallTexture,
      
    });

    const t = new THREE.Mesh(
      new THREE.BoxGeometry(500, 400, 1.5),
      m,
    );
    this.scene.add(t);
    t.position.y += 150;
    t.position.z = -300;
  }
  addBackWall() {
    const backWallTexture = new THREE.TextureLoader().load(
      '../images/red-brick.jpg',
    );
    backWallTexture.wrapS = THREE.RepeatWrapping;
    backWallTexture.wrapT = THREE.RepeatWrapping;
    backWallTexture.repeat.set(3,3)
    const m = new THREE.MeshPhongMaterial({
      refractionRatio :5, 
      map: backWallTexture,
    });

    const t = new THREE.Mesh(
      new THREE.BoxGeometry(500, 700, 2),
      m,
    );
    this.scene.add(t);
    t.position.y += 230;
    t.position.z = 300;
  }
  addObstructionkWall(positionx,Positionz) {

    const material1 = new THREE.MeshPhongMaterial({
      color: 0x000000,
      opacity: 0.4,
      transparent: true,
      side: THREE.DoubleSide
    });
    
    wall = new THREE.Mesh(
      new THREE.BoxGeometry(100, 30, 2),
      material1,
    );
    this.scene.add(wall);
    wall.position.set(positionx,-22, Positionz)
    
  }
  addreflectionwall() {

    const mirrorBack1 = new Reflector(
      new THREE.BoxGeometry(50,30,2),
      {
        color: new THREE.Color(0x888888),
        textureWidth: window.innerWidth * window.devicePixelRatio,
        textureHeight: window.innerHeight * window.devicePixelRatio
      }
    )
    mirrorBack1.position.y = -22;
    mirrorBack1.position.x = -245;
    mirrorBack1.position.z = 250;
    mirrorBack1.rotation.y = -Math.PI / 2;
    mirrorBack1.rotation.y = -Math.PI/2 ;
    mirrorBack1.rotation.y = Math.PI/2;
    this.scene.add(mirrorBack1);
    
  }
  addreflectionwall2(posx,posy) {

    const mirrorBack1 = new Reflector(
      new THREE.BoxGeometry(37,80,2),
      {
        color: new THREE.Color(0x888888),
        textureWidth: window.innerWidth * window.devicePixelRatio,
        textureHeight: window.innerHeight * window.devicePixelRatio
      }
    )
    mirrorBack1.position.x = -217 + posx;
    mirrorBack1.position.y = 8 + posy;
    mirrorBack1.position.z = -300;
    // mirrorBack1.rotation.y = Math.PI / 2;
    // mirrorBack1.rotation.y = Math.PI ;

    this.scene.add(mirrorBack1);
    
  }
  
  addSideWalls() {
    const sideWallsTexture = new THREE.TextureLoader().load(
      '../images/red-brick.jpg',
    );
    sideWallsTexture.wrapS = THREE.RepeatWrapping;
    sideWallsTexture.wrapT = THREE.RepeatWrapping;
    sideWallsTexture.repeat.set(10,7)
    const sideWallsMaterial = new THREE.MeshStandardMaterial({
      // specular: 0xF3FFE2,
      roughness: 0.4,
      metalness: 0.2,
      map: sideWallsTexture,
    });
    
    const leftWall = new THREE.Mesh(
      new THREE.BoxGeometry(600, 400, 2),
      sideWallsMaterial,
    );
    leftWall.position.x = -250;
    leftWall.position.y += 150;
    leftWall.rotateY(Math.PI / 2);
    this.scene.add(leftWall);

    const rightWall = new THREE.Mesh(
      new THREE.BoxGeometry(600, 400, 2),
      sideWallsMaterial,
    );
    rightWall.position.x = 250;
    rightWall.position.y += 150;
    rightWall.rotateY(Math.PI / 2);
    this.scene.add(rightWall);
  }
  
  
  
  addTree() {
    const loader = new GLTFLoader()
    loader.load("../models/oldTree/scene.gltf", (gltf) => {
      gltf.scene.traverse(c => {
        c.castShadow = true;
      });
      gltf.scene.position.set(0, -50 -250);
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
      });
      gltf.scene.position.set(0, -20, -230);
      gltf.scene.scale.set(4, 4, 4);
      this.scene.add(gltf.scene);
      this.doll = gltf.scene;
    })
    return this.doll;
  }
  async loadSoldierModel(x, y, z) {
    const loader = new GLTFLoader();
    await loader.load("../models/soldier/scene.gltf", (gltf) => {
      gltf.scene.traverse(c => {
        c.castShadow = true;
      });
      gltf.scene.position.set(x,y,z);
      gltf.scene.scale.set(13,13,13);
      this.scene.add(gltf.scene);
    });
      }

  gameLogic() {
    setTimeout(() => {
      startBtn.innerText = "start"

    }, 8000);
    setTimeout(() => {
      startBtn.addEventListener('click', () => {
        if (startBtn.innerText == "START") {
          document.querySelector('.modal').style.display = "none";
          const loadingScreen = document.querySelector('.loading-screen');
          loadingScreen.classList.add('fade-out');
          loadingScreen.addEventListener('transitionend', this.onTransitionEnd);
          loadingScreen.style.display = "none";
          this.timer();
        }
      })
    }, 1000);
  }
  async lookBackward() {
    gsap.to(this.doll.rotation, { y: -3.15, duration: 2 });
    await this.delay(500);
    this.dollState.setState('green');
    text.style.color = "#0f0";
  }

  async lookForward() {
    gsap.to(this.doll.rotation, { y: 0, duration: 2 })
    await this.delay(1300);
    this.dollState.setState('red');
    text.style.color = '#f00';

  }
  async moveright(){
    
  }

  async start() {
    this.lookBackward();
    await this.delay((Math.random() * 1000) + 5000);
    this.lookForward();
    await this.delay((Math.random() * 1000) + 5000);
    this.start();
  }

  async timer() {
    await this.delay(1000)
    text.innerText = "Starting in 5"
    await this.delay(1000)
    text.innerText = "Starting in 4"
    await this.delay(1000)
    text.innerText = "Starting in 3"
    await this.delay(1000)
    text.innerText = "Starting in 2"
    await this.delay(1000)
    text.innerText = "Starting in 1"
    await this.delay(1000)
    this.start();
    for (let i = 50; i >= 0; i--) {
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

    insetWidth = window.innerWidth / 4;
    insetHeight = window.innerHeight / 4;

    this.cameraTop.aspect = insetWidth / insetHeight;
    this.cameraTop.updateProjectionMatrix();
  }

  async check() {
    if (this.dollState.getState() == 'red' && (this.playerControls.State == 'walk' || this.playerControls.State == 'run' || this.playerControls.State == 'dance')) {
      
      loseMusic.play();
      await this.delay(2000);

      window.location.replace("../html/losescreen3.html");
    }
    if (timeLeft == 0 && this.playerControls._position.z > -200) {
      loseMusic.play();
      await this.delay(2000);
      
      window.location.replace("../html/losescreen3.html");
    }
    if (this.timeLeft != 0 && this.playerControls._position.z <= -200) {
      window.location.replace("../html/winScreen3.html");
    }
  }
  
  animate() {
    requestAnimationFrame((t) => {
      if (this.previousRAF === null) {
        this.previousRAF = t;
      }
      // wall.position.set(new THREE.Vector3( 0, -45, 250));
      // console.log(wall.position.x);
      this.check();
      this.OnWindowResize();
      this.animate();
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
  APP = new Level3();
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



