// Import modules (my work)
import * as THREE from './build/three.module.js';
import Stats from './libs/stats.module.js';
import { OrbitControls } from './controls/OrbitControls.js';
import { Water } from './objects/Water2.js';
import TWEEN from './libs/tween.module.js';
import { GUI } from './libs/lil-gui.module.min.js';  // lib for control menu
import { createMultiMaterialObject } from './utils/SceneUtils.js';
import { GLTFLoader } from './loaders/GLTFLoader.js';

 // Global variables
const mainContainer = document.getElementById('webgl-scene');
const fpsContainer = document.getElementById('fps');
let stats = null;
let scene, camera, renderer = null;
let camControls = null;

let plane, house,tree = null;
let water, wheel,  ghost,  spider = null;
let bottom_car, top_car, wheel_1, wheel_2, wheel_3, wheel_4, light_front1, light_front2, light_back1, light_back2, front_car = null;



// Light sources
let dirLight, spotLight, ambientLight = null;

// PointerLock params

let instructions = null;
let controlsEnabled = false;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;
let time = 0;
let delta = 0;
let prevTime = performance.now();
let velocity = 0;
let havePointerLock = null;


//needed for model
let dodgeModel ;
let carLight;
let mixers = [];
const clock = new THREE.Clock();



let sound, sound_2, audioLoader, listener;
function createSound() {
	listener = new THREE.AudioListener();
	camera.add(listener);

	sound = new THREE.Audio(listener);
	audioLoader = new THREE.AudioLoader();
	audioLoader.load('sounds/background_music.mp3', function (buffer) {
		sound.setBuffer(buffer);
		sound.setLoop(true);
		sound.setVolume(0.5);
		if (carControlParams.soundon) {
            sound.play();
        }
    });
}

function createWater_Sound() {
	listener = new THREE.AudioListener();
	camera.add(listener);

	sound_2 = new THREE.Audio(listener);
	audioLoader = new THREE.AudioLoader();
	audioLoader.load('sounds/water.mp3', function (buffer) {
		sound_2.setBuffer(buffer);
		sound_2.setVolume(0.3);
		sound_2.play();
    });
}

function toggleSound() {
    if (carControlParams.soundon) {
        sound.play();
    } else {
        sound.stop();
    }
}


function createScene(){
	scene = new THREE.Scene();
	//const background2 = new THREE.TextureLoader().load( 'textures/forest full.jpg' );
	//background2.colorSpace = THREE.SRGBColorSpace;
	//let skyGeometry = new THREE.SphereGeometry(110, 32, 32);
	//let skyMaterial = new THREE.MeshBasicMaterial({ map: background2, side: THREE.BackSide });
  	//let skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
	//skyBox.position.y=50;
  	//scene.add(skyBox);

	const background2 = new THREE.TextureLoader().load( 'textures/f1.jpg' );
	background2.colorSpace = THREE.SRGBColorSpace;
	let skyGeometry = new THREE.SphereGeometry(130, 45, 45);
	let skyMaterial = new THREE.MeshBasicMaterial({ map: background2, side: THREE.BackSide });
	let skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
	skyBox.position.y=30;
	scene.add(skyBox);
}
	



// FPS counter
function createStats(){
  stats = new Stats();
  stats.showPanel( 0 );	// 0: fps, 1: ms, 2: mb, 3+: custom
  fpsContainer.appendChild( stats.dom );
}

// Camera
function createPerspectiveCamera(){
  const fov = 45;
  const aspect =  mainContainer.clientWidth / mainContainer.clientHeight;
  const near = 0.1;
  const far = 1000;	// meters
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  // set camera position and target it to the center of the scene
  // notice the way of passing params
  // camera.position.set( 0, 0, 10 );
  camera.position.x = 40;
  camera.position.y = 50;
  camera.position.z = -100;
  //camera.lookAt(new THREE.Vector3(0, 20, 0));
}


// Interactive controls
function createControls() {
    camControls = new OrbitControls(camera, mainContainer);
    camControls.autoRotate = false;

  
}


// Create directional - sun light
function createDirectionalLight(){
  dirLight = new THREE.DirectionalLight( 0xffffff);
  dirLight.position.set( 100, 200, 100 );
  dirLight.intensity = 2.5;
  dirLight.shadow.camera.near = 0.5;      
  dirLight.shadow.camera.far = 300;      	
  dirLight.shadow.camera.left = -100;
  dirLight.shadow.camera.top = 100;
  dirLight.shadow.camera.right = 100;
  dirLight.shadow.camera.bottom = -100;
 
  dirLight.shadow.mapSize.width = 2048;  	
  dirLight.shadow.mapSize.height = 2048; 	
  dirLight.castShadow = true;
  scene.add( dirLight );

  
}

// Create spot - lamp light 
function createSpotLight(){
  spotLight = new THREE.SpotLight( 0xffffff );
  spotLight.position.set( -50, 50, 30 );
  spotLight.intensity = 3;
  spotLight.distance = 150;
  spotLight.angle = Math.PI/6;
  spotLight.penumbra = 0.3; 	
  spotLight.decay = 0.5; 		
  spotLight.shadow.mapSize.width = 1024; 
  spotLight.shadow.mapSize.height = 1024;	
  // enable shadows for light source
  spotLight.castShadow = true;
  spotLight.target.position.set(0, 20, 0);
  spotLight.target.updateMatrixWorld();

  scene.add( spotLight );
  scene.add(spotLight.target);
}

// Create ambient light
function createAmbientLight(){
  ambientLight = new THREE.AmbientLight( 0xffffff, 0.3 );
  scene.add( ambientLight );
}

// add axes (red – x, green – y, blue - z)
function createAxes(){
  const axes = new THREE.AxesHelper( 10 );
  scene.add(axes);
}




function createPumpkin() {
	const pumpkinTexture = new THREE.TextureLoader().load("textures/pumpkin.png");
    pumpkinTexture.colorSpace = THREE.SRGBColorSpace;
	const material = new THREE.SpriteMaterial({
        map: pumpkinTexture,
        transparent: true,
		opacity:  menuParams.pumpkinOpacity
	});
	pumpkinSprite = new THREE.Sprite(material);
    pumpkinSprite.scale.set(menuParams.pumpkinScale, menuParams.pumpkinScale, 1);
	pumpkinSprite.position.set(11, 3.5, -33); 

	scene.add(pumpkinSprite);    
}

function createSpider() {
    const texture = new THREE.TextureLoader().load("textures/spider.png");
    texture.colorSpace = THREE.SRGBColorSpace;
    
    const material = new THREE.SpriteMaterial({ map: texture,color: 0x0a0a0a, transparent: true, opacity: 1 });
    spider = new THREE.Sprite(material);
	spider.scale.set(2, 2, 1);
	spider.position.set(-2, 25, -22);
	scene.add(spider);

	const moveSpeed = 1;
	const minY = 34;
	const maxY = 38;
	let direction = 1;
	function animateSpider() {
        spider.position.y += moveSpeed * direction * 0.01; 

		if (spider.position.y > maxY) {
			direction = -1; } else if (spider.position.y < minY) {
				direction = 1; }

				requestAnimationFrame(animateSpider); }

				animateSpider();
			}

