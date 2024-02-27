import * as THREE from 'three';
import { gsap } from 'gsap';
import * as dat from 'dat.gui';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import color from './color.js';
import Images from './Images.js';

export default class threeJS {
	constructor(options) {
		this.gsap = gsap.registerPlugin(ScrollTrigger);
		this.previousTime = 0;
		this.time = 0;
		this.container = options.dom;
		this.clock = new THREE.Clock();

		this.scene = new THREE.Scene();
		this.width = this.container.offsetWidth;
		this.height = this.container.offsetHeight;
		this.aspect = this.width / this.height;
		this.frustem = 2.8;

		this.camera = new THREE.OrthographicCamera(
			-this.aspect * this.frustem / 2,
			this.aspect * this.frustem / 2,
			this.frustem / 2,
			-this.frustem / 2,
			-100,
			100
		);
		this.camera.position.set(0, 0, 5);

		console.log(this.camera);

		this.renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true
		});
		this.renderer.setSize(this.width, this.height);
		this.container.appendChild(this.renderer.domElement);
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

		this.dracoloader = new DRACOLoader();
		this.dracoloader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');


		this.loader = new GLTFLoader();
		this.loader.setDRACOLoader(this.dracoloader);
		this.isPlaying = true;

		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		this.controls.update();
		this.controls.enabled = false;
		this.controls.enableDamping = true;
		this.controls.dampingFactor = 0.1;

		this.settings();
		this.initiPost();
		this.addObjects();
		this.render();
		this.resize();
		this.setupResize();

		this.model;
		this.iterator = 0;

	}

	addObjects() {

		this.texture = new THREE.TextureLoader().load(Images[0]);
		this.texture.flipY = false;
		this.texture.colorSpace = 'srgb';
		this.material = new THREE.MeshBasicMaterial({ map: this.texture });

		this.loader.load(
			'./beer5.glb',
			(glb) => {
				this.model = glb.scene.children[0];

				this.scene.add(glb.scene);
				glb.scene.children[0].material = this.material;
			},
			(xhr) => {
				console.log(xhr.loaded / xhr.total * 100 + '% loaded');
			},
			(error) => {
				console.log(error);
			}
		);

		this.leftButton = document.querySelector('.leftButton');
		this.leftButton.addEventListener('click', () => {
			this.counter = this.model.rotation.y;
			this.timeline2 = new gsap.timeline();

			this.timeline2
				.to(this.model.rotation, {
					y: this.counter + 2* (Math.PI * 2),
					z: Math.PI / 60,
					duration: 1
				})
				.to(this.model.rotation, {
					z: 0,
					duration: 0.1
				});

			this.iterator += 1;
			if (this.iterator > color.length - 1) {
				this.iterator = 0;
			}
			this.colorAndImageTimeline = new gsap.timeline();
			this.colorAndImageTimeline.to('.carosoul3D', {
				backgroundColor: color[this.iterator],
				duration: 1
			})

			//og
			this.material.map = new THREE.TextureLoader().load(Images[this.iterator]);
			this.material.map.flipY = false;
			this.material.map.colorSpace = 'srgb';

			console.log(this.model.material)

		});

		this.leftButton = document.querySelector('.rightButton');
		this.leftButton.addEventListener('click', () => {
			this.counter = this.model.rotation.y;
			this.zCounter = this.model.rotation.z;

			this.timeline1 = new gsap.timeline();
			this.timeline1
				.to(this.model.rotation, {
					y: this.counter - 2 * (Math.PI * 2),
					z: Math.PI / 60,
					duration: 1
				})
				.to(this.model.rotation, {
					z: 0,
					duration: 0.1
				});

			


			this.iterator -= 1;
			if (this.iterator < 0) {
				this.iterator = color.length - 1;
			}

			this.colorAndImageTimeline = new gsap.timeline();
			this.colorAndImageTimeline.to('.carosoul3D', {
				backgroundColor: color[this.iterator],
				duration: 1
			});
			this.material.map = new THREE.TextureLoader().load(Images[this.iterator]);
			this.material.map.flipY = false;
			this.material.map.colorSpace = 'srgb';


			

		});


	}

	settings() {
		this.settings = {
			exposure: 0.3,
			bloomThreshold: 0,
			bloomStrength: 1.1,
			bloomRadius: 1.1
		};
		this.gui = new dat.GUI();
	}

	setupResize() {
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		window.addEventListener('resize', this.resize.bind(this));
	}

	initiPost() {
		// this.axisHelper = new THREE.AxesHelper(20);
		// this.scene.add(this.axisHelper);
	}

	resize() {
		this.width = this.container.offsetWidth;
		this.height = this.container.offsetHeight;
		this.aspect = this.width / this.height;

		// this.composer.setSize(this.width, this.height);
		// this.camera.aspect = this.width / this.height;

		this.camera.left = -this.aspect * this.frustem / 2;
		this.camera.right = this.aspect * this.frustem / 2;
		this.camera.top = this.frustem / 2;
		this.camera.bottom = -this.frustem / 2;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize(this.width, this.height);
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	}

	stop() {
		this.isPlaying = false;
	}

	play() {
		if (!this.isPlaying) {
			this.render();
			this.isPlaying = true;
		}
	}

	render() {
		this.elapsedTime = this.clock.getElapsedTime();
		this.deltaTime = this.elapsedTime - this.previousTime;
		this.previousTime = this.elapsedTime;
		this.time = 0.05;

		requestAnimationFrame(this.render.bind(this));
		this.renderer.render(this.scene, this.camera);
		this.renderer.clearDepth();

		if (!this.isPlaying) return;
		this.controls.update();
	}
}
