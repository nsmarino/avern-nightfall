import * as THREE from 'three';
import { MeshBVH } from 'three-mesh-bvh'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import { params } from "../core/global"

import gameObjectsHandler from './gameObjectsHandler';

import Player from '../components/player/Player';
import PlayerData from '../components/player/PlayerData';
import CameraManager from '../components/managers/CameraManager';
import WorldInteractionTrigger from '../components/worldInteractionTrigger';
import WorldBattleTrigger from '../components/worldBattleTrigger';
import WorldSceneTrigger from '../components/worldSceneTrigger';

import Party from '../components/battle/party';
import Enemy from '../components/battle/enemy';

class SceneHandler {
    constructor() {
        this.areas = null
        
        this.worldScene = null

        this.battleScene = null

        this.worldCollider = null // levels loaded from gltf with collisions applied to them

        this.mode = "world" // world, battle...cutscene?
    }

    init(areas) {
        this.areas = areas
        this.worldScene = this.loadWorldScene(areas[0])
    }

    loadWorldScene(worldScene) {
        const scene = new THREE.Scene();

        // lights - or should lights be handled right in the gltf?
        const light = new THREE.DirectionalLight( 0xffffff, 1 );
        light.position.set( 1, 1.5, 1 ).multiplyScalar( 50 );
        light.shadow.mapSize.setScalar( 2048 );
        light.shadow.bias = - 1e-4;
        light.shadow.normalBias = 0.05;
        light.castShadow = true;

        const shadowCam = light.shadow.camera;
        shadowCam.bottom = shadowCam.left = - 30;
        shadowCam.top = 30;
        shadowCam.right = 45;

        scene.add( light );
        scene.add( new THREE.HemisphereLight( 0xffffff, 0x223344, 0.4 ) );

        // handle adding content
        this.setWorldCollider(scene, worldScene.scene, worldScene.spawns)

        return scene

    }

    // refactor this into two functions:
    // handleSceneSpawns (populate with gameObjects)
    // handleSceneGeometry (set up collisions)
    setWorldCollider(scene, gltf, spawns) {
        new GLTFLoader().load(gltf, res => {

		const gltfScene = res.scene;

		const box = new THREE.Box3();
		box.setFromObject( gltfScene );

		gltfScene.updateMatrixWorld( true );

        // Set BVH on scene geometry
		const toMerge = {};
		gltfScene.traverse( c => {
            const isSpawnLocation = c.userData.gltfExtensions.EXT_collections.collections && c.userData.gltfExtensions.EXT_collections.collections[0] === params.spawnCollectionName

            if ( isSpawnLocation ) {
                const spawn = spawns.find(s => s.id === c.name)
                //  
                if (!spawn) return;
                switch(spawn.type) {
                    case "interaction":
                        const interactionTrigger = gameObjectsHandler.createGameObject(scene, spawn.name)
                        interactionTrigger.addComponent(WorldInteractionTrigger, spawn.content, c)
                        break;
                    case "enemy":
                        const battleTrigger = gameObjectsHandler.createGameObject(scene, spawn.name)
	                    battleTrigger.addComponent(WorldBattleTrigger, spawn.battle, c)
                        break;
                    case "connection":
                        const sceneConnection = gameObjectsHandler.createGameObject(scene, spawn.name)
	                    sceneConnection.addComponent(WorldSceneTrigger, spawn.connectionId, c)
                        break;
                }
            }

            const isSceneMesh = c.isMesh && c.userData.gltfExtensions.EXT_collections.collections[0] === params.sceneMeshCollectionName

			if ( isSceneMesh ) {

				const hex = c.material.color.getHex();
				toMerge[ hex ] = toMerge[ hex ] || [];
				toMerge[ hex ].push( c );

			}

		} );

		const environment = new THREE.Group();
        environment.name = "environment"
		for ( const hex in toMerge ) {

			const arr = toMerge[ hex ];
			const visualGeometries = [];
			arr.forEach( mesh => {

				if ( mesh.material.emissive.r !== 0 ) {

					environment.attach( mesh );

				} else {

					const geom = mesh.geometry.clone();
					geom.applyMatrix4( mesh.matrixWorld );
					visualGeometries.push( geom );

				}

			} );

			if ( visualGeometries.length ) {

				const newGeom = BufferGeometryUtils.mergeBufferGeometries( visualGeometries );
				const newMesh = new THREE.Mesh( newGeom, new THREE.MeshStandardMaterial( { color: parseInt( hex ), shadowSide: 2 } ) );
				newMesh.castShadow = true;
				newMesh.receiveShadow = true;
				newMesh.material.shadowSide = 2;

				environment.add( newMesh );

			}

		}

		// collect all geometries to merge
		const geometries = [];
		environment.updateMatrixWorld( true );
		environment.traverse( c => {

			if ( c.geometry ) {

				const cloned = c.geometry.clone();
				cloned.applyMatrix4( c.matrixWorld );
				for ( const key in cloned.attributes ) {

					if ( key !== 'position' ) {

						cloned.deleteAttribute( key );

					}

				}

				geometries.push( cloned );

			}

		} );

		// create the merged geometry
		const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries( geometries, false );
		mergedGeometry.boundsTree = new MeshBVH( mergedGeometry, { lazyGeneration: false } );

		this.worldCollider = new THREE.Mesh( mergedGeometry );
        this.worldCollider.name = "worldCollider"
		this.worldCollider.material.wireframe = true;
		this.worldCollider.material.opacity = 0.5;
		this.worldCollider.material.transparent = true;

		scene.add( this.worldCollider );
		scene.add( environment );
        })
    }