function createSpiderWeb() {
    const texture = new THREE.TextureLoader().load("textures/cobweb.png"); // Загрузка текстуры паутинки
    texture.colorSpace = THREE.SRGBColorSpace;
    const geometry = new THREE.PlaneGeometry(10, 8);

	const material = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
		opacity: 0.8,
		side: THREE.DoubleSide

	});
	const spiderWeb = new THREE.Mesh(geometry, material);
	spiderWeb.rotation.x = -Math.PI / 2; 
	spiderWeb.position.set(2, 35, -21.5); 
	spiderWeb.rotation.x = Math.PI / 8;
	spiderWeb.rotation.z = Math.PI / 14;
	scene.add(spiderWeb);
}




function createGhost(){
	const texture= new THREE.TextureLoader().load("textures/ghost.png");
	texture.colorSpace= THREE.SRGBColorSpace;
	const material= new THREE.SpriteMaterial({map : texture});
	ghost= new THREE.Sprite(material);
	ghost.position.y += 10; // Move up
	if (ghost.position.y > 10) ghost.position.y = 0;
	ghost.scale.set(15, 20);
	ghost.position.set(45, 15, -10);

	const ghostStartZ = ghost.position.z;
	const ghostEndZ = ghostStartZ + 50;

	let swayTween = new TWEEN.Tween(ghost.position)
	.to({ z: ghostEndZ }, 8000)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .yoyo(true)
	.repeat(Infinity)
    .start();	
	
	scene.add(ghost);
	swayTween.start();
}


function createTree1() {
	const texture = new THREE.TextureLoader().load("textures/tree1.png");
	 texture.colorSpace= THREE.SRGBColorSpace;
	 const numberOfTrees = 10;
	 const spacing = 10;

	 for (let i = 0; i < numberOfTrees; i++) {
        const material = new THREE.SpriteMaterial({ map: texture, color: 0x1c5c24 });
        const tree = new THREE.Sprite(material); 
        tree.scale.set(15, 20);
		tree.position.set(62, 8.8, 35 - i * spacing);
  
	let swayTween = new TWEEN.Tween({ x: tree.position.x })
	  .to({ x: tree.position.x + 0.5 }, 5000)
	  .easing(TWEEN.Easing.Quadratic.InOut)
	  .onUpdate(function (object) {
		tree.position.x = object.x;
	  })
	  .yoyo(true)
	  .repeat(Infinity)
	  .start();
  
	scene.add(tree);
  }
}


function createTree(){
const texture= new THREE.TextureLoader().load("textures/mushroom.png");
 texture.colorSpace= THREE.SRGBColorSpace;
 const material= new THREE.SpriteMaterial({map : texture, color: 0xffffff});
 tree= new THREE.Sprite(material);
 tree.position.y += 0.5; // Move up
 if (tree.position.y > 5) tree.position.y = 0;
 tree.scale.set(3,3,4);
 tree.position.set(26, 1.5, -16);
 scene.add(tree);
}
// creating plane
function createPlane(){	
  // create geometry
  const texture = new THREE.TextureLoader().load( "./textures/1.jpg" );      // load texture
	texture.colorSpace = THREE.SRGBColorSpace;
	texture.anisotropy = 16;
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set(2, 2);
	const geometry = new THREE.PlaneGeometry(140,125);
	const material =  new THREE.MeshStandardMaterial({ map: texture, side:THREE.DoubleSide });  
	// set plane position by moving and rotating
	plane = new THREE.Mesh(geometry, material);
  	plane.rotation.x = -0.5*Math.PI;
  	plane.position.x = 0;
  	plane.position.y = 0;
  	plane.position.z = 0;
  	plane.receiveShadow = true;
  // add plane to the scene
  	scene.add(plane);	
}



