import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import { BasicCharacterController } from './charactercontrol.js'
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/GLTFLoader.js';
import { Reflector } from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/objects/Reflector.js';
import { ThirdPersonCamera } from './thirdpersoncamera.js'
import { Doll } from './doll.js'
let insetWidth, insetHeight;
let pointLight;
const objects = [];
let timeLeft;
let text = document.querySelector('.text');
const startBtn = document.querySelector('.start-btn');
class Level1 {
  constructor() {

    this.Initialize();
  }

  Initialize() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
    });
    this.dollState = new Doll('idle');

    this.renderer.outputEncoding = THREE.sRGBEncoding;
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



    const fov = 60;
    const aspect = 1920 / 1080;
    const near = 1.0;
    const far = 1000.0;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.set(100, -100, 0);

    //top view camera
    this.cameraTop = new THREE.PerspectiveCamera(45, 60, 2, 1000);
    this.cameraTop.position.set(0, 10, 0);


    this.scene.add(this.camera);
    this.scene.add(this.cameraTop);

    //adding ambient light to the scene
    var ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);


    //directional light for character shadow
    var slight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
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

    //light shining onto front wall
    var flight = new THREE.DirectionalLight(0xffffff, 0.7);
    flight.position.set(0, 0, 300);
    this.scene.add(flight);

    //light shining onto right wall
    var rlight = new THREE.DirectionalLight(0xffffff, 0.7);
    rlight.position.set(-250, 0, 0);
    this.scene.add(rlight);

    //light shining onto left wall
    var llight = new THREE.DirectionalLight(0xffffff, 0.7);
    llight.position.set(250, 0, 0);
    this.scene.add(llight);

    this.addGround();
    //this.addBall();
    this.addCheckpointLine();
    this.addPiggyBank();
    this.addStatue();
    this.addMasks();
    this.addLeadMask();
    this.addHorseStatue();
    this.addTree();
    this.addSideWalls();
    this.addFrontWall();
    this.addBackWall();
    this.LoadAnimatedModel();
    this.loadSoldierModel(-40, -38, -230);
    this.loadSoldierModel(40, -38, -230);
    this.mixers = [];
    this.previousRAF = null;
    this.animate();


  }

  addBall() {
    pointLight = new THREE.PointLight( 0xffffff,0.1 );
		this.scene.add( pointLight );
    pointLight.position.x=10;
    pointLight.position.y=-20;
    pointLight.position.z=200;
	  pointLight.add( new THREE.Mesh( new THREE.SphereGeometry( 4, 8, 8 ), new THREE.MeshNormalMaterial( {emissive: 0xff0000,flatShading: false, blending: THREE.AdditiveBlending} ) ) );
    
  }
  addGround() {
    var groundTexture = new THREE.TextureLoader().load('../images/level2wall.jpg');
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(100, 100);

    var groundMaterial = new THREE.MeshStandardMaterial({ map: groundTexture });

    var mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(500, 600), groundMaterial);
    mesh.position.y = -40;
    mesh.rotation.x = - Math.PI / 2;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
  }
  addFrontWall() {
    const frontWallTexture = new THREE.TextureLoader().load(
      '../images/level2wall.jpg',
    );
    const m = new THREE.MeshLambertMaterial({
      map: frontWallTexture,
    });

    const t = new THREE.Mesh(
      new THREE.BoxGeometry(500, 100, 2),
      m,
    );
    this.scene.add(t);
    t.position.y += 5;
    t.position.z = -300;
  }
  addBackWall() {
    const frontWallTexture = new THREE.TextureLoader().load(
      '../images/level2wall.jpg',
    );
    const m = new THREE.MeshLambertMaterial({
      map: frontWallTexture,
    });

    const t = new THREE.Mesh(
      new THREE.BoxGeometry(500, 100, 2),
      m,
    );
    this.scene.add(t);
    t.position.y += 5;
    t.position.z = 300;
  }
  addSideWalls() {
    const sideWallsTexture = new THREE.TextureLoader().load(
      '../images/level2wall.jpg',
    );
    const sideWallsMaterial = new THREE.MeshLambertMaterial({
      map: sideWallsTexture,
    });
    const leftWall = new THREE.Mesh(
      new THREE.BoxGeometry(600, 100, 2),
      sideWallsMaterial,
    );
    leftWall.position.x = -250;
    leftWall.position.y += 5;
    leftWall.rotateY(Math.PI / 2);
    this.scene.add(leftWall);

    const rightWall = new THREE.Mesh(
      new THREE.BoxGeometry(600, 100, 2),
      sideWallsMaterial,
    );
    rightWall.position.x = 250;
    rightWall.position.y += 5;
    rightWall.rotateY(Math.PI / 2);
    this.scene.add(rightWall);
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
  async addPiggyBank()
  {
    const loader = new GLTFLoader();
    await loader.load("../models/piggybank/scene.gltf", (gltf) => {
      gltf.scene.traverse(c => {
        c.castShadow = true;
      });
    gltf.scene.position.set(15, 50, 50);
     gltf.scene.scale.set(30,30,30);
      this.scene.add(gltf.scene);
    })
  }
  async addStatue()
  {
    const loader = new GLTFLoader();
    await loader.load("../models/statue/scene.gltf", (gltf) => {
      gltf.scene.traverse(c => {
        c.castShadow = true;
      });
    gltf.scene.position.set(-210, -25, 250);
    gltf.scene.scale.set(40,40,40);
    gltf.scene.rotation.y=-4;
      this.scene.add(gltf.scene);
    })
  }
  async addMasks()
  {
    const loader = new GLTFLoader();
    await loader.load("../models/allmasks/scene.gltf", (gltf) => {
      gltf.scene.traverse(c => {
        c.castShadow = true;
      });
    gltf.scene.position.set(-250, -25, 150);
    gltf.scene.scale.set(3,3,3);
      this.scene.add(gltf.scene);
    })
  }
  async addLeadMask()
  {
    const loader = new GLTFLoader();
    await loader.load("../models/leadMask/scene.gltf", (gltf) => {
      gltf.scene.traverse(c => {
        c.castShadow = true;
      });
    gltf.scene.position.set(200, -10, 0);
    gltf.scene.scale.set(10,10,10);
      this.scene.add(gltf.scene);
    })
  }

  async addHorseStatue()
  {
    const loader = new GLTFLoader();
    await loader.load("../models/horse/scene.gltf", (gltf) => {
      gltf.scene.traverse(c => {
        c.castShadow = true;
      });
      gltf.scene.position.set(-250, -25, 0);
    gltf.scene.scale.set(0.1,0.1,0.1);
    gltf.scene.rotation.y=10;
      this.scene.add(gltf.scene);
    })
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
          this.timer();
        }
      })
    }, 1000);
  }
  async lookBackward() {
    gsap.to(this.doll.rotation, { y: -3.15, duration: 1 });
    await this.delay(200);
    this.dollState.setState('green');
    text.style.color = "#0f0";
  }

  async lookForward() {
    gsap.to(this.doll.rotation, { y: 0, duration: 1 })
    await this.delay(300);
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
    for (let i = 60; i >= 0; i--) {
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

  check() {
    if (this.dollState.getState() == 'red' && (this.playerControls.State == 'walk' || this.playerControls.State == 'run' || this.playerControls.State == 'dance')) {
      window.location.replace("../html/loseScreen.html");
    }
    if (timeLeft == 0 && this.playerControls._position.z > -200) {
      window.location.replace("../html/loseScreen.html");
    }
    if (this.timeLeft != 0 && this.playerControls._position.z <=-200) {
      window.location.replace("../html/winScreen.html");
    }
  }
  animate() {
    requestAnimationFrame((t) => {
      if (this.previousRAF === null) {
        this.previousRAF = t;
      }
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

