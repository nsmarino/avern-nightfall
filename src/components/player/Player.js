import * as THREE from 'three';
import { acceleratedRaycast } from 'three-mesh-bvh';
THREE.Mesh.prototype.raycast = acceleratedRaycast;

import clock from "../../core/clock"

import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

import { params } from "../../core/global"
import inputHandler from '../../handlers/inputHandler';
import sceneHandler from '../../handlers/sceneHandler';
import uiHandler from '../../handlers/uiHandler';
import { getSine } from '../../helpers';

import Component from "../component";

class Player extends Component {
    constructor(gameObject) {
        super(gameObject)
        const transform = gameObject.transform
        transform.position.set( 0, 1, 0 );

        this.mesh = new THREE.Mesh(
            new RoundedBoxGeometry( 1.0, 2.0, 1.0, 10, 0.5 ),
            new THREE.MeshStandardMaterial()
        );
        this.mesh.name = gameObject.name
        transform.add(this.mesh)

        this.mesh.geometry.translate( 0, - 0.5, 0 );
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.material.shadowSide = 2;
    
        // this seems to be the "collider" bounds for the object...might need to calculate it from mesh's bounding box
        transform.capsuleInfo = {
            radius: 0.5,
            segment: new THREE.Line3( new THREE.Vector3(), new THREE.Vector3( 0, - 1.0, 0.0 ) )
        };

        this.camera = new THREE.PerspectiveCamera(
            75, window.innerWidth / window.innerHeight
        )
        this.cameraTarget = new THREE.Object3D()
        gameObject.transform.add(this.cameraTarget)

        this.cameraTarget.position.y += 1.5

        this.cameraTarget.add(this.camera)
        
        this.camera.position.set(0, 1, -5)
        this.camera.lookAt(this.cameraTarget.position)

        window.addEventListener( 'resize', function () {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        }.bind(this), false );

        this.originVector = new THREE.Vector3()
        this.directionVector = new THREE.Vector3()

        this.originVector.copy(transform.position)
        this.directionRaycast = new THREE.Raycaster(this.originVector, transform.getWorldDirection(this.directionVector), 0.1, 5)
        this.directionRaycast.firstHitOnly = true

        // Uncomment for helper arrow
        // this.visArrow = new THREE.ArrowHelper(this.directionRaycast.ray.direction, this.directionRaycast.ray.origin, 5, 0xff0000)
        // transform.parent.add(this.visArrow);
    
        this.isOnGround = false
        this.velocity = new THREE.Vector3();

        this.tempVector = new THREE.Vector3();
        this.tempVector2 = new THREE.Vector3();
        this.tempBox = new THREE.Box3();

        this.tempMat = new THREE.Matrix4();
        this.tempSegment = new THREE.Line3();

        this.action = null
        this.worldUpdateLocked = false

        this.update = (delta) => {    

            if (sceneHandler.getCollider() && !this.worldUpdateLocked) {
                this.handleActionInput()

                const collider = sceneHandler.getCollider()
                const physicsSteps = params.physicsSteps;

	            for ( let i = 0; i < physicsSteps; i ++ ) {
                    this.updatePlayerInWorldScene(transform, delta/physicsSteps, collider)
                }
            }
        }
    }

    handleActionInput() {
        const inputs = inputHandler.getInputs()
        if ( inputs.action ) {
            if (this.action) {
                this.lockWorldUpdate()
                this.action()
            }
        }
    }