// Create house
function createHouse() {
	// Create the base of the house
	//Create the first floor
	const texture1 = new THREE.TextureLoader().load( "./textures/c.jpg" );
	texture1.colorSpace = THREE.SRGBColorSpace;
	texture1.anisotropy = 16;
	
	const baseGeometry = new THREE.BoxGeometry(-50, 20, 30);
  	const baseMaterial = new THREE.MeshStandardMaterial({ map: texture1, side:THREE.DoubleSide });
  	const base = new THREE.Mesh(baseGeometry, baseMaterial);
  	base.position.set(0, 10, 0);
	base.castShadow = true;
	base.receiveShadow = true;
  	scene.add(base);


	//roof
	const texture2 = new THREE.TextureLoader().load( "./textures/roof.jpg" ); 
	texture2.colorSpace = THREE.SRGBColorSpace;
	texture2.anisotropy = 16;
	const roofGeometry = new THREE.BoxGeometry(5, 8, 45);
	const roofMaterial = new THREE.MeshStandardMaterial({ map: texture2, side:THREE.DoubleSide });
  	const roof = new THREE.Mesh(roofGeometry, roofMaterial);
  	roof.position.set(3, 35, 0);
	roof.castShadow = true;
	roof.receiveShadow = true;
  	scene.add(roof);

	

	// foundation
	const texture6 = new THREE.TextureLoader().load( "./textures/floor.jpg" ); 
	texture6.colorSpace = THREE.SRGBColorSpace;
	texture6.anisotropy = 16;
	const foundationGeometry = new THREE.BoxGeometry(22, 1, 22);
  	const foundationMaterial = new THREE.MeshStandardMaterial({ map: texture6, side:THREE.DoubleSide });
  	const foundation = new THREE.Mesh(foundationGeometry, foundationMaterial);
  	foundation.position.set(0, 1.5, 0);
	foundation.castShadow = true;
	foundation.receiveShadow = true;
  	scene.add(foundation);
  
	// Create the second floor
	// Первый этаж
const firstFloorGeometry = new THREE.BoxGeometry(30, 15, 20);
const texture3 = new THREE.TextureLoader().load("./textures/w.jpg"); 
texture3.colorSpace = THREE.SRGBColorSpace;
texture3.anisotropy = 32;

// Загрузка bump-текстуры для первого этажа
const bumpTexture = new THREE.TextureLoader().load("./textures/w_bump.jpg");

const firstFloorMaterial = new THREE.MeshStandardMaterial({
    map: texture3,
    bumpMap: bumpTexture,   // Добавляем bump-карту
    bumpScale: 30,         // Интенсивность рельефа
    side: THREE.DoubleSide
});

const firstFloor = new THREE.Mesh(firstFloorGeometry, firstFloorMaterial);
firstFloor.position.set(11, 27.5, -11);
firstFloor.castShadow = true;
firstFloor.receiveShadow = true;
scene.add(firstFloor);

// Второй этаж
const texture4 = new THREE.TextureLoader().load("./textures/w.jpg"); 
texture4.colorSpace = THREE.SRGBColorSpace;
texture4.anisotropy = 32;

// Загрузка bump-текстуры для второго этажа
const bumpTexture2 = new THREE.TextureLoader().load("./textures/w_bump.jpg");

const secondFloorGeometry = new THREE.BoxGeometry(52, 15, 25);
const secondFloorMaterial = new THREE.MeshStandardMaterial({
    map: texture4,
    bumpMap: bumpTexture2,   // Используем bump-карту для второго этажа
    bumpScale: 30,          // Интенсивность рельефа
    side: THREE.DoubleSide
});

const secondFloor = new THREE.Mesh(secondFloorGeometry, secondFloorMaterial);
secondFloor.position.set(0, 27.5, 11);
secondFloor.castShadow = true;
secondFloor.receiveShadow = true;
scene.add(secondFloor);

	// Create garage
	const garageTexture = new THREE.TextureLoader().load( "./textures/a.jpg" );
	garageTexture.colorSpace = THREE.SRGBColorSpace;
	garageTexture.anisotropy = 16;
	const garageGeometry = new THREE.BoxGeometry(15, 10, 20);
	const garageMaterial = new THREE.MeshStandardMaterial({ 
    map: garageTexture, 
    side: THREE.DoubleSide 
	});

	const garage = new THREE.Mesh(garageGeometry, garageMaterial);
	garage.position.set(-32.5, 5, 5);
	garage.castShadow = true;
	garage.receiveShadow = true;
	scene.add(garage);

  
	// Create the pillar
	const pillartexture = new THREE.TextureLoader().load("./textures/roof.jpg");
	pillartexture.colorSpace = THREE.SRGBColorSpace;
	pillartexture.anisotropy = 16;
	const pillarGeometry = new THREE.CylinderGeometry(0.5, 0.5, 20, 25);
	const pillarMaterial = new THREE.MeshStandardMaterial({ 
		map: pillartexture, 
		side: THREE.DoubleSide 
		});
	const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
	pillar.position.set(-40, 10, 23); // position the pillar
	pillar.translateX(14.5);
	pillar.castShadow = true;
	pillar.receiveShadow = true;
	scene.add(pillar);

	// create the pillar 1
	const pillatexture = new THREE.TextureLoader().load("./textures/roof.jpg");
	pillatexture.colorSpace = THREE.SRGBColorSpace;
	pillatexture.anisotropy = 16;
	const pillar1Geometry = new THREE.CylinderGeometry(0.5, 0.5, 20, 25);
	const pillar1Material = new THREE.MeshStandardMaterial({ 
		map: pillatexture, 
		side: THREE.DoubleSide 
		});
	const pillar1 = new THREE.Mesh(pillar1Geometry, pillar1Material);
	pillar1.position.set(-40, 10, 23); // position the pillar
	pillar1.translateX(30);
	pillar1.castShadow = true;
	pillar1.receiveShadow = true;
	scene.add(pillar1);

	// create the pillar 2
	const pilltexture = new THREE.TextureLoader().load("./textures/roof.jpg");
	pilltexture.colorSpace = THREE.SRGBColorSpace;
	pilltexture.anisotropy = 16;
	const pillar2Geometry = new THREE.CylinderGeometry(0.5, 0.5, 20, 25);
	const pillar2Material = new THREE.MeshStandardMaterial({ 
		map: pilltexture, 
		side: THREE.DoubleSide 
		});
	const pillar2 = new THREE.Mesh(pillar2Geometry, pillar2Material);
	pillar2.position.set(-40, 10, 23); // position the pillar
	pillar2.translateX(47);
	pillar2.castShadow = true;
	pillar2.receiveShadow = true;
	scene.add(pillar2);

	// create the pillar 1
	const piltexture = new THREE.TextureLoader().load("./textures/roof.jpg");
	piltexture.colorSpace = THREE.SRGBColorSpace;
	piltexture.anisotropy = 16;
	const pillar3Geometry = new THREE.CylinderGeometry(0.5, 0.5, 20, 25);
	const pillar3Material = new THREE.MeshStandardMaterial({ 
		map: piltexture, 
		side: THREE.DoubleSide 
		});
	const pillar3 = new THREE.Mesh(pillar3Geometry, pillar3Material);
	pillar3.position.set(-40, 10, 23); // position the pillar
	pillar3.translateX(65);
	pillar3.castShadow = true;
	pillar3.receiveShadow = true;
	scene.add(pillar3);
  
	// Create the balcony BASE
	const floorTexture = new THREE.TextureLoader().load("./textures/floor1.jpg");
	floorTexture.colorSpace = THREE.SRGBColorSpace;
	floorTexture.anisotropy = 16;
	const balconyGeometry = new THREE.BoxGeometry(22, 2, 15);
	const balconyMaterial = new THREE.MeshStandardMaterial({ 
    map: floorTexture, 
    side: THREE.DoubleSide 
});
	const balcony = new THREE.Mesh(balconyGeometry, balconyMaterial);
	balcony.position.set(-15, 20, 5);
	balcony.translateZ(-13);
	scene.add(balcony);

	

	//create pillar for balcony
	const pillar4Geometry = new THREE.CylinderGeometry(0.3, 0.3, 4, 10);
	const pillar4Material = new THREE.MeshLambertMaterial({ color: 0xffffff });
	const pillar4 = new THREE.Mesh(pillar4Geometry, pillar4Material);
	pillar4.position.set(-100, 23, -15); // position the pillar
	pillar4.translateX(74.5);
	scene.add(pillar4);


	//create pillar for balcony
	const pillar5Geometry = new THREE.CylinderGeometry(0.3, 0.3, 4, 10);
	const pillar5Material = new THREE.MeshLambertMaterial({ color: 0xffffff });
	const pillar5 = new THREE.Mesh(pillar5Geometry, pillar5Material);
	pillar5.position.set(-100, 23, -15); // position the pillar
	pillar5.translateX(83);
	scene.add(pillar5);

	//create pillar for balcony
	const pillar6Geometry = new THREE.CylinderGeometry(0.3, 0.3, 4, 10);
	const pillar6Material = new THREE.MeshLambertMaterial({ color: 0xffffff });
	const pillar6 = new THREE.Mesh(pillar6Geometry, pillar6Material);
	pillar6.position.set(-100, 23, -15); // position the pillar
	pillar6.translateX(91);
	scene.add(pillar6);

	//create pillar for balcony
	const pillar7Geometry = new THREE.CylinderGeometry(0.3, 0.3, 4, 10);
	const pillar7Material = new THREE.MeshLambertMaterial({ color: 0xffffff });
	const pillar7 = new THREE.Mesh(pillar7Geometry, pillar7Material);
	pillar7.position.set(-100, 23, -7.5); // position the pillar
	pillar7.translateX(74.5);
	scene.add(pillar7);



	// Create the pool
	const pooltexture = new THREE.TextureLoader().load("./textures/pool1.jpg");
	pooltexture.colorSpace = THREE.SRGBColorSpace;
	pooltexture.anisotropy = 16;
	const poolGeometry = new THREE.BoxGeometry(38, 3, 18);
	const poolMaterial = new THREE.MeshStandardMaterial({ 
		map: pooltexture, 
		side: THREE.DoubleSide 
		});
	const pool = new THREE.Mesh(poolGeometry, poolMaterial);
	pool.position.set(15, -1.4, -45);
	pool.translateX(19);

	pool.receiveShadow = true;
	const edgingGeometry = new THREE.BoxGeometry(0.1, 10, 18); // width, height, depth
	const edgingMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 }); // black
	pool.castShadow = true;
	pool.receiveShadow = true;
	scene.add(pool);




