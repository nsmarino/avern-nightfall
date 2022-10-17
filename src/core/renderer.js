import * as THREE from 'three';
// import gui from "./gui"

const bgColor = 0x263238 / 2;

const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor( bgColor, 1 );
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputEncoding = THREE.sRGBEncoding;
document.body.appendChild( renderer.domElement );

window.addEventListener( 'resize', function () {

    renderer.setSize( window.innerWidth, window.innerHeight );

}, false );

export default renderer