    openBattleScene(stage, enemies) {
        const scene = new THREE.Scene();

        // lights
        const light = new THREE.DirectionalLight( 0xffffff, 1 );
        light.position.set( 1, 1.5, 1 ).multiplyScalar( 50 );
        light.shadow.mapSize.setScalar( 2048 );
        light.shadow.bias = - 1e-4;
        light.shadow.normalBias = 0.05;
        light.castShadow = true;

        const shadowCam = light.shadow.camera;
        shadowCam.bottom = shadowCam.left = - 30;
        shadowCam.top = 30;
        shadowCam.right = 45;

        scene.add( light );
        scene.add( new THREE.HemisphereLight( 0xffffff, 0x223344, 0.4 ) );

        const aspect = window.innerWidth / window.innerHeight;
        const d = 20;
        const orthoCamera = new THREE.OrthographicCamera( - d * aspect, d * aspect, d, - d, 1, 1000 );

        orthoCamera.position.set( 20, 20, 20 );
        orthoCamera.lookAt( 0, 5, 0 );

        scene.add( orthoCamera )
        // TODO: add "resize" eventListener for orth camera
        // handle adding battle content

        new GLTFLoader().load(stage, res => {

            const stageGLTF = res.scene;


            // this.handleSpawnPoints(stage, spawns)
            const party = gameObjectsHandler.getGameObjectByName("player").getComponent(PlayerData).getParty()
            const spawns  = [...enemies, ...party]
            stageGLTF.traverse( obj => {
                if (!obj.userData.gltfExtensions.EXT_collections.collections) return;

                const isSpawnLocation = obj.userData.gltfExtensions.EXT_collections.collections[0] === params.enemySpawnCollectionName 
                    || obj.userData.gltfExtensions.EXT_collections.collections[0] === params.partySpawnCollectionName
    
                if ( isSpawnLocation ) {
                    const spawn = spawns.find(s => s.id === obj.name)
                    if (!spawn) return;

                    switch(spawn.player) {
                        case true:
                            const party = gameObjectsHandler.createGameObject(scene, spawn.name)
                            party.addComponent(Party, spawn.content, obj)
                            break;
                        case false:
                            const enemy = gameObjectsHandler.createGameObject(scene, spawn.name)
                            enemy.addComponent(Enemy, spawn.battle, obj)
                            break;
                    }
                }
            })
            scene.add( stageGLTF )

            this.battleScene = scene
            this.mode = "battle"
            const cameraManager = gameObjectsHandler.getGameObjectByName("manager").getComponent(CameraManager)
            cameraManager.setCamera( orthoCamera )

        })
    }

    returnToWorldScene() {
        this.mode = "world"

        const playerWorldComponent = gameObjectsHandler.getGameObjectByName("player").getComponent(Player)
        playerWorldComponent.unlockWorldUpdate()
        const cameraManager = gameObjectsHandler.getGameObjectByName("manager").getComponent(CameraManager)
        cameraManager.setCamera( playerWorldComponent.camera )
    }

    getCurrentScene() {
        if (this.mode === "world") return this.worldScene
        else if (this.mode ==="battle") return this.battleScene
    }

    getCollider() {
        return this.worldCollider
    }

    getMode() {
        return this.mode
    }

    setMode({ mode }) {
        this.mode = mode
    }
    
    switchWorldStages(id) {
        const worldStageToLoad = this.areas.find(stage => stage.id === id)

        gameObjectsHandler.removeAllGameObjectsExceptPlayerAndManager()
        const player = gameObjectsHandler.getGameObjectByName("player")
        this.worldScene.remove(player.transform)


        const newScene = new THREE.Scene()

        // lights - or should lights be handled right in the gltf?
        const light = new THREE.DirectionalLight( 0xffffff, 1 );
        light.position.set( 1, 1.5, 1 ).multiplyScalar( 50 );
        light.shadow.mapSize.setScalar( 2048 );
        light.shadow.bias = - 1e-4;
        light.shadow.normalBias = 0.05;
        light.castShadow = true;

        const shadowCam = light.shadow.camera;
        shadowCam.bottom = shadowCam.left = - 30;
        shadowCam.top = 30;
        shadowCam.right = 45;

        newScene.add( light );
        newScene.add( new THREE.HemisphereLight( 0xffffff, 0x223344, 0.4 ) );

        this.worldScene = newScene

        this.worldScene.name = id
        this.worldScene.add(player.transform)

        this.setWorldCollider(this.worldScene, worldStageToLoad.scene, worldStageToLoad.spawns)

        const playerWorldComponent = gameObjectsHandler.getGameObjectByName("player").getComponent(Player)
        playerWorldComponent.unlockWorldUpdate()
        
        const cameraManager = gameObjectsHandler.getGameObjectByName("manager").getComponent(CameraManager)
        cameraManager.setCamera( playerWorldComponent.camera )

        player.transform.position.set(0,2,0)
    }
}

const sceneHandler = new SceneHandler()

export default sceneHandler