// Create four edging meshes, one for each side of the pool
	const edgtexture = new THREE.TextureLoader().load("./textures/for pool.jpg");
	edgtexture.colorSpace = THREE.SRGBColorSpace;
	edgtexture.anisotropy = 16;


	edgtexture.wrapS = THREE.RepeatWrapping;
	edgtexture.wrapT = THREE.RepeatWrapping;
	edgtexture.repeat.set(1, 4); 


	const edging1Material = new THREE.MeshStandardMaterial({
    map: edgtexture,
    side: THREE.DoubleSide
	
});


	const edging1Geometry = new THREE.BoxGeometry(0.1, 6, 18);


	const edging1 = new THREE.Mesh(edging1Geometry, edging1Material);
	edging1.position.set(10 + 2, 0, -46);
	edging1.rotation.z = Math.PI / 2;
	edging1.castShadow = true;
	edging1.receiveShadow = true;
	scene.add(edging1);

//left
	const edging2 = new THREE.Mesh(edging1Geometry, edging1Material);
	edging2.position.set(10 + 45, 0, -43);
	edging2.rotation.z = Math.PI / 2;
	edging2.castShadow = true;
	edging2.receiveShadow = true;
	scene.add(edging2);


	const edgtexture1 = new THREE.TextureLoader().load("./textures/for pool.jpg");
	edgtexture1.colorSpace = THREE.SRGBColorSpace;
	edgtexture1.anisotropy = 16;
	edgtexture1.wrapS = THREE.RepeatWrapping;
	edgtexture1.wrapT = THREE.RepeatWrapping;
	edgtexture1.repeat.set(1, 4); 


	const edging2Material = new THREE.MeshStandardMaterial({
    map: edgtexture1,
    side: THREE.DoubleSide
});
	const edging3Geometry = new THREE.BoxGeometry(0.1, 10, 50);
	const edging3 = new THREE.Mesh(edging3Geometry, edging2Material);
	edging3.position.set(33, 0, -32);
	edging3.rotation.y = Math.PI / 2;
	edging3.rotation.z = Math.PI / 2;
	edging3.castShadow = true;
	edging3.receiveShadow = true;
	scene.add(edging3);


	//
	const edgtexture2 = new THREE.TextureLoader().load("./textures/po.jpg");
	edgtexture2.colorSpace = THREE.SRGBColorSpace;
	edgtexture2.anisotropy = 16;
	edgtexture2.wrapS = THREE.RepeatWrapping;
	edgtexture2.wrapT = THREE.RepeatWrapping;
	edgtexture2.repeat.set(1, 4); 


	const edging3Material = new THREE.MeshStandardMaterial({
    map: edgtexture1,
    side: THREE.DoubleSide});
	const edging4Geometry = new THREE.BoxGeometry(0.1, 10, 50);
	const edging4 = new THREE.Mesh(edging4Geometry, edging3Material);
	edging4.position.set(33, 0, -57);
	edging4.rotation.y = Math.PI / 2;
	edging4.rotation.z = Math.PI / 2;
	edging4.castShadow = true;
	edging4.receiveShadow = true;
	scene.add(edging4);


	

  
	// Create the windows
	const windowtexture = new THREE.TextureLoader().load("./textures/home.jpg");
	windowtexture.colorSpace = THREE.SRGBColorSpace;
	windowtexture.anisotropy = 16;
	const windowGeometry = new THREE.BoxGeometry(21, 10, 2);
	const windowMaterial = new THREE.MeshStandardMaterial({
		map: windowtexture,
		opacity:0.9, transparent:true
		});
	

	const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
	window1.position.set(16, 28, -20.5);
	window1.castShadow = true;
	window1.receiveShadow = true;
	scene.add(window1);
  
	const window2 = new THREE.Mesh(windowGeometry, windowMaterial);
	window2.position.set(10, 12, -15);
	scene.add(window2);
  
	const window3 = new THREE.Mesh(windowGeometry, windowMaterial);
	window3.position.set(-13, 12, -15);
	scene.add(window3);
  
	//window for balcony
	const window1Geometry = new THREE.BoxGeometry(21.5, 5, 1);
	const window1Material = new THREE.MeshLambertMaterial({ color: 0x606061, transparent: true, opacity: 0.5 });
	const window4 = new THREE.Mesh(window1Geometry, window1Material);
	window4.position.set(-15, 23, -15);
	scene.add(window4);

	const window2Geometry = new THREE.BoxGeometry(15, 5, 1);
	const window2Material = new THREE.MeshLambertMaterial({ color: 0x606061, transparent: true, opacity: 0.5 });
	const window6 = new THREE.Mesh(window2Geometry, window2Material);
	window6.position.set(-26, 23, -8);
	window6.rotation.y = Math.PI / 2;
	scene.add(window6);


	// window 4
	const windowtexture5 = new THREE.TextureLoader().load("./textures/home.jpg");
	windowtexture5.colorSpace = THREE.SRGBColorSpace;
	windowtexture5.anisotropy = 16;
	const window5Geometry = new THREE.BoxGeometry(35, 10, 2);
	const window5Material = new THREE.MeshStandardMaterial({
		map: windowtexture5,
		side: THREE.DoubleSide});
	const window5 = new THREE.Mesh(window5Geometry, window5Material);
	window5.position.set(26, 28, -3);
	window5.rotation.y = Math.PI / 2;
	window5.castShadow = true;
	window5.receiveShadow = true;
	scene.add(window5);


	const windowtexture6 = new THREE.TextureLoader().load("./textures/home1.jpg");
	windowtexture6.colorSpace = THREE.SRGBColorSpace;
	windowtexture6.anisotropy = 16;
	const window9Geometry = new THREE.BoxGeometry(15, 10, 2);
	const window9Material = new THREE.MeshStandardMaterial({
		map: windowtexture6,
		opacity:0.9, transparent:true});
	const window9 = new THREE.Mesh(window9Geometry, window9Material);
	window9.position.set(-25.5, 28, 13);
	window9.rotation.y = Math.PI / 2;
	scene.add(window9);

	const windowtexture7 = new THREE.TextureLoader().load("./textures/home2.jpg");
	windowtexture7.colorSpace = THREE.SRGBColorSpace;
	windowtexture7.anisotropy = 16;
	const window10Geometry = new THREE.BoxGeometry(15, 10, 2);
	const window10Material = new THREE.MeshStandardMaterial({
		map: windowtexture7,
		side: THREE.DoubleSide});
	const window10 = new THREE.Mesh(window10Geometry, window10Material);
	window10.position.set(-2, 12, 15);
	scene.add(window10);

  
	// Create the door for garage
	const texture = new THREE.TextureLoader().load( "./textures/garage.jpg" );
	texture.colorSpace = THREE.SRGBColorSpace;
	texture.anisotropy = 16;
	const doorGeometry = new THREE.BoxGeometry(16, 10, 0.5);
	const doorMaterial = new THREE.MeshStandardMaterial({ map: texture, side:THREE.DoubleSide });
	const door = new THREE.Mesh(doorGeometry, doorMaterial);
	door.position.set(-32, 5, -23);
	door.translateZ(18);
	door.castShadow = true;
	door.receiveShadow = true;
	scene.add(door);
  



	// create for door balcon 
	const doortexture1 = new THREE.TextureLoader().load( "./textures/roof.jpg" ); 
	doortexture1.colorSpace = THREE.SRGBColorSpace;
	doortexture1.anisotropy = 16;
	const door2Geometry = new THREE.BoxGeometry(6, 13, 0.5);
	const door2Material = new THREE.MeshStandardMaterial({ map: doortexture1, side:THREE.DoubleSide });
	const door2 = new THREE.Mesh(door2Geometry, door2Material);
	door2.position.set(-4, 26, -15);
	door2.translateZ(8);
	door2.rotation.y = Math.PI / 2;
	door2.castShadow = true;
	door2.receiveShadow = true;
	scene.add(door2);

	// open door
	const opentexture1 = new THREE.TextureLoader().load( "./textures/metalic.jpg" ); 
	opentexture1.colorSpace = THREE.SRGBColorSpace;
	opentexture1.anisotropy = 16;
	const ballGeometry1 = new THREE.BoxGeometry(0.5, 0.5, 6); 
	const ballMaterial1  = new THREE.MeshStandardMaterial({ map: opentexture1, side:THREE.DoubleSide });
	const ball1 = new THREE.Mesh(ballGeometry1, ballMaterial1);
	ball1.position.set(-4.5, 26, -8.6)
	ball1.rotation.x = Math.PI / 2;
	scene.add(ball1);
	ball1.castShadow = true;
	ball1.receiveShadow = true;
  



	//create the door
	const doortexture = new THREE.TextureLoader().load( "./textures/roof.jpg" ); 
	doortexture.colorSpace = THREE.SRGBColorSpace;
	doortexture.anisotropy = 16;
	const door1Geometry = new THREE.BoxGeometry(6, 13, 0.5);
	const door1Material = new THREE.MeshStandardMaterial({ map: doortexture, side:THREE.DoubleSide });
	const door1 = new THREE.Mesh(door1Geometry, door1Material);
	door1.position.set(25, 6.8, -15);
	door1.translateZ(8);
	door1.rotation.y = Math.PI / 2;
	door1.castShadow = true;
	door1.receiveShadow = true;
	scene.add(door1);
	
	// open door
	const opentexture = new THREE.TextureLoader().load( "./textures/metalic.jpg" ); 
	opentexture.colorSpace = THREE.SRGBColorSpace;
	opentexture.anisotropy = 16;
	const ballGeometry = new THREE.BoxGeometry(0.5, 0.5, 6); 
	const ballMaterial  = new THREE.MeshStandardMaterial({ map: opentexture, side:THREE.DoubleSide });
	const ball = new THREE.Mesh(ballGeometry, ballMaterial);
	ball.position.set(25.5, 6, -5)
	ball.rotation.x = Math.PI / 2;
	scene.add(ball);
	ball.castShadow = true;
	ball.receiveShadow = true;
  }

  function createWindowFrames() {
	const wintexture = new THREE.TextureLoader().load( "./textures/garage door.jpg" ); 
	wintexture.colorSpace = THREE.SRGBColorSpace;
	wintexture.anisotropy = 16;
    const frameMaterial = new THREE.MeshStandardMaterial({ map: wintexture, side:THREE.DoubleSide }); 
    const verticalFrame = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 10.5, 0.7),  
        frameMaterial
    );
    verticalFrame.position.set(26, 28, 15);   
    verticalFrame.rotation.y = Math.PI / 2;
    scene.add(verticalFrame);


    const horizontalFrame = new THREE.Mesh(
        new THREE.BoxGeometry(36, 0.7, 0.5),  
        frameMaterial
    );
    horizontalFrame.position.set(26.5, 22.5, 13);
    horizontalFrame.rotation.y = Math.PI / 2;
	horizontalFrame.translateX(16);
    scene.add(horizontalFrame);


	const win1texture = new THREE.TextureLoader().load( "./textures/garage door.jpg" ); 
	win1texture.colorSpace = THREE.SRGBColorSpace;
	win1texture.anisotropy = 16;

	const horizontalFrame1 = new THREE.Mesh(
        new THREE.BoxGeometry(36, 0.7, 0.5),  
        frameMaterial
    );
    horizontalFrame1.position.set(26.5, 33, 13);
    horizontalFrame1.rotation.y = Math.PI / 2;
	horizontalFrame1.translateX(16);
    scene.add(horizontalFrame1);



	const frameMaterial1 = new THREE.MeshStandardMaterial({ map: wintexture, side:THREE.DoubleSide }); 
    const verticalFrame1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 10.5, 0.7),  
        frameMaterial1
    );
    verticalFrame1.position.set(5.5, 27.5, -21);   
    scene.add(verticalFrame1);


    const horizontalFrame2 = new THREE.Mesh(
        new THREE.BoxGeometry(21, 0.7, 0.5),  
        frameMaterial1
    );
    horizontalFrame2.position.set(16, 22.5, -21);
    scene.add(horizontalFrame2);

	const horizontalFrame3  = new THREE.Mesh(
        new THREE.BoxGeometry(22, 0.7, 0.5),  
        frameMaterial1
    );
    horizontalFrame3.position.set(26.5, 33, -21);
	horizontalFrame3.translateX(-11);
    scene.add(horizontalFrame3);

	// Second window 

	const frameMaterial2 = new THREE.MeshStandardMaterial({ map: wintexture, side:THREE.DoubleSide }); 
    const verticalFrame2 = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 10.5, 0.7),  
        frameMaterial2
    );
    verticalFrame2.position.set(-1, 12, -15);   
    scene.add(verticalFrame2);

	const frameMaterial3 = new THREE.MeshStandardMaterial({ map: wintexture, side:THREE.DoubleSide });  
    const verticalFrame6 = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 10.5, 0.7),  
        frameMaterial3);
	verticalFrame6.position.set(21, 12, -15);   
    scene.add(verticalFrame6);


    const horizontalFrame5 = new THREE.Mesh(
        new THREE.BoxGeometry(22, 0.7, 0.7),  
        frameMaterial2
    );
    horizontalFrame5.position.set(27, 7, -15);
	horizontalFrame5.translateX(-17);
    scene.add(horizontalFrame5);

	const horizontalFrame4  = new THREE.Mesh(
        new THREE.BoxGeometry(22, 0.7, 0.7),  
        frameMaterial2
    );
    horizontalFrame4.position.set(27, 17, -15);
	horizontalFrame4.translateX(-17);
    scene.add(horizontalFrame4);



	//Third window