    updatePlayerInWorldScene(transform, delta, collider) {

        const inputs = inputHandler.getInputs()

        this.velocity.y += this.isOnGround ? 0 : delta * params.gravity;
        transform.position.addScaledVector( this.velocity, delta );
    
        // HANDLE USER INPUTS:
        if ( inputs.forward ) {
            transform.translateZ(0.1)
            }
        if ( inputs.back ) {
            transform.translateZ(-0.1)
            }
        
        if ( inputs.left ) {
            transform.rotateY(0.01)
            }
        
        if ( inputs.right ) {
            transform.rotateY(-0.01)
            }
    
        if ( inputs.camUp ) {
            if (this.cameraTarget.rotation.x <= 1.15) this.cameraTarget.rotateX(0.01)
            }
    
        if ( inputs.camDown ) {
            if (this.cameraTarget.rotation.x >= -0.5) this.cameraTarget.rotateX(-0.01)
            }
        if ( inputs.jump ) {
            if (this.isOnGround) this.velocity.y = 15.0
        }

        // HANDLE SCENE COLLIDER:
        transform.updateMatrixWorld();

        // adjust player position based on collisions
        const capsuleInfo = transform.capsuleInfo;
        this.tempBox.makeEmpty();
        this.tempMat.copy( collider.matrixWorld ).invert();
        this.tempSegment.copy( capsuleInfo.segment );

        // get the position of the capsule in the local space of the collider
        this.tempSegment.start.applyMatrix4( transform.matrixWorld ).applyMatrix4( this.tempMat );
        this.tempSegment.end.applyMatrix4( transform.matrixWorld ).applyMatrix4( this.tempMat );

        // get the axis aligned bounding box of the capsule
        this.tempBox.expandByPoint( this.tempSegment.start );
        this.tempBox.expandByPoint( this.tempSegment.end );

        this.tempBox.min.addScalar( - capsuleInfo.radius );
        this.tempBox.max.addScalar( capsuleInfo.radius );

        collider.geometry.boundsTree.shapecast( {

            intersectsBounds: box => box.intersectsBox( this.tempBox ),
    
            intersectsTriangle: tri => {
    
                // check if the triangle is intersecting the capsule and adjust the
                // capsule position if it is.
                const triPoint = this.tempVector;
                const capsulePoint = this.tempVector2;
    
                const distance = tri.closestPointToSegment( this.tempSegment, triPoint, capsulePoint );
                if ( distance < capsuleInfo.radius ) {
    
                    const depth = capsuleInfo.radius - distance;
                    const direction = capsulePoint.sub( triPoint ).normalize();
    
                    this.tempSegment.start.addScaledVector( direction, depth );
                    this.tempSegment.end.addScaledVector( direction, depth );
    
                }
    
            }
    
        } );
    
        // get the adjusted position of the capsule collider in world space after checking
        // triangle collisions and moving it. capsuleInfo.segment.start is assumed to be
        // the origin of the player model.
        const newPosition = this.tempVector;
        newPosition.copy( this.tempSegment.start ).applyMatrix4( collider.matrixWorld );
    
        // check how much the collider was moved
        const deltaVector = this.tempVector2;
        deltaVector.subVectors( newPosition, transform.position );
    
        // if the player was primarily adjusted vertically we assume it's on something we should consider ground
        this.isOnGround = deltaVector.y > Math.abs( delta * this.velocity.y * 0.25 );
    
        const offset = Math.max( 0.0, deltaVector.length() - 1e-5 );
        deltaVector.normalize().multiplyScalar( offset );
    
        // adjust the player model
        transform.position.add( deltaVector );
        
        this.directionRaycast.set(transform.getWorldPosition(this.originVector), transform.getWorldDirection(this.directionVector));

        // Update helper arrow for player raycast:
        // this.visArrow.position.copy(this.directionRaycast.ray.origin)
        // this.visArrow.setDirection(this.directionRaycast.ray.direction)

        // check for gameObjects in front of the player
        const objectsIntersected = this.directionRaycast.intersectObjects( transform.parent.children );
        if (objectsIntersected.length > 0 && objectsIntersected[0].object.onPlayerCollide && objectsIntersected[0].distance < 0.5) {
            this.lockWorldUpdate()
            objectsIntersected[0].object.onPlayerCollide()
        }

        if ( objectsIntersected.length > 0 && objectsIntersected[0].object.onPlayerAction ) {
            if (this.action !==objectsIntersected[0].object.onPlayerAction) {
                this.action = objectsIntersected[0].object.onPlayerAction
                if (objectsIntersected[0].object.onPlayerLook) objectsIntersected[0].object.onPlayerLook()
            }
        } else {
            this.action = null
            if (uiHandler.activePrompt) uiHandler.clearPrompt()
        }
    
        // Did you fall through the hole in the ground?
        if ( transform.position.y < - 100 ) {
            this.velocity.set( 0, 0, 0 );
            transform.position.set( 0, 1, 0 );
        }
    }

    unlockWorldUpdate() {
        this.worldUpdateLocked = false
    }

    lockWorldUpdate() {
        this.worldUpdateLocked = true
    }

    getCamera() {
        return this.camera
    }
}

export default Player