// right line
	const frameMaterial5 = new THREE.MeshStandardMaterial({ map: wintexture, side:THREE.DoubleSide });  
    const verticalFrame3 = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 10.5, 0.7),  
        frameMaterial5
    );
    verticalFrame3.position.set(-2.2, 12, -15);   
    scene.add(verticalFrame3);
// left line
	const frameMaterial4 =new THREE.MeshStandardMaterial({ map: wintexture, side:THREE.DoubleSide }); 
    const verticalFrame7 = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 10.5, 0.7),  
        frameMaterial4);
	verticalFrame7.position.set(-23.5, 12, -15);   
    scene.add(verticalFrame7);

//bottom line of window
    const horizontalFrame6 = new THREE.Mesh(
        new THREE.BoxGeometry(22, 0.7, 0.7),  
        frameMaterial3
    );
    horizontalFrame6.position.set(4.1, 7, -15);
	horizontalFrame6.translateX(-17);
    scene.add(horizontalFrame6);

// top line
	const horizontalFrame7 = new THREE.Mesh(
        new THREE.BoxGeometry(22, 0.7, 0.7),  
        frameMaterial3
    );
    horizontalFrame7.position.set(4.1, 17, -15);
	horizontalFrame7.translateX(-17);
    scene.add(horizontalFrame7);


// line for garage
const horizontalFrame30 = new THREE.Mesh(
	new THREE.BoxGeometry(15.5, 0.3, 0.3),  
	frameMaterial3
);
horizontalFrame30.position.set(-15, 0.5, -5.3);
horizontalFrame30.translateX(-17);
scene.add(horizontalFrame30);





		//Four window
// right line
const frameMaterial6 = new THREE.MeshStandardMaterial({ map: wintexture, side:THREE.DoubleSide }); 
const verticalFrame10 = new THREE.Mesh(
	new THREE.BoxGeometry(0.7, 11, 0.7),  
	frameMaterial6
);
verticalFrame10.position.set(-53, 27.8, 0);
verticalFrame10.rotation.y = Math.PI / 2; 
verticalFrame10.translateX(-20.5);
verticalFrame10.translateZ(27);  
scene.add(verticalFrame10);

// left line
const frameMaterial7 = new THREE.MeshStandardMaterial({ map: wintexture, side:THREE.DoubleSide });  
const verticalFrame11 = new THREE.Mesh(
	new THREE.BoxGeometry(0.7, 11, 0.7),  
	frameMaterial7);
verticalFrame11.position.set(-53, 27.8, 0); 
verticalFrame11.rotation.y = Math.PI / 2; 
verticalFrame11.translateX(-5.5);
verticalFrame11.translateZ(27);
scene.add(verticalFrame11);

//TOP line of window
const horizontalFrame12 = new THREE.Mesh(
	new THREE.BoxGeometry(15, 0.7, 0.7),  
	frameMaterial6
);
horizontalFrame12.position.set(-53, 33, 0);
horizontalFrame12.rotation.y = Math.PI / 2;
horizontalFrame12.translateX(-13);
horizontalFrame12.translateZ(27);
scene.add(horizontalFrame12);

// BOTTOM line
const horizontalFrame13 = new THREE.Mesh(
	new THREE.BoxGeometry(15, 0.7, 0.7),  
	frameMaterial6
);
horizontalFrame13.position.set(-53, 22.5, 0);
horizontalFrame13.rotation.y = Math.PI / 2;
horizontalFrame13.translateZ(27);
horizontalFrame13.translateX(-13);
scene.add(horizontalFrame13);

//FIVE window
// right line
const frameMaterial20 = new THREE.MeshStandardMaterial({ map: wintexture, side:THREE.DoubleSide });  
const verticalFrame20 = new THREE.Mesh(
	new THREE.BoxGeometry(0.7, 10.5, 0.7),  
	frameMaterial20
);
verticalFrame20.position.set(-49.1, 11.5, 0);
verticalFrame20.translateX(39);
verticalFrame20.translateZ(15);  
scene.add(verticalFrame20);

// left line
const frameMaterial21 = new THREE.MeshStandardMaterial({ map: wintexture, side:THREE.DoubleSide }); 
const verticalFrame21 = new THREE.Mesh(
	new THREE.BoxGeometry(0.7, 10.5, 0.7),  
	frameMaterial21);
verticalFrame21.position.set(-49.1, 11.5, 0); 
verticalFrame21.translateX(55);
verticalFrame21.translateZ(15);
scene.add(verticalFrame21);

//TOP line of window
const horizontalFrame22 = new THREE.Mesh(
	new THREE.BoxGeometry(16.6, 0.7, 0.7),  
	frameMaterial20
);
horizontalFrame22.position.set(-49.1, 17, 0);
horizontalFrame22.translateX(47);
horizontalFrame22.translateZ(15);
scene.add(horizontalFrame22);

// BOTTOM line
const horizontalFrame23 = new THREE.Mesh(
	new THREE.BoxGeometry(16.6, 0.7, 0.7),  
	frameMaterial20
);
horizontalFrame23.position.set(-49.1, 6.5, 0);
horizontalFrame23.translateZ(15);
horizontalFrame23.translateX(47);
scene.add(horizontalFrame23);


}



function createWater(){
	const waterGeometry = new THREE.PlaneGeometry( 38, 20 );
	// flow direction - x, y
	water = new Water( waterGeometry, {
	color: 0xAFDCE0,
	scale: 4,
	flowDirection: new THREE.Vector2( 0.6, 0.6 ),
	textureWidth: 1024,
	textureHeight: 1024
	} );
	water.position.y = 0.2;
	water.translateZ(-45);
	water.translateX(34);
	
	water.rotation.x = -0.5 * Math.PI;
	scene.add( water );
	}


function createWater1(){
		const waterGeometry = new THREE.PlaneGeometry( 51, 20 );
		// flow direction - x, y
		water = new Water( waterGeometry, {
		color: 0xAFDCE0,
		scale: 4,
		flowDirection: new THREE.Vector2( 0.6, 0.6 ),
		textureWidth: 1024,
		textureHeight: 1024
		} );
		water.position.y = 10;
		water.translateZ(23);
		water.translateX(0);
		
		
		water.rotation.x = -2 * Math.PI;
		scene.add( water );
		}


let wheelRotationTween;
let settings = {
    wheelRotation: 0,
    wheelPosition: 0,
    rotateSpeed: 1, // Скорость вращения
    groupPosX: 0 // Позиция по оси X
};
function createWheel() {
    const texture = new THREE.TextureLoader().load("textures/melon.jpg");
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 16;
    const normal = new THREE.TextureLoader().load("textures/melon_bump.jpg");
    
    const geometry = new THREE.TorusGeometry(4, 1, 15, 100);
    const material = new THREE.MeshStandardMaterial({
        map: texture,
        opacity: 0.9,
        transparent: true,
        normalMap: normal,
        normalScale: new THREE.Vector2(3, 3),
        metalness: 0.8,
        roughness: 0.3
    });

    wheel = new THREE.Mesh(geometry, material);
	wheel.name = "Wheel";
    wheel.rotation.x = -0.5 * Math.PI;
    wheel.position.x = 40; // X position from GUI
    wheel.position.y = 0.5;                     // Y position
    wheel.position.z = -50;                   // Adjust Z position as needed
    wheel.castShadow = true;


    function updateWheelRotationTween() {
        if (wheelRotationTween) {
            wheelRotationTween.stop();
        }

        wheelRotationTween = new TWEEN.Tween(settings)
            .to({ wheelRotation: 2 * Math.PI }, 80000 / settings.rotateSpeed)
            .easing(TWEEN.Easing.Linear.None)
            .onUpdate(() => {
                wheel.rotation.z = settings.wheelRotation;
            })
            .repeat(Infinity)
            .start();
    }

    let tween = new TWEEN.Tween(settings).to({ wheelPosition: -2 * Math.PI }, 20000);
    tween.easing(TWEEN.Easing.Linear.None);
    tween.onUpdate(() => {
        wheel.position.x = 40 + 5 * (Math.sin(settings.wheelPosition));
        wheel.position.z = -50 + 0 * (Math.cos(settings.wheelPosition)); // Adjust Z position if necessary
        wheel.position.y = 0.5 + 1 * (Math.cos(settings.wheelPosition));
    });    
    tween.repeat(Infinity);
    tween.start();

    scene.add(wheel);
    updateWheelRotationTween(); // Start the rotation
}




function createCar() {
    const geometry_1 = new THREE.BoxGeometry(11, 4, 25);
    const material = new THREE.MeshStandardMaterial({ color: 0x000000 });
    bottom_car = new THREE.Mesh(geometry_1, material);
    bottom_car.receiveShadow = true;
    bottom_car.castShadow = true;
    bottom_car.position.set(-35, 4, -40);
    car.add(bottom_car);

    const geometry_2 = new THREE.BoxGeometry(10.5, 3, 12);
    top_car = new THREE.Mesh(geometry_2, material);
    top_car.receiveShadow = true;
    top_car.castShadow = true;
    top_car.position.set(-35, 7, -40);
    car.add(top_car);

    const texture = new THREE.TextureLoader().load('textures/wheel.jpg');
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 16;
    const material_wheel = new THREE.MeshStandardMaterial({ color: 0x4f4f4f, map: texture });

    const geometry_wheel = new THREE.CylinderGeometry(2, 2, 2, 64, 64);
    wheel_1 = new THREE.Mesh(geometry_wheel, material_wheel);
    wheel_1.receiveShadow = true;
    wheel_1.castShadow = true;
    wheel_1.rotateZ(Math.PI / 2);
    wheel_1.position.set(-30, 2, -30);
    car.add(wheel_1);

    wheel_2 = new THREE.Mesh(geometry_wheel, material_wheel);
    wheel_2.receiveShadow = true;
    wheel_2.castShadow = true;
    wheel_2.rotateZ(Math.PI / 2);
    wheel_2.position.set(-30, 2, -47);
    car.add(wheel_2);

    wheel_3 = new THREE.Mesh(geometry_wheel, material_wheel);
    wheel_3.receiveShadow = true;
    wheel_3.castShadow = true;
    wheel_3.rotateZ(Math.PI / 2);
    wheel_3.position.set(-40, 2, -30);
    car.add(wheel_3);

    wheel_4 = new THREE.Mesh(geometry_wheel, material_wheel);
    wheel_4.receiveShadow = true;
    wheel_4.castShadow = true;
    wheel_4.rotateZ(Math.PI / 2);
    wheel_4.position.set(-40, 2, -47);
    car.add(wheel_4);

    const geometry_light = new THREE.SphereGeometry(1, 64, 64);
    const material_light_front = new THREE.MeshStandardMaterial({ color: 0xffffff });
    light_front1 = new THREE.Mesh(geometry_light, material_light_front);
    light_front1.receiveShadow = true;
    light_front1.castShadow = true;
    light_front1.position.set(-31, 4, -52);
    car.add(light_front1);

    light_front2 = new THREE.Mesh(geometry_light, material_light_front);
    light_front2.receiveShadow = true;
    light_front2.castShadow = true;
    light_front2.position.set(-39, 4, -52);
    car.add(light_front2);

    const material_light_back = new THREE.MeshStandardMaterial({ color: 0x9f0c0c });
    light_back1 = new THREE.Mesh(geometry_light, material_light_back);
    light_back1.receiveShadow = true;
    light_back1.castShadow = true;
    light_back1.position.set(-31, 4, -28);
    car.add(light_back1);

    light_back2 = new THREE.Mesh(geometry_light, material_light_back);
    light_back2.receiveShadow = true;
    light_back2.castShadow = true;
    light_back2.position.set(-39, 4, -28);
    car.add(light_back2);

    const material_front = new THREE.MeshStandardMaterial({ color: 0x4f4f4f });
    const geometry_front_car = new THREE.BoxGeometry(4, 1.5, 1, 64, 64);
    front_car = new THREE.Mesh(geometry_front_car, material_front);
    front_car.receiveShadow = true;
    front_car.castShadow = true;
    front_car.position.set(-35, 4, -52.3);
    car.add(front_car);

    scene.add(car);
}

	
/*
function createSnow(posX, posZ) {
    const texture = new THREE.TextureLoader().load("textures/snow.png");
    texture.colorSpace = THREE.SRGBColorSpace; // Обязательно используйте цветовое пространство
    let planeGeometry = new THREE.PlaneGeometry(0.5, 0.5);
    const planeMaterial = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide
    });
    let snowflake = new THREE.Mesh(planeGeometry, planeMaterial);
    snowflake.position.set(posX, 10.0, posZ);
    snowflake.receiveShadow = true;
    snowflake.name = "snowflake";
    scene.add(snowflake);
}


function animateSnow() {
    let fall = { y: 10 };
    let snowTween = new TWEEN.Tween(fall).to({ y: -10 }, 20000);
    snowTween.easing(TWEEN.Easing.Linear.None);

   
    let t = 0;
    snowTween.onUpdate(() => {
        scene.traverse((object) => {
            if (object.name === "snowflake") {
                t++;
                object.position.y = fall.y + Math.random() * 0.5;
                object.position.y += Math.sin(t * 0.02) * 0.2;  

                object.rotation.x += 0.001 * t;
                object.rotation.y += 0.001 * t;
                object.rotation.z += 0.001 * t;


                if (object.position.y <= -10) {
                    object.position.y = 10 + Math.random() * 5; 
                    t = 0; 
                }
            }
        });
    });
    snowTween.repeat(Infinity);
    snowTween.start();
}

*/

function createDodge(){
	const loader = new GLTFLoader();
	loader.load('./models/dodge/scene.gltf', 
		function (gltf) {
			const model = gltf.scene;
			
			
			model.traverse(function (child) {
				if (child instanceof THREE.Mesh) {
					child.castShadow = true;
					child.receiveShadow = true; 
				}
			});
			
			
			model.scale.set(150, 150, 150);
			model.position.set(-35, -0.5, -40); 
			model.rotation.y = Math.PI; 
		
			scene.add(model);
			model.name = "dodge";

		
			if (gltf.animations && gltf.animations.length > 0) {
				const mixer = new THREE.AnimationMixer(model);
				gltf.animations.forEach((clip) => {
					mixer.clipAction(clip).play();
				});
				mixers.push(mixer); 
			}
		
		},
		function (xhr) {
			console.log((xhr.loaded / xhr.total * 100) + '% loaded');
		},
	);
}

function createCarLight() {
    const pointLight = new THREE.PointLight(0xffffff, 50, 100); 
    pointLight.position.set(-35, 5, -40); 
    carLight = pointLight;
    scene.add(carLight);
    carLight.visible = true;
}


let carControlParams = {        
	soundon: false ,
	numOfButterflies: false,
	addButterfly: false,
	removeLastButterfly:false

};






const gui = new GUI();
let butterflyGenerator = null;

gui.add(carControlParams, 'soundon').name('Sound On/Off').onChange(() => {
		toggleSound();
		
		
			
		
});



class ButterflyGenerator {
    constructor() {
        this.numOfButterflies = 0;
    }

    createButterfly(posX, posZ, scale) {
        const loader = new GLTFLoader();
        const butterflyGroup = new THREE.Group();

        loader.load('./models/butterfly/scene.gltf', (gltf) => {
			console.log("Model loaded successfully");
            const model = gltf.scene;
            model.scale.set(scale, scale, scale);
            model.position.set(posX, 10, posZ); 
            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                }
            });

            const mixer = new THREE.AnimationMixer(model);
            mixers.push(mixer);
            const action = mixer.clipAction(gltf.animations[0]);
            action.play();

            butterflyGroup.add(model);
            butterflyGroup.name = "butterfly-" + this.numOfButterflies;
            scene.add(butterflyGroup);

            this.numOfButterflies++;
        }, undefined, (error) => {
            console.error("Error loading butterfly model:", error);
        });
    }

    addButterfly() {
        const posX = Math.random() * 40 - 20;
        const posZ = Math.random() * 35 - 55;
        const scale = 1; 
        this.createButterfly(posX, posZ, scale);
    }

    removeLastButterfly() {
        if (this.numOfButterflies > 0) {
            const lastButterfly = scene.getObjectByName("butterfly-" + (this.numOfButterflies - 1));
            if (lastButterfly) {
                scene.remove(lastButterfly);
                this.numOfButterflies--;
            }
        }
    }
}
butterflyGenerator = new ButterflyGenerator();

gui.add(butterflyGenerator, 'numOfButterflies').name("Number of butterflies").listen();
gui.add(butterflyGenerator, 'addButterfly').name("Add butterfly");
gui.add(butterflyGenerator, 'removeLastButterfly').name("Remove butterfly");



function createFlower_stand(heightPrec){
	const spline = new THREE.SplineCurve ([
	 new THREE.Vector2( 2, 0),
	 new THREE.Vector2( 2.5, 1),
	 new THREE.Vector2( 2.5, 2),
	 new THREE.Vector2( 2.5, 3),
	 new THREE.Vector2( 2, 4),
	 new THREE.Vector2( 1.5, 5),
	 new THREE.Vector2( 1, 6)
	]);
	const vertices = spline.getPoints( heightPrec );
   
	const latheGeom = new THREE.LatheGeometry(vertices);
   
	const materials = [
	 new THREE.MeshPhongMaterial( { opacity:0.5, color: 0x93cdff, transparent:true, side:THREE.DoubleSide} ),
	 new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: false } )
	];
   
	let mesh = createMultiMaterialObject(latheGeom,materials);
	mesh.children.forEach(function(e) {
	 e.castShadow=true;
	});
   
	return mesh;
   }






// Renderer object and features
function createRenderer(){
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	// Set texture color space
      renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.setSize(mainContainer.clientWidth, mainContainer.clientHeight);
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap; // THREE.BasicShadowMap | THREE.PCFShadowMap | THREE.PCFSoftShadowMap
        mainContainer.appendChild( renderer.domElement );
}




// Animations
function update(){
	const delta = clock.getDelta();
    for (const mixer of mixers) {
        mixer.update(delta);
    }

   
    TWEEN.update();

	/*if (typeof car !== 'undefined'){
		if (moveStep<800){
		 car.position.z-=0.01;
		 moveStep++;
		} else if (moveStep<1600){
		 car.position.z +=0.01
		 moveStep++;
		} else {
		 moveStep = 0;
		}
	   }

	   
	   if (typeof wheel_1 !== 'undefined') {
		rotateStep -= menuParams.rotateSpeed/10000;
		wheel_1.rotation.x= rotateStep;
	   }
	  
	   if (typeof wheel_2 !== 'undefined') {
		rotateStep -= menuParams.rotateSpeed/10000;
		wheel_2.rotation.x= rotateStep;
	   }
	  
	   if (typeof wheel_3 !== 'undefined') {
		rotateStep -= menuParams.rotateSpeed/10000;
		wheel_3.rotation.x= rotateStep;
	   }
	  
	   if (typeof wheel_4 !== 'undefined') {
		rotateStep -= menuParams.rotateSpeed/10000;
		wheel_4.rotation.x= rotateStep;
	   }

	if ( controlsEnabled ) {
			time = performance.now();
			delta = ( time - prevTime ) / 1000;
		velocity.x -= velocity.x * 10.0 * delta;
		velocity.z -= velocity.z * 10.0 * delta;
		velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass
		if ( moveForward ) velocity.z -= 150.0 * delta;
		if ( moveBackward ) velocity.z += 150.0 * delta;
		if ( moveLeft ) velocity.x -= 150.0 * delta;
		if ( moveRight ) velocity.x += 150.0 * delta;
		camControls.getObject().translateX( velocity.x * delta );
		camControls.getObject().translateZ( velocity.z * delta );
			if ( camControls.getObject().position.y < 10 ) {
				velocity.y = 0;
				camControls.getObject().position.y = 5;
				canJump = true;
			}
			prevTime = time;
			}
	*/	
	
	TWEEN.update();

}









function init(){
  // https://threejs.org/docs/index.html#manual/en/introduction/Color-management
  THREE.ColorManagement.enabled = true;
  
  // Create scene
  createScene();

  // FPS counter
  createStats();
  
  // Create camera:
  createPerspectiveCamera();
  
  // Create interactive controls:	
  createControls();
  
  // Create meshes and other visible objects:
  //createAxes();
  createPlane();
  createHouse();
  createWindowFrames();
  createWater();
  createWater1();
  createTree();
  createWheel();
  //createMattress();
  createTree1();
  //createGhost();
  //createSpider();
  createSpiderWeb();
  //createPumpkin() ;

  //createCar();
 //createSnow();
 //animateSnow();
 createDodge();
 //createCarControlGUI()
 createSound();
 toggleSound();

 let flower_stand=createFlower_stand();
 flower_stand.position.set(28,0,0);
 flower_stand.scale.set(0.7, 0.7, 0.7);
 flower_stand.name="flower";
 scene.add(flower_stand);

 

  // Create lights:	
  createDirectionalLight();
  createSpotLight();
  createAmbientLight();

  // Render elements
  createRenderer();

 
  // Create animations
  renderer.setAnimationLoop( () => {
    update();
    stats.begin();
    renderer.render( scene, camera );
    stats.end();
  });

 
}

init();

// Auto resize window
window.addEventListener('resize', e => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
});


// RAYCASTING (3)
let raycaster = new THREE.Raycaster(); 
let mouse = new THREE.Vector2(); 
let intersects;

//raycasting
mainContainer.addEventListener('mousedown', e => {
    e.preventDefault();
    raycaster.setFromCamera(mouse, camera);
    intersects = raycaster.intersectObjects(scene.children, true); 

    for (var i = 0; i < intersects.length; i++) {
        if (intersects[i].object.name == "Wheel") {  
            createWater_Sound();  
            console.log("Water sounds");
        }
    }
});

mainContainer.addEventListener('mousedown', e => {
    e.preventDefault();
    raycaster.setFromCamera(mouse, camera);
    intersects = raycaster.intersectObjects(scene.children, true);

    for (let i = 0; i < intersects.length; i++) {
        if (intersects[i].object.parent.name.includes("butterfly")) {
            intersects[i].object.material.color.set(Math.random() * 0xffffff);
            console.log("Clicked to change color of butterfly");
        }
    }
});




mainContainer.addEventListener('mousemove', e => {
    mouse.x = 2 * (e.clientX / window.innerWidth) - 1;
    mouse.y = 1 - 2 * (e.clientY / window.innerHeight);
});